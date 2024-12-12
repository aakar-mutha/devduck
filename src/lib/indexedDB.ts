import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface ChatMessage {
  role: string;
  content: string;
}

interface Chat {
  id?: number;
  messages: ChatMessage[];
}

interface ChatDB extends DBSchema {
  chats: {
    key: number;
    value: Chat;
    indexes: { 'by-id': number };
  };
}

let dbPromise: Promise<IDBPDatabase<ChatDB>>;

export function openDatabase() {
  if (!dbPromise) {
    dbPromise = openDB<ChatDB>('ChatApp', 1, {
      upgrade(db) {
        const chatStore = db.createObjectStore('chats', { keyPath: 'id', autoIncrement: true });
        chatStore.createIndex('by-id', 'id');
      },
    });
  }
  return dbPromise;
}

export async function getAllChats(): Promise<Chat[]> {
  const db = await openDatabase();
  return db.getAll('chats');
}

export async function getChat(id: number): Promise<Chat | undefined> {
  const db = await openDatabase();
  return db.get('chats', id);
}

export async function saveChat(chat: Chat): Promise<number> {
  const db = await openDatabase();
  return db.put('chats', chat);
}

export async function deleteChat(id: number): Promise<void> {
  const db = await openDatabase();
  return db.delete('chats', id);
}