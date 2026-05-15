'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Loader2, Shield } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { GlassmorphismCard } from '@/components/layout/glassmorphism-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { FadeIn } from '@/components/shared/page-transition';
import type { ChatMessage } from '@/types';

const SUGGESTED_QUESTIONS = [
  'How can I stay safe while walking alone at night?',
  'What should I do if I feel I\'m being followed?',
  'Tips for using ride-sharing safely',
  'Emergency resources in my area',
];

export default function ChatPage() {
  const { getAuthHeaders } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          message: text,
          history: messages,
        }),
      });

      if (!response.ok) throw new Error('Chat request failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let assistantMessage = '';

      // Add empty assistant message
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                assistantMessage += parsed.text;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: 'assistant',
                    content: assistantMessage,
                  };
                  return updated;
                });
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I apologize, but I\'m having trouble connecting. For immediate emergencies, please use the SOS button or call local emergency services.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="AI Safety Assistant" />

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 ? (
            <FadeIn>
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  ShieldHer AI Assistant
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Ask me anything about personal safety, self-defense tips, or emergency procedures.
                </p>

                <div className="space-y-2">
                  {SUGGESTED_QUESTIONS.map((question, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => sendMessage(question)}
                      className="w-full text-left p-3 rounded-lg bg-secondary/50 hover:bg-secondary text-sm text-foreground transition-colors"
                    >
                      {question}
                    </motion.button>
                  ))}
                </div>
              </div>
            </FadeIn>
          ) : (
            messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                <GlassmorphismCard
                  variant={message.role === 'user' ? 'strong' : 'default'}
                  className={`max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-primary/20 border-primary/30'
                      : ''
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </GlassmorphismCard>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-foreground" />
                  </div>
                )}
              </motion.div>
            ))
          )}

          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <GlassmorphismCard className="py-3 px-4">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </GlassmorphismCard>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border/50 bg-background/80 backdrop-blur-lg mb-16">
          <div className="flex gap-2 max-w-lg mx-auto">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about safety tips..."
              className="flex-1 bg-secondary/50"
              disabled={isLoading}
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
