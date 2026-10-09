import React, { useMemo } from 'react';
import { marked } from 'marked';
import { cn } from '../../lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  const html = useMemo(() => {
    try {
      return marked.parse(content || '', {
        breaks: true,
        gfm: true,
      }) as string;
    } catch {
      return content || '';
    }
  }, [content]);

  return (
    <div
      className={cn(
        'markdown-content text-xs sm:text-[13px] leading-relaxed text-[#2C241D] space-y-2',
        '[&_h1]:text-sm [&_h1]:font-bold [&_h1]:text-[#1A1A1A] [&_h1]:mt-2 [&_h1]:mb-1',
        '[&_h2]:text-xs [&_h2]:font-bold [&_h2]:text-[#1A1A1A] [&_h2]:mt-2 [&_h2]:mb-1',
        '[&_h3]:text-xs [&_h3]:font-bold [&_h3]:text-[#0047AB] [&_h3]:mt-1.5 [&_h3]:mb-0.5',
        '[&_p]:leading-relaxed [&_p]:my-1',
        '[&_strong]:font-semibold [&_strong]:text-[#1A1A1A]',
        '[&_em]:italic [&_em]:text-[#4A3E34]',
        '[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_ul]:my-1.5',
        '[&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:space-y-1 [&_ol]:my-1.5',
        '[&_li]:leading-relaxed',
        '[&_code]:font-mono [&_code]:text-[11px] [&_code]:bg-[#FAF3EA] [&_code]:text-[#0047AB] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:border [&_code]:border-[#E5D7C5]',
        '[&_pre]:bg-[#1A1A1A] [&_pre]:text-cyan-300 [&_pre]:p-3 [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-black/20 [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:text-cyan-300 [&_pre_code]:border-none [&_pre_code]:p-0',
        '[&_blockquote]:border-l-2 [&_blockquote]:border-[#0047AB] [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-[#6E6258] [&_blockquote]:my-1.5',
        '[&_table]:w-full [&_table]:border-collapse [&_table]:text-[11px] [&_table]:my-2',
        '[&_th]:border [&_th]:border-[#E5D7C5] [&_th]:bg-[#FAF3EA] [&_th]:p-1.5 [&_th]:font-bold [&_th]:text-left',
        '[&_td]:border [&_td]:border-[#E5D7C5] [&_td]:p-1.5',
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
