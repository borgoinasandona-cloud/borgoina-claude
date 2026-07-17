"use client";

import { useState, type ReactNode } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import { ImageUploader, type CloudinaryUploadResult } from "@/components/ImageUploader";

const TOOLBAR_BUTTON_CLASS =
  "inline-flex items-center rounded px-2 py-1 text-sm font-medium text-neutral-700 hover:bg-neutral-200 disabled:opacity-40 disabled:hover:bg-transparent";

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`${TOOLBAR_BUTTON_CLASS} ${active ? "bg-green-700 text-white hover:bg-green-800" : ""}`}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue: string;
}) {
  // Forza un re-render su ogni modifica/selezione: serve sia per l'hidden input
  // (che legge editor.getHTML() ad ogni render) sia per lo stato "attivo" dei bottoni.
  const [, forceRerender] = useState(0);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: { openOnClick: false } }),
      TiptapImage,
    ],
    content: defaultValue || "<p></p>",
    onUpdate: () => forceRerender((n) => n + 1),
    onSelectionUpdate: () => forceRerender((n) => n + 1),
    editorProps: {
      attributes: {
        class:
          "prose-content min-h-[280px] rounded-b-md border border-t-0 border-neutral-300 px-3 py-2 focus:outline-none",
      },
    },
  });

  function setLink() {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL del link:", previousUrl ?? "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  function insertImage(result: CloudinaryUploadResult) {
    editor?.chain().focus().setImage({ src: result.secureUrl }).run();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 rounded-t-md border border-neutral-300 bg-neutral-50 p-1.5">
        <ToolbarButton
          label="Grassetto"
          active={editor?.isActive("bold")}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          label="Corsivo"
          active={editor?.isActive("italic")}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          label="Barrato"
          active={editor?.isActive("strike")}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleStrike().run()}
        >
          <span className="line-through">S</span>
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-neutral-300" />

        <ToolbarButton
          label="Titolo 2"
          active={editor?.isActive("heading", { level: 2 })}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          label="Titolo 3"
          active={editor?.isActive("heading", { level: 3 })}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-neutral-300" />

        <ToolbarButton
          label="Elenco puntato"
          active={editor?.isActive("bulletList")}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          •—
        </ToolbarButton>
        <ToolbarButton
          label="Elenco numerato"
          active={editor?.isActive("orderedList")}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          1.—
        </ToolbarButton>
        <ToolbarButton
          label="Citazione"
          active={editor?.isActive("blockquote")}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        >
          &ldquo;&rdquo;
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-neutral-300" />

        <ToolbarButton
          label="Link"
          active={editor?.isActive("link")}
          disabled={!editor}
          onClick={setLink}
        >
          🔗
        </ToolbarButton>
        <ImageUploader
          label="🖼️"
          labelClassName={TOOLBAR_BUTTON_CLASS}
          onUploaded={insertImage}
        />

        <span className="mx-1 h-5 w-px bg-neutral-300" />

        <ToolbarButton
          label="Annulla"
          disabled={!editor?.can().undo()}
          onClick={() => editor?.chain().focus().undo().run()}
        >
          ↶
        </ToolbarButton>
        <ToolbarButton
          label="Ripeti"
          disabled={!editor?.can().redo()}
          onClick={() => editor?.chain().focus().redo().run()}
        >
          ↷
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />
      <input type="hidden" name={name} value={editor?.getHTML() ?? defaultValue} />
    </div>
  );
}
