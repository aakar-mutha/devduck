'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getChat, saveChat, updateChat } from '@/lib/indexedDB'
import { respondToMessages } from '@/components/staticAPI'
import { Send } from 'lucide-react'

interface ChatMessage {
  role: string;
  content: string;
}

interface ChatProps {
  chatId?: number;
}

export default function Chat({ chatId }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages([]);
    setInput('');
    
    if (chatId) {
      setIsLoading(true);
      getChat(chatId)
        .then(chat => {
          if (chat && chat.messages) {
            setMessages(chat.messages);
          }
        })
        .catch(error => console.error('Error loading chat:', error))
        .finally(() => setIsLoading(false));
    }
  }, [chatId])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !chatId) return
  
    const userMessage = { role: 'user', content: input }
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
  
    try {
      await saveChat({ id: chatId, messages: updatedMessages });

      const data = await respondToMessages(updatedMessages);
      const newMessages = [...updatedMessages, { role: 'assistant', content: data }]
      setMessages(newMessages)
      await saveChat({ id: chatId, messages: newMessages });
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, there was an error processing your request.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background max-h-[98vh]">
      <div className="flex-1 overflow-hidden">
        <ScrollArea ref={scrollAreaRef} className=" p-4">
          {messages.map((m, index) => (
            <div key={index} className={`mb-4 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`rounded-lg p-3 max-w-[60%] ${
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="rounded-lg p-3 bg-secondary text-secondary-foreground">
                <p>Thinking...</p>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow"
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

