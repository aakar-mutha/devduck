// import { NextResponse } from 'next/server'
// import { getChat, getAllChats, saveChat } from '@/lib/db'
// import toolManager from '@/app/tools/toolsManager';

// export const dynamicParams = false;
// export async function GET(req: Request) {
//     try {
//         const { searchParams } = new URL(req.url);
//         const id = searchParams.get('id');

//         if (id) {
//             const chat = await getChat(Number(id));
//             if (!chat) {
//                 return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
//             }
//             return NextResponse.json(chat);
//         }

//         const chats = await getAllChats();
//         return NextResponse.json(chats);
//     } catch (error) {
//         console.error('Chat API error:', error);
//         return NextResponse.json(
//             { error: 'Failed to fetch chats' },
//             { status: 500 }
//         );
//     }
// }

// export async function POST(req: Request) {
//     try {
//         const { messages, chatId } = await req.json()
   
//         // Get existing chat or create new one
//         let chat = chatId ? await getChat(chatId) : null;
//         if (!chat) {
//             chat = {
//                 messages: [],
//                 id: chatId // will be undefined for new chats
//             };
//         }

//         // Prepare the messages for the LLM - include chat history
//         const allMessages = [...chat.messages, ...messages];
//         console.log(allMessages);
//         const prompt = allMessages.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n') + '\nassistant:';
        
//         const response = toolManager.decideTool(messages, prompt);

//         if (!response) {
//             throw new Error(`HTTP error!`);
//         }

//         const result = await response
//         // Update chat with new messages
//         chat.messages = allMessages;
//         chat.messages.push({ role: 'assistant', content: result });
        
//         // Save chat and get ID
//         const savedChatId = await saveChat(chat);

//         return NextResponse.json({ 
//             message: result, 
//             chatId: savedChatId,
//             isNewChat: !chatId 
//         });

//     } catch (error) {
//         console.error('Chat API error:', error);
//         return NextResponse.json(
//             { error: 'Failed to process request' }, 
//             { status: 500 }
//         );
//     }
// }

