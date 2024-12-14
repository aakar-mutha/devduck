'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getAllChats, saveChat, deleteChat } from '@/lib/indexedDB'
import { Trash2 } from 'lucide-react';


interface Chat {
    id?: number;
    messages: { role: string; content: string }[];
}

interface SidebarProps {
    onSelectChat: (chatId: number) => void;
    selectedChatId?: number;
}

export function Sidebar({ onSelectChat, selectedChatId }: SidebarProps) {
    const [chats, setChats] = useState<Chat[]>([])
    if (selectedChatId === undefined && chats.length > 0) {
        onSelectChat(chats[0].id!)
    }
    useEffect(() => {
        loadChats()
    }, [])

    const loadChats = async () => {
        const loadedChats = await getAllChats()
        setChats(loadedChats)
        if (loadedChats.length === 0) {
            createNewChat()
        }
    }

    const createNewChat = async () => {
        const newChat: Chat = { messages: [] }
        const newChatId = await saveChat(newChat)
        setChats(prev => [...prev, { ...newChat, id: newChatId }])
        onSelectChat(newChatId)
    }

    const handleDeleteChat = async (chatId: number) => {
        await deleteChat(chatId)
        const updatedChats = chats.filter(c => c.id !== chatId)
        setChats(updatedChats)
        if (updatedChats.length === 0) {
            createNewChat()
        } else if (chatId === selectedChatId) {
            onSelectChat(updatedChats[0].id!)
        }
    }

    return (
        <div className="w-64 border-r h-screen flex flex-col max-h-screen">
            <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Chats</h2>
            </div>
            <ScrollArea className="flex-grow">
                <div className="p-4 space-y-2">
                    {chats.map((chat) => (
                        <div key={chat.id} className="flex justify-between items-center w-full">
                            <Button
                                variant={chat.id === selectedChatId ? "secondary" : "ghost"}
                                className="flex-grow justify-start"
                                onClick={() => chat.id && onSelectChat(chat.id)}
                            >
                                Chat {chat.id}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="ml-2 h-8 w-8"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (chat.id) {
                                        handleDeleteChat(chat.id);
                                    }
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </ScrollArea>
            <div className="p-4 border-t">
                <Button className="w-full" onClick={createNewChat}>New Chat</Button>
            </div>
        </div>
    )
}

