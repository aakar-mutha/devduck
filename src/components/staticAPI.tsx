import { NextResponse } from 'next/server'
import toolManager from '@/app/tools/toolsManager';
import { invoke } from "@tauri-apps/api/core";


export async function respondToMessages(allMessages: any) {
    console.log(allMessages);
    const prompt = allMessages.map((msg: any) => `${msg.role}: ${msg.content}`).join('\n') + '\nassistant:';
    return await toolManager.decideTool(allMessages, prompt)
}

export const getFromRust = async (name:string) => {
    try{
      return await invoke("get_env", { name: name })
    }catch(err){
      console.error('getFromRust', err);
    }

    return ""
  }