/**
 * Course document importer.
 *
 * Staff upload an approved PDF or Word file and the text is split into an
 * ordered online programme: headings become chapter titles, the text beneath
 * each heading becomes that chapter's reading body. Everything runs in the
 * administrator's browser — no service key, no server-side parsing worker.
 *
 * The parsers are loaded on demand so public pages never pay for them.
 */

export interface ImportedChapter {
  title: string;
  summary: string;
  body: string;
  estimated_minutes: number;
}

export interface ImportedDocument {
  chapters: ImportedChapter[];
  fileName: string;
  wordCount: number;
  warnings: string[];
}

export const IMPORT_ACCEPT = '.pdf,.docx';
export const IMPORT_MAX_BYTES = 20 * 1024 * 1024;

const WORDS_PER_MINUTE = 180;
const MAX_BODY_CHARACTERS = 50000;
const MIN_CHAPTER_WORDS = 30;

function words(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function readingMinutes(text: string): number {
  return Math.max(1, Math.round(words(text) / WORDS_PER_MINUTE));
}

function summarise(text: string): string {
  const first = text.replace(/\s+/g, ' ').trim();
  if (!first) return '';
  const sentenceEnd = first.search(/[.!?](\s|$)/);
  const sentence = sentenceEnd > 20 ? first.slice(0, sentenceEnd + 1) : first;
  return sentence.length > 220 ? `${sentence.slice(0, 217).trimEnd()}…` : sentence;
}

interface TextBlock {
  kind: 'heading' | 'paragraph' | 'list';
  text: string;
}

const HEADING_NUMBER_PATTERN = /^(\d+(\.\d+)*\.?|chapter|module|section|unit|lesson|part)\b/i;

function looksLikeHeading(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 3 || trimmed.length > 110) return false;
  if (/[.:;]$/.test(trimmed) && trimmed.length > 60) return false;
  if (HEADING_NUMBER_PATTERN.test(trimmed)) return true;
  const letters = trimmed.replace(/[^A-Za-z]/g, '');
  if (letters.length >= 4 && letters === letters.toUpperCase()) return true;
  return false;
}

/**
 * Turns a flat list of blocks into chapters, merging fragments that are too
 * short to be a useful chapter and splitting chapters that exceed the
 * database's per-chapter text limit.
 */
function assembleChapters(blocks: TextBlock[], fallbackTitle: string): ImportedChapter[] {
  const hasHeadings = blocks.some((block) => block.kind === 'heading');
  const groups: { title: string; blocks: TextBlock[] }[] = [];
  let current: { title: string; blocks: TextBlock[] } | null = null;

  if (!hasHeadings) {
    // No reliable headings: group paragraphs into readable parts.
    const parts: TextBlock[][] = [[]];
    let partWords = 0;
    for (const block of blocks) {
      if (!block.text.trim()) continue;
      parts[parts.length - 1].push(block);
      partWords += words(block.text);
      if (partWords >= 650) {
        parts.push([]);
        partWords = 0;
      }
    }
    return parts
      .filter((part) => part.some((block) => block.kind !== 'heading'))
      .map((part, index) => {
        const text = blocksToBody(part);
        return {
          title: index === 0 ? fallbackTitle : `${fallbackTitle} — part ${index + 1}`,
          summary: summarise(text),
          body: text,
          estimated_minutes: readingMinutes(text),
        };
      });
  }

  for (const block of blocks) {
    if (block.kind === 'heading') {
      if (current) groups.push(current);
      current = { title: block.text.trim(), blocks: [] };
      continue;
    }
    if (!current) {
      current = { title: fallbackTitle, blocks: [] };
    }
    current.blocks.push(block);
  }
  if (current) groups.push(current);

  const cleaned = groups
    .map((group) => ({ ...group, body: blocksToBody(group.blocks) }))
    .filter((group) => group.body.trim() || group.title !== fallbackTitle);

  // Merge very short chapters into the next one so imported decks do not
  // produce dozens of one-line "chapters".
  const merged: { title: string; body: string }[] = [];
  for (const group of cleaned) {
    const previous = merged[merged.length - 1];
    const short = words(group.body) < MIN_CHAPTER_WORDS;
    if (short && previous) {
      previous.body = `${previous.body}\n\n${group.title}\n${group.body}`.trim();
      continue;
    }
    merged.push({ title: group.title, body: group.body });
  }

  const chapters: ImportedChapter[] = [];
  for (const group of merged) {
    splitLongBody(group.body).forEach((chunk, chunkIndex) => {
      chapters.push({
        title: chunkIndex === 0 ? group.title : `${group.title} (continued)`,
        summary: summarise(chunk),
        body: chunk,
        estimated_minutes: readingMinutes(chunk),
      });
    });
  }

  return chapters.filter((chapter) => chapter.body.trim().length > 0 || chapters.length === 1);
}

function blocksToBody(blocks: TextBlock[]): string {
  return blocks
    .map((block) => block.text.trim())
    .filter(Boolean)
    .join('\n\n')
    .trim();
}

function splitLongBody(body: string): string[] {
  if (body.length <= MAX_BODY_CHARACTERS) return [body];
  const paragraphs = body.split(/\n{2,}/);
  const chunks: string[] = [];
  let buffer = '';
  for (const paragraph of paragraphs) {
    if (buffer.length + paragraph.length + 2 > MAX_BODY_CHARACTERS && buffer) {
      chunks.push(buffer.trim());
      buffer = '';
    }
    if (paragraph.length > MAX_BODY_CHARACTERS) {
      for (let index = 0; index < paragraph.length; index += MAX_BODY_CHARACTERS) {
        chunks.push(paragraph.slice(index, index + MAX_BODY_CHARACTERS).trim());
      }
      continue;
    }
    buffer += `${buffer ? '\n\n' : ''}${paragraph}`;
  }
  if (buffer.trim()) chunks.push(buffer.trim());
  return chunks.length ? chunks : [body];
}

function dedupeRunningHeaders(lines: string[]): string[] {
  if (lines.length < 8) return lines;
  const counts = new Map<string, number>();
  for (const line of lines) {
    const key = line.trim().toLowerCase();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return lines.filter((line) => (counts.get(line.trim().toLowerCase()) ?? 0) < 3);
}

/* ————————————————————————————— Word documents ————————————————————————————— */

const WORD_NAMESPACE = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

function attributeValue(element: Element | undefined, name: string): string {
  if (!element) return '';
  return element.getAttributeNS(WORD_NAMESPACE, name) ?? element.getAttribute(`w:${name}`) ?? '';
}

function wordText(element: Element): string {
  const parts: string[] = [];
  for (const node of Array.from(element.getElementsByTagNameNS(WORD_NAMESPACE, 't'))) {
    parts.push(node.textContent ?? '');
  }
  return parts.join('').replace(/\s+/g, ' ').trim();
}

function wordParagraphIsBold(paragraph: Element): boolean {
  const runs = Array.from(paragraph.getElementsByTagNameNS(WORD_NAMESPACE, 'r'));
  if (!runs.length) return false;
  return runs.every((run) => {
    const bold = run.getElementsByTagNameNS(WORD_NAMESPACE, 'b')[0];
    if (!bold) return false;
    const value = attributeValue(bold, 'val');
    return value !== '0' && value !== 'false';
  });
}

function wordParagraphStyleId(paragraph: Element): string {
  const properties = paragraph.getElementsByTagNameNS(WORD_NAMESPACE, 'pPr')[0];
  if (!properties) return '';
  return attributeValue(properties.getElementsByTagNameNS(WORD_NAMESPACE, 'pStyle')[0], 'val');
}

async function readDocx(file: File): Promise<TextBlock[]> {
  const JSZipModule = await import('jszip');
  const JSZip = JSZipModule.default;
  const archive = await JSZip.loadAsync(await file.arrayBuffer());
  const documentFile = archive.file('word/document.xml');
  if (!documentFile) throw new Error('This file is not a readable Word document.');

  const styleNames = new Map<string, string>();
  const stylesFile = archive.file('word/styles.xml');
  if (stylesFile) {
    const stylesXml = await stylesFile.async('string');
    const styles = new DOMParser().parseFromString(stylesXml, 'application/xml');
    for (const style of Array.from(styles.getElementsByTagNameNS(WORD_NAMESPACE, 'style'))) {
      const id = attributeValue(style, 'styleId');
      if (!id) continue;
      const name = attributeValue(style.getElementsByTagNameNS(WORD_NAMESPACE, 'name')[0], 'val');
      if (name) styleNames.set(id, name);
    }
  }

  const xml = await documentFile.async('string');
  const document = new DOMParser().parseFromString(xml, 'application/xml');
  const body = document.getElementsByTagNameNS(WORD_NAMESPACE, 'body')[0];
  if (!body) throw new Error('This Word document has no readable body.');

  const blocks: TextBlock[] = [];

  const pushParagraph = (paragraph: Element) => {
    const text = wordText(paragraph);
    if (!text) return;

    const styleId = wordParagraphStyleId(paragraph);
    const styleName = styleNames.get(styleId) ?? '';
    const properties = paragraph.getElementsByTagNameNS(WORD_NAMESPACE, 'pPr')[0];
    const outlineLevel = properties?.getElementsByTagNameNS(WORD_NAMESPACE, 'outlineLvl')[0];
    const isHeading =
      /^heading\s*[1-6]$/i.test(styleName) ||
      /^(title|heading ?[1-6])$/i.test(styleId) ||
      Boolean(outlineLevel && attributeValue(outlineLevel, 'val') !== '9') ||
      (wordParagraphIsBold(paragraph) && looksLikeHeading(text));

    if (isHeading) {
      blocks.push({ kind: 'heading', text });
      return;
    }
    const numbered = Boolean(properties?.getElementsByTagNameNS(WORD_NAMESPACE, 'numPr')[0]);
    blocks.push(numbered ? { kind: 'list', text: `- ${text}` } : { kind: 'paragraph', text });
  };

  const pushTable = (table: Element) => {
    const rows = Array.from(table.getElementsByTagNameNS(WORD_NAMESPACE, 'tr'))
      .map((row) =>
        Array.from(row.getElementsByTagNameNS(WORD_NAMESPACE, 'tc'))
          .map((cell) => wordText(cell))
          .filter(Boolean)
          .join(' · '),
      )
      .filter(Boolean);
    if (rows.length) blocks.push({ kind: 'list', text: rows.join('\n') });
  };

  const visit = (container: Element) => {
    for (const child of Array.from(container.children)) {
      switch (child.localName) {
        case 'p':
          pushParagraph(child);
          break;
        case 'tbl':
          pushTable(child);
          break;
        case 'sdt': {
          const content = child.getElementsByTagNameNS(WORD_NAMESPACE, 'sdtContent')[0];
          if (content) visit(content);
          break;
        }
        case 'sectPr':
          break;
        default:
          if (child.children.length) visit(child);
      }
    }
  };

  visit(body);

  if (!blocks.length) {
    const plain = wordText(body);
    if (plain) blocks.push({ kind: 'paragraph', text: plain });
  }

  return blocks;
}

/* ——————————————————————————————— PDF files ——————————————————————————————— */

interface PdfLine {
  text: string;
  size: number;
  bold: boolean;
}

async function readPdf(file: File): Promise<TextBlock[]> {
  const pdfjs = await import('pdfjs-dist');
  const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

  const document = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const lines: PdfLine[] = [];

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    const rows = new Map<number, { parts: { x: number; text: string }[]; size: number; bold: boolean }>();

    for (const item of content.items) {
      if (!('str' in item) || !item.str.trim()) continue;
      const transform = item.transform as number[];
      const y = Math.round(transform[5] * 2) / 2;
      const size = Math.abs(transform[3]) || Math.abs(transform[0]) || 10;
      const bold = /bold|black|heavy|semibold/i.test(String(item.fontName ?? ''));
      const row = rows.get(y) ?? { parts: [], size, bold };
      row.parts.push({ x: transform[4], text: item.str });
      row.size = Math.max(row.size, size);
      row.bold = row.bold || bold;
      rows.set(y, row);
    }

    for (const y of Array.from(rows.keys()).sort((a, b) => b - a)) {
      const row = rows.get(y);
      if (!row) continue;
      const text = row.parts
        .sort((a, b) => a.x - b.x)
        .map((part) => part.text)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (!text) continue;
      lines.push({ text, size: row.size, bold: row.bold });
    }
  }

  if (!lines.length) return [];

  const sizes = lines.map((line) => line.size).sort((a, b) => a - b);
  const bodySize = sizes[Math.floor(sizes.length / 2)] ?? 10;
  const texts = dedupeRunningHeaders(lines.map((line) => line.text));

  const blocks: TextBlock[] = [];
  let buffer: string[] = [];

  const flush = () => {
    const text = buffer.join(' ').replace(/\s+/g, ' ').trim();
    if (!text) return;
    if (/^[-•▪‣·]/.test(text)) blocks.push({ kind: 'list', text: text.replace(/^[-•▪‣·]\s*/, '- ') });
    else blocks.push({ kind: 'paragraph', text });
    buffer = [];
  };

  for (const line of lines) {
    if (!texts.includes(line.text)) continue;
    const isLarge = line.size >= bodySize * 1.22;
    const isHeading = isLarge || (line.bold && looksLikeHeading(line.text)) || looksLikeHeading(line.text);
    if (isHeading) {
      flush();
      blocks.push({ kind: 'heading', text: line.text });
      continue;
    }
    buffer.push(line.text);
    if (buffer.join(' ').length > 900) flush();
  }
  flush();

  return blocks;
}

/* ——————————————————————————————— Entry point ——————————————————————————————— */

export async function importCourseDocument(file: File): Promise<ImportedDocument> {
  if (file.size > IMPORT_MAX_BYTES) {
    throw new Error('The file is larger than 20 MB. Split the material and import it in parts.');
  }
  if (/\.doc$/i.test(file.name)) {
    throw new Error('Legacy .doc files are not supported. Save the document as .docx and import it again.');
  }

  const warnings: string[] = [];
  let blocks: TextBlock[];

  if (/\.pdf$/i.test(file.name) || file.type === 'application/pdf') {
    blocks = await readPdf(file);
  } else if (/\.docx$/i.test(file.name) || file.type.includes('wordprocessingml')) {
    blocks = await readDocx(file);
  } else {
    throw new Error('Upload a PDF or Word (.docx) file.');
  }

  if (!blocks.length) {
    throw new Error(
      'No selectable text was found. Scanned PDFs need to be converted to text or Word first.',
    );
  }

  const fallbackTitle = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim() || 'Introduction';
  const chapters = assembleChapters(blocks, fallbackTitle)
    .filter((chapter) => chapter.body.replace(/^#+\s.*$/gm, '').trim().length > 0);

  if (!chapters.length) {
    throw new Error('The document did not contain enough readable text to build chapters.');
  }
  if (blocks.length < 6) {
    warnings.push('Only a small amount of text was detected. Review the generated chapters before publishing.');
  }

  return {
    chapters,
    fileName: file.name,
    wordCount: chapters.reduce((total, chapter) => total + words(chapter.body), 0),
    warnings,
  };
}

/** Splits a chapter body into display paragraphs and list groups. */
export function bodyBlocks(body: string): { type: 'paragraph' | 'list'; lines: string[] }[] {
  return body
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const lines = chunk.split('\n').map((line) => line.trim()).filter(Boolean);
      const isList = lines.every((line) => /^[-•▪‣·]\s|^\d+[.)]\s/.test(line));
      return {
        type: isList ? ('list' as const) : ('paragraph' as const),
        lines: isList ? lines.map((line) => line.replace(/^[-•▪‣·]\s*/, '')) : lines,
      };
    });
}
