'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import Chat from '@/components/Chat'

export default function Home() {
  const [selectedChatId, setSelectedChatId] = useState<number | undefined>()

  const handleSelectChat = (chatId: number) => {
    setSelectedChatId(chatId)
  }

  return (
    <div className="flex h-screen">
      <Sidebar onSelectChat={handleSelectChat} selectedChatId={selectedChatId} />
      <main className="flex-grow p-4">
        {selectedChatId ? (
          <Chat chatId={selectedChatId} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-lg text-gray-500">Select a chat or create a new one</p>
          </div>
        )}
      </main>
    </div>
  )
}