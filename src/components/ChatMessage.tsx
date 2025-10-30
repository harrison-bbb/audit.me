import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
}

export const ChatMessage = ({ message, isUser, timestamp }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex w-full mb-4 animate-slide-up",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 shadow-lg",
          isUser
            ? "bg-chat-user text-chat-user-foreground ml-auto"
            : "bg-chat-bot text-chat-bot-foreground border border-border/50"
        )}
      >
        <div className="prose prose-invert prose-sm max-w-none">
          {isUser ? (
            <p className="m-0">{message}</p>
          ) : (
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="m-0 mb-2 last:mb-0">{children}</p>,
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 underline transition-colors"
                  >
                    {children}
                  </a>
                ),
                ul: ({ children }) => <ul className="my-2 ml-4">{children}</ul>,
                ol: ({ children }) => <ol className="my-2 ml-4">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                code: ({ children }) => (
                  <code className="bg-muted px-1 py-0.5 rounded text-sm">{children}</code>
                ),
              }}
            >
              {message}
            </ReactMarkdown>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
};
