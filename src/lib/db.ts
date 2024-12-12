import Database from 'better-sqlite3';
import { join } from 'path';

export interface ChatMessage {
    role: string;
    content: string;
}

export interface Chat {
    id?: number;
    messages: ChatMessage[];
}

const db = new Database(join(process.cwd(), 'chat.db'));

// Initialize database
db.exec(`
    CREATE TABLE IF NOT EXISTS chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        messages TEXT NOT NULL
    )
`);

export async function getAllChats(): Promise<Chat[]> {
    const chats = db.prepare('SELECT * FROM chats').all();
    return chats.map(chat => ({
        id: chat.id,
        messages: JSON.parse(chat.messages)
    }));
}

export async function getChat(id: number): Promise<Chat | undefined> {
    const chat = db.prepare('SELECT * FROM chats WHERE id = ?').get(id);
    if (!chat) return undefined;
    return {
        id: chat.id,
        messages: JSON.parse(chat.messages)
    };
}

export async function saveChat(chat: Chat): Promise<number> {
    if (chat.id) {
        db.prepare('UPDATE chats SET messages = ? WHERE id = ?')
            .run(JSON.stringify(chat.messages), chat.id);
        return chat.id;
    } else {
        const result = db.prepare('INSERT INTO chats (messages) VALUES (?)')
            .run(JSON.stringify(chat.messages));
        return result.lastInsertRowid as number;
    }
}

export async function deleteChat(id: number): Promise<void> {
    db.prepare('DELETE FROM chats WHERE id = ?').run(id);
}