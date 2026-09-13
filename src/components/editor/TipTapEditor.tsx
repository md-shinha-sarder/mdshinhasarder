"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Highlighter,
  Minus,
  RemoveFormatting,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export const TipTapEditor: React.FC<TipTapEditorProps> = ({
  content,
  onChange,
  placeholder = "Write your blog post content here...",
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            "text-amber-400 font-medium underline underline-offset-4 decoration-amber-400/70 hover:text-amber-300 hover:decoration-amber-300 transition-colors bg-amber-400/10 px-1 py-0.5 rounded",
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "min-h-[280px] max-h-[600px] overflow-y-auto px-4 py-3 focus:outline-none prose prose-invert max-w-none text-foreground text-base leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync content if changed externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="border border-border/60 rounded-lg p-4 min-h-[280px] bg-card/40 flex items-center justify-center text-muted-foreground">
        Loading rich text editor...
      </div>
    );
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter link URL (e.g. https://example.com):", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const toggleAmberHighlight = () => {
    editor.chain().focus().toggleHighlight({ color: "#f59e0b33" }).run();
  };

  return (
    <div className="border border-border/80 rounded-xl overflow-hidden bg-card/60 backdrop-blur-md shadow-lg transition-all focus-within:border-amber-400/50">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-secondary/40 border-b border-border/60 select-none">
        {/* Headings */}
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("heading", { level: 1 }) ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className="h-8 w-8 p-0"
          title="Heading 1"
        >
          <Heading1 size={16} />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className="h-8 w-8 p-0"
          title="Heading 2"
        >
          <Heading2 size={16} />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className="h-8 w-8 p-0"
          title="Heading 3"
        >
          <Heading3 size={16} />
        </Button>

        <div className="w-[1px] h-5 bg-border/60 mx-1" />

        {/* Formatting */}
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("bold") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="h-8 w-8 p-0"
          title="Bold (Ctrl+B)"
        >
          <Bold size={16} />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("italic") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="h-8 w-8 p-0"
          title="Italic (Ctrl+I)"
        >
          <Italic size={16} />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("strike") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className="h-8 w-8 p-0"
          title="Strikethrough"
        >
          <Strikethrough size={16} />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("code") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleCode().run()}
          className="h-8 w-8 p-0"
          title="Inline Code"
        >
          <Code size={16} />
        </Button>

        <div className="w-[1px] h-5 bg-border/60 mx-1" />

        {/* Highlight & Link with Highlight Styling */}
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("highlight") ? "secondary" : "ghost"}
          onClick={toggleAmberHighlight}
          className="h-8 px-2 text-xs gap-1 text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30"
          title="Highlight Text (Gold)"
        >
          <Highlighter size={14} /> Highlight
        </Button>

        <Button
          type="button"
          size="sm"
          variant={editor.isActive("link") ? "secondary" : "ghost"}
          onClick={setLink}
          className={`h-8 px-2 text-xs gap-1 ${
            editor.isActive("link")
              ? "text-amber-300 bg-amber-500/25 border border-amber-400/50"
              : "text-amber-400 hover:text-amber-300"
          }`}
          title="Add or Edit Link"
        >
          <LinkIcon size={14} /> Link
        </Button>

        <div className="w-[1px] h-5 bg-border/60 mx-1" />

        {/* Lists & Quotes */}
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="h-8 w-8 p-0"
          title="Bullet List"
        >
          <List size={16} />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className="h-8 w-8 p-0"
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive("blockquote") ? "secondary" : "ghost"}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className="h-8 w-8 p-0"
          title="Quote"
        >
          <Quote size={16} />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="h-8 w-8 p-0"
          title="Horizontal Rule"
        >
          <Minus size={16} />
        </Button>

        <div className="w-[1px] h-5 bg-border/60 mx-1" />

        {/* Clear & History */}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          className="h-8 w-8 p-0"
          title="Clear Formatting"
        >
          <RemoveFormatting size={15} />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="h-8 w-8 p-0"
          title="Undo (Ctrl+Z)"
        >
          <Undo size={15} />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="h-8 w-8 p-0"
          title="Redo (Ctrl+Y)"
        >
          <Redo size={15} />
        </Button>
      </div>

      {/* Editor Body */}
      <div className="relative bg-background/50">
        <EditorContent editor={editor} />
      </div>

      {/* Word and Character Count Footer */}
      <div className="flex items-center justify-between px-3 py-1.5 text-xs text-muted-foreground bg-secondary/20 border-t border-border/40">
        <span className="flex items-center gap-2">
          <span>Tip: Select any word and click <strong className="text-amber-400">Highlight</strong> or <strong className="text-amber-400">Link</strong></span>
        </span>
        <span className="text-[11px] font-mono">TipTap Editor • Edge Ready</span>
      </div>
    </div>
  );
};

export default TipTapEditor;
