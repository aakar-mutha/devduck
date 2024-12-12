import { NextResponse } from 'next/server'
import { getChat, getAllChats, saveChat } from '@/lib/db'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (id) {
            const chat = await getChat(Number(id));
            if (!chat) {
                return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
            }
            return NextResponse.json(chat);
        }

        const chats = await getAllChats();
        return NextResponse.json(chats);
    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch chats' },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const { messages, chatId } = await req.json()
        const model = process.env.LLAMA_MODEL;
   
        // Get existing chat or create new one
        let chat = chatId ? await getChat(chatId) : null;
        if (!chat) {
            chat = {
                messages: [],
                id: chatId // will be undefined for new chats
            };
        }

        // Prepare the messages for the LLM - include chat history
        const allMessages = [...chat.messages, ...messages];
        console.log(allMessages);
        const prompt = allMessages.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n') + '\nassistant:';
        
        const response = await fetch('http://127.0.0.1:1234/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [{ role: 'user', content: prompt }],
                model: model,
                max_tokens: 1000,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const assistantMessage = result.choices[0].message.content;

        // Update chat with new messages
        chat.messages = allMessages;
        chat.messages.push({ role: 'assistant', content: assistantMessage });
        
        // Save chat and get ID
        const savedChatId = await saveChat(chat);

        return NextResponse.json({ 
            message: assistantMessage, 
            chatId: savedChatId,
            isNewChat: !chatId 
        });

    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: 'Failed to process request' }, 
            { status: 500 }
        );
    }
}