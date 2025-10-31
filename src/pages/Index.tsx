import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import BBBLogo from "@/assets/BBB_Logo_Minimal_White.png";
import { useAuth } from "@/contexts/AuthContext";
import EmailGate from "@/components/EmailGate";
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}
const Index = () => {
  const { email, sessionId, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);
  const handleNewChat = () => {
    setMessages([]);
    setInputMessage("");
    toast.success("New chat started");
  };
  const sendMessage = async (message: string) => {
    try {
      const response = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          sessionId,
          email,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send message");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Chat error:", error);
      throw error;
    }
  };
  const handleSendMessage = async (messageText: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const data = await sendMessage(messageText);
      setIsTyping(false);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || "I received your message!",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setIsTyping(false);
      toast.error("Failed to send message. Please try again.");
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting right now. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };
  return (
    <>
      {!isAuthenticated && <EmailGate />}
      <div className="flex flex-col h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <a href="https://blackboxbots.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src={BBBLogo} alt="BBB Logo" className="h-8 w-auto" />
          </a>
          
          <Button onClick={handleNewChat} variant="outline" size="sm" className="gap-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm border-white/20 hover:border-white/30">
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 ? <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center animate-fade-in">
              <img src={BBBLogo} alt="BBB Logo" className="h-16 w-auto mb-8 opacity-60" />
              <h2 className="text-3xl font-bold mb-3 text-white">Welcome to BBB Audit Bot</h2>
              <p className="text-muted-foreground text-lg max-w-md mb-8">
                Your intelligent assistant powered by BlackBoxBots
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl w-full px-4">
                {[
                  "Client reporting takes forever",
                  "Lead data entry is killing us",
                  "We're drowning in client onboarding",
                  "Managing ad campaigns manually",
                  "Proposal creation is too slow",
                  "Tracking project time is a mess"
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSendMessage(prompt)}
                    disabled={isTyping}
                    className="px-4 py-3 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-foreground hover:border-white/30 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div> : <>
              {messages.map(message => <ChatMessage key={message.id} message={message.text} isUser={message.isUser} timestamp={message.timestamp} />)}
              
              {isTyping && <TypingIndicator />}
            </>}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

        {/* Input Area */}
        <ChatInput 
          onSend={handleSendMessage} 
          disabled={isTyping}
          value={inputMessage}
          onChange={setInputMessage}
        />
      </div>
    </>
  );
};
export default Index;