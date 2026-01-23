import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { useEffect } from 'react';
import TurndownService from 'turndown';
import { marked } from 'marked';

interface RichTextEditorProps {
  value: string; // Markdown content
  onChange: (markdown: string) => void;
  placeholder?: string;
  className?: string;
}

// Initialize Turndown for HTML to Markdown conversion
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

// Configure marked for Markdown to HTML conversion
marked.setOptions({
  breaks: true,
  gfm: true,
});

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none min-h-[600px] p-6 bg-background rounded-lg border',
      },
    },
    onUpdate: ({ editor }) => {
      // Convert HTML to Markdown when content changes
      const html = editor.getHTML();
      const markdown = turndownService.turndown(html);
      onChange(markdown);
    },
  });

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== undefined) {
      const currentMarkdown = turndownService.turndown(editor.getHTML());
      
      // Only update if the markdown is different to avoid cursor jumping
      if (currentMarkdown !== value) {
        try {
          // Convert markdown to HTML
          const html = marked.parse(value) as string;
          editor.commands.setContent(html);
        } catch (error) {
          console.error('Failed to parse markdown:', error);
          editor.commands.setContent(value);
        }
      }
    }
  }, [editor, value]);

  if (!editor) {
    return <div className="min-h-[600px] p-6 bg-muted rounded-lg border animate-pulse">Loading editor...</div>;
  }

  return (
    <div className={className}>
      <EditorContent editor={editor} />
    </div>
  );
}
