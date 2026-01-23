import { useEditor, EditorContent, Editor } from '@tiptap/react';
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

// Toolbar component
function EditorToolbar({ editor }: { editor: Editor }) {
  if (!editor) return null;

  return (
    <div className="border-b bg-muted/30 p-2 flex flex-wrap gap-1 rounded-t-lg">
      {/* Text Formatting */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          editor.isActive('bold')
            ? 'bg-primary text-primary-foreground'
            : 'bg-background hover:bg-accent'
        }`}
        title="Bold (Ctrl+B)"
      >
        <strong>B</strong>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-3 py-1.5 rounded text-sm font-medium italic transition-colors ${
          editor.isActive('italic')
            ? 'bg-primary text-primary-foreground'
            : 'bg-background hover:bg-accent'
        }`}
        title="Italic (Ctrl+I)"
      >
        I
      </button>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Headings */}
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          editor.isActive('heading', { level: 1 })
            ? 'bg-primary text-primary-foreground'
            : 'bg-background hover:bg-accent'
        }`}
        title="Heading 1"
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          editor.isActive('heading', { level: 2 })
            ? 'bg-primary text-primary-foreground'
            : 'bg-background hover:bg-accent'
        }`}
        title="Heading 2"
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          editor.isActive('heading', { level: 3 })
            ? 'bg-primary text-primary-foreground'
            : 'bg-background hover:bg-accent'
        }`}
        title="Heading 3"
      >
        H3
      </button>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          editor.isActive('bulletList')
            ? 'bg-primary text-primary-foreground'
            : 'bg-background hover:bg-accent'
        }`}
        title="Bullet List"
      >
        • List
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          editor.isActive('orderedList')
            ? 'bg-primary text-primary-foreground'
            : 'bg-background hover:bg-accent'
        }`}
        title="Numbered List"
      >
        1. List
      </button>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Table */}
      <button
        onClick={() =>
          editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        }
        className="px-3 py-1.5 rounded text-sm font-medium bg-background hover:bg-accent transition-colors"
        title="Insert Table (3x3)"
      >
        ⊞ Table
      </button>
    </div>
  );
}

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
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
