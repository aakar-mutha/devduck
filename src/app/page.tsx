'use client'

import { useState, useEffect } from 'react'
import Chat from '@/components/Chat'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getAllChats, saveChat, updateChat } from '@/lib/indexedDB'

interface Chat {
  id?: number;
  messages: { role: string; content: string }[];
}

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChatId, setSelectedChatId] = useState<number | undefined>()

  useEffect(() => {
    loadChats()
  }, [])

  const loadChats = async () => {
    try {
      const loadedChats = await getAllChats();
      setChats(loadedChats);
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  }

  const createNewChat = async () => {
    const newChat: Chat = { messages: [] }
    const newChatId = await saveChat(newChat)
    setChats(prev => [...prev, { ...newChat, id: newChatId }])
    setSelectedChatId(newChatId)
  }

  const updateChatMessages = async (chatId: number, messages: { role: string; content: string }[]) => {
    const updatedChat = chats.find(chat => chat.id === chatId);
    if (updatedChat) {
      updatedChat.messages = messages;
      await updateChat(updatedChat);
      setChats(prev => prev.map(chat => chat.id === chatId ? updatedChat : chat));
    }
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/4 p-4 border-r">
        <h2 className="text-2xl font-bold mb-4">Chats</h2>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          {chats.map((chat) => (
            <Button 
              key={chat.id} 
              variant="ghost" 
              className="w-full justify-start mb-2"
              onClick={() => setSelectedChatId(chat.id)}
            >
              Chat #{chat.id}
            </Button>
          ))}
        </ScrollArea>
        <Button className="w-full mt-4" onClick={createNewChat}>New Chat</Button>
      </div>
      <div className="w-3/4 p-4">
        <Chat chatId={selectedChatId} updateChatMessages={updateChatMessages} />
      </div>
    </div>
  )
}
