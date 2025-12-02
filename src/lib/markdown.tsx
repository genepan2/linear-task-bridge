/**
 * Markdown rendering components for react-markdown
 * Provides styled components for markdown elements
 */

import type { HTMLAttributes } from 'react';

// Simple props types for HTML elements
type ComponentPropsWithoutNode<_T extends keyof React.JSX.IntrinsicElements> = HTMLAttributes<HTMLElement>;

/**
 * Custom components for react-markdown
 * Provides Tailwind CSS styling for markdown elements
 */
export const markdownComponents = {
  // Headings
  h1: ({ ...props }: ComponentPropsWithoutNode<'h1'>) => (
    <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />
  ),
  h2: ({ ...props }: ComponentPropsWithoutNode<'h2'>) => (
    <h2 className="text-2xl font-bold mt-5 mb-3" {...props} />
  ),
  h3: ({ ...props }: ComponentPropsWithoutNode<'h3'>) => (
    <h3 className="text-xl font-bold mt-4 mb-2" {...props} />
  ),

  // Paragraphs
  p: ({ ...props }: ComponentPropsWithoutNode<'p'>) => (
    <p className="mb-4 leading-relaxed" {...props} />
  ),

  // Lists
  ul: ({ ...props }: ComponentPropsWithoutNode<'ul'>) => (
    <ul className="list-disc list-inside mb-4 space-y-1" {...props} />
  ),
  ol: ({ ...props }: ComponentPropsWithoutNode<'ol'>) => (
    <ol className="list-decimal list-inside mb-4 space-y-1" {...props} />
  ),
  li: ({ ...props }: ComponentPropsWithoutNode<'li'>) => (
    <li className="ml-4" {...props} />
  ),

  // Links
  a: ({ ...props }: ComponentPropsWithoutNode<'a'>) => (
    <a
      className="text-blue-600 hover:text-blue-800 underline"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),

  // Code
  code: ({ inline, ...props }: ComponentPropsWithoutNode<'code'> & { inline?: boolean }) => {
    if (inline) {
      return (
        <code
          className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono"
          {...props}
        />
      );
    }
    return (
      <code
        className="block bg-gray-100 text-gray-800 p-4 rounded-lg overflow-x-auto text-sm font-mono"
        {...props}
      />
    );
  },

  pre: ({ ...props }: ComponentPropsWithoutNode<'pre'>) => (
    <pre className="mb-4 overflow-x-auto" {...props} />
  ),

  // Blockquotes
  blockquote: ({ ...props }: ComponentPropsWithoutNode<'blockquote'>) => (
    <blockquote
      className="border-l-4 border-gray-300 pl-4 italic text-gray-700 mb-4"
      {...props}
    />
  ),

  // Tables
  table: ({ ...props }: ComponentPropsWithoutNode<'table'>) => (
    <div className="overflow-x-auto mb-4">
      <table className="min-w-full divide-y divide-gray-200" {...props} />
    </div>
  ),
  thead: ({ ...props }: ComponentPropsWithoutNode<'thead'>) => (
    <thead className="bg-gray-50" {...props} />
  ),
  tbody: ({ ...props }: ComponentPropsWithoutNode<'tbody'>) => (
    <tbody className="bg-white divide-y divide-gray-200" {...props} />
  ),
  tr: ({ ...props }: ComponentPropsWithoutNode<'tr'>) => (
    <tr {...props} />
  ),
  th: ({ ...props }: ComponentPropsWithoutNode<'th'>) => (
    <th
      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
      {...props}
    />
  ),
  td: ({ ...props }: ComponentPropsWithoutNode<'td'>) => (
    <td className="px-4 py-2 text-sm text-gray-900" {...props} />
  ),

  // Horizontal rule
  hr: ({ ...props }: ComponentPropsWithoutNode<'hr'>) => (
    <hr className="my-6 border-gray-300" {...props} />
  ),

  // Strong/Bold
  strong: ({ ...props }: ComponentPropsWithoutNode<'strong'>) => (
    <strong className="font-bold" {...props} />
  ),

  // Emphasis/Italic
  em: ({ ...props }: ComponentPropsWithoutNode<'em'>) => (
    <em className="italic" {...props} />
  ),
};
