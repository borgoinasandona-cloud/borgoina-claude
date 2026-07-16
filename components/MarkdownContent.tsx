import ReactMarkdown from "react-markdown";

export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose-content">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
