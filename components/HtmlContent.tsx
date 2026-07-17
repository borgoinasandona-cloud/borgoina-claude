import sanitizeHtml from "sanitize-html";

// Sottoinsieme di tag/attributi che l'editor WYSIWYG (Tiptap) può effettivamente produrre.
const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "s",
    "strike",
    "u",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "blockquote",
    "a",
    "img",
    "code",
    "pre",
    "hr",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "title"],
  },
  allowedSchemes: ["http", "https", "mailto"],
};

export function HtmlContent({ content }: { content: string }) {
  const clean = sanitizeHtml(content, SANITIZE_OPTIONS);
  return <div className="prose-content" dangerouslySetInnerHTML={{ __html: clean }} />;
}
