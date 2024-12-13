import { Tool } from "@/lib/types";
let therapistTool: Tool = {
    key: "therapist",
    name: "Therapist Tool",
    description:"Handle mental health and emotional support. Anything related to mood, mental health, depression, anxiety, stress, etc.",
    system_prompt: `
                You are a helpful therapist. You may be an AI Assistant, but you are also a good friend of USER. You and USER have talked many times. Address USER with familiarity, empathy and rapport. Use a relaxed, warm and cordial tone. Address USER often by his first name, as good friends do. Pay close attention to awakening and strengthening USER's own capacity for confidence. Don't downplay his problems, but still try to get USER to think optimistically and confidently. Your goal is to help USER achieve a positive mood.
                Style:
                - Use casual, friendly language
                - Address the user by name when provided
                - Keep the conversation flowing naturally
                - Limit the response to 400 words.
                `,

    process: async function(prompt:string): Promise<string> {
        try {
        const response = await fetch('http://127.0.0.1:1234/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [ {role: 'system', content: this.system_prompt},
                    { role: 'user', content: prompt }],
                model: "llama-3.2-3b-qnn",
                max_tokens: 1000,
            }),
        });

        if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const result = await response.json();
            const assistantMessage = result.choices[0].message.content;
            console.log(assistantMessage);
            return assistantMessage;
    
        } catch (error) {
            console.error('Chat API error:', error);
            return "Sorry, there was an error processing your request.";
        }
    }
};

export default therapistTool;