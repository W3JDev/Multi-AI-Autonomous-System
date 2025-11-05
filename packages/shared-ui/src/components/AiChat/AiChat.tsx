import * as React from "react";
import { cn } from "../../lib/utils";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
}

export interface ChatMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  message: ChatMessage;
}

export function ChatMessageComponent({ message, className, ...props }: ChatMessageProps) {
  const isUser = message.role === "user";
  
  return (
    <div
      className={cn(
        "flex mb-4",
        isUser ? "justify-end" : "justify-start",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        {message.timestamp && (
          <p className="text-xs opacity-70 mt-1">
            {message.timestamp.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}

export interface ChatInputProps extends React.HTMLAttributes<HTMLDivElement> {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({
  onSend,
  placeholder = "Type a message...",
  disabled = false,
  className,
  ...props
}: ChatInputProps) {
  const [input, setInput] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input);
      setInput("");
    }
  };

  return (
    <div className={cn("border-t bg-background p-4", className)} {...props}>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export interface ChatInterfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export function ChatInterface({
  messages,
  onSendMessage,
  isLoading = false,
  className,
  ...props
}: ChatInterfaceProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      className={cn("flex flex-col h-full border rounded-lg bg-background", className)}
      {...props}
    >
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <ChatMessageComponent key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-muted rounded-lg px-4 py-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce delay-100" />
                <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSend={onSendMessage} disabled={isLoading} />
    </div>
  );
}
