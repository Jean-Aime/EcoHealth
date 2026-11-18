import { supabase } from '@/lib/supabase';
import type { TrainingResult } from '@/lib/training';

const unavailable = 'The training service is not connected for this website.';
const loadFailed = 'Learning content could not be loaded. Please try again.';
const saveFailed = 'The change could not be saved. Check your connection and permissions, then try again.';

const migrationRequired =
  'Online learning is not enabled in the database yet. Apply the 20261118103000_online_learning migration in Supabase, then reload this page.';

function message(error: { message: string; code?: string } | null, fallback = saveFailed): string {
  if (!error) return fallback;
  // PGRST202/205: the function or table does not exist yet (migration not applied).
  if (error.code === 'PGRST202' || error.code === 'PGRST205') return migrationRequired;
  const known = [
    'Online learning requires',
    'Online chapter completion',
    'Add at least one published chapter',
    'Completion can only be required',
    'Restore the course before',
    'This chapter is not published',
    'This online course is not available',
    'Administrator access is required',
    'A course can have at most',
    'needs a title between',
    'has too much text',
  ];
  return known.find((part) => error.message.includes(part)) ? error.message : fallback;
}

export interface CourseChapterOutline {
  id: string;
  course_id: string;
  position: number;
  title: string;
  summary: string;
  estimated_minutes: number;
  published: boolean;
}

export interface LearningChapter {
  id: string;
  position: number;
  title: string;
  summary: string;
  body: string;
  estimated_minutes: number;
  published: boolean;
  completed_at: string | null;
}

export interface LearningCourse {
  course: {
    id: string;
    slug: string;
    title: string;
    summary: string;
    online_enabled: boolean;
    require_online_completion: boolean;
    requires_assessment: boolean;
    passing_score: number;
  };
  chapters: LearningChapter[];
  completed_count: number;
  chapter_count: number;
  course_completed_at: string | null;
}

export interface MyLearningCourse {
  course_id: string;
  slug: string;
  title: string;
  summary: string;
  chapter_count: number;
  completed_count: number;
  last_activity_at: string | null;
  course_completed_at: string | null;
  require_online_completion: boolean;
}

export interface OnlineLearningReportRow {
  course_id: string;
  course_title: string;
  published: boolean;
  online_enabled: boolean;
  chapter_count: number;
  learner_count: number;
  completed_count: number;
  last_activity_at: string | null;
}

export interface ProgressResult {
  chapter_id: string;
  completed: boolean;
  completed_count: number;
  chapter_count: number;
  course_completed_at: string | null;
}

/**
 * Public outline. Chapter text is not exposed to the catalogue; only the
 * titles, summaries and timings that describe the programme.
 */
export async function fetchCourseOutline(courseId: string): Promise<TrainingResult<CourseChapterOutline[]>> {
  if (!supabase) return { data: [], error: unavailable };
  const { data, error } = await supabase
    .from('training_chapters')
    .select('id,course_id,position,title,summary,estimated_minutes,published')
    .eq('course_id', courseId)
    .eq('published', true)
    .order('position');
  if (error) return { data: [], error: error.code === 'PGRST205' ? migrationRequired : loadFailed };
  return { data: (data ?? []) as CourseChapterOutline[], error: null };
}

export async function fetchLearningCourse(courseId: string): Promise<TrainingResult<LearningCourse | null>> {
  if (!supabase) return { data: null, error: unavailable };
  const { data, error } = await supabase.rpc('get_learning_course', { p_course_id: courseId });
  if (error) return { data: null, error: message(error, error.message) };
  const payload = data as LearningCourse | null;
  if (!payload) return { data: null, error: loadFailed };
  return { data: payload, error: null };
}

export async function markChapterComplete(
  chapterId: string,
  completed: boolean,
): Promise<TrainingResult<ProgressResult | null>> {
  if (!supabase) return { data: null, error: unavailable };
  const { data, error } = await supabase.rpc('mark_chapter_complete', {
    p_chapter_id: chapterId,
    p_completed: completed,
  });
  if (error) return { data: null, error: message(error, error.message) };
  return { data: data as ProgressResult, error: null };
}

export async function getMyLearningCourses(): Promise<TrainingResult<MyLearningCourse[]>> {
  if (!supabase) return { data: [], error: unavailable };
  const { data, error } = await supabase.rpc('get_my_learning_courses');
  if (error) return { data: [], error: loadFailed };
  return { data: (data ?? []) as MyLearningCourse[], error: null };
}

export interface ChapterPayload {
  id?: string;
  title: string;
  summary: string;
  body: string;
  estimated_minutes: number;
  published: boolean;
  source_document?: string;
}

export async function saveCourseChapters(
  courseId: string,
  chapters: ChapterPayload[],
): Promise<string | null> {
  if (!supabase) return unavailable;
  const { error } = await supabase.rpc('save_course_chapters', {
    p_course_id: courseId,
    p_chapters: chapters,
  });
  return error ? message(error, error.message) : null;
}

export async function setCourseOnlineSettings(
  courseId: string,
  onlineEnabled: boolean,
  requireCompletion: boolean,
): Promise<string | null> {
  if (!supabase) return unavailable;
  const { error } = await supabase.rpc('set_course_online_settings', {
    p_course_id: courseId,
    p_online_enabled: onlineEnabled,
    p_require_completion: requireCompletion,
  });
  return error ? message(error, error.message) : null;
}

export async function fetchOnlineLearningReport(): Promise<TrainingResult<OnlineLearningReportRow[]>> {
  if (!supabase) return { data: [], error: unavailable };
  const { data, error } = await supabase.rpc('get_online_learning_report');
  if (error) return { data: [], error: error.code === 'PGRST202' ? migrationRequired : loadFailed };
  return { data: (data ?? []) as OnlineLearningReportRow[], error: null };
}
