'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getChat,saveChat,updateChat } from '@/lib/indexedDB'
import { respondToMessages } from '@/components/staticAPI'

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
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Chat {chatId ? `#${chatId}` : ''}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[60vh] pr-4">
        {messages.map((m, index) => (
          <div key={index} className={`mb-4 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span 
              className={`inline-block p-2 rounded-lg whitespace-pre-wrap ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
            >
              {m.content}
            </span>
          </div>
        ))}

          {isLoading && (
            <div className="text-center">
              <span className="inline-block p-2 rounded-lg bg-muted">Thinking...</span>
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow"
          />
          <Button type="submit" disabled={isLoading}>Send</Button>
        </form>
      </CardFooter>
    </Card>
  )
}