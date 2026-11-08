import { useReveal } from '@/lib/useReveal';

export function Reveal({
  children,
  delay,
  className,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  delay?: 1 | 2 | 3 | 4 | 5;
  className?: string;
  as?: React.ElementType;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const delayClass = delay ? `reveal-delay-${delay}` : '';
  return (
    <Tag
      ref={ref}
      className={`reveal ${delayClass} ${visible ? 'is-visible' : ''} ${className ?? ''}`}
    >
      {children}
    </Tag>
  );
}
