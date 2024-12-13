import { Tool } from "@/lib/types";
import { getFromRust } from "@/components/staticAPI";

let internetSearchTool: Tool = {
    key: "internet_search",
    name: "Internet Search Tool",
    description:"Search the internet for current information, facts, news and interesting topics using Perplexity API, not for technical help.",
    system_prompt: `
                You are an internet research specialist who provides up-to-date information from the web.
                Your responses should be:
                - Factual and well-researched
                - Include relevant context
                - Cite sources when possible
                - Explain complex topics in an accessible way
                - Limit the response to 400 words.
                
                Remember to maintain the user's preferred communication style from previous interactions.
                `,

    process: async function(prompt:string): Promise<string> {
        console.log("Internet Search Tool");
        console.log(prompt);
        try {
            const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await getFromRust("PERPLEXITY_API_KEY")}`,
                },
                body: JSON.stringify({
                model: `${await getFromRust("INTERNET_SEARCH_MODEL")}`,
                messages: [ {role: 'system', content: this.system_prompt},
                    { role: 'user', content: prompt }]
                })
            });
            

            const result = await perplexityResponse.json();
            console.log(result);
    
            const assistantMessage = result.choices[0].message.content;
            console.log(assistantMessage);
            return assistantMessage;
    
        } catch (error) {
            console.error('Chat API error:', error);
            return "Sorry, there was an error processing your request.";
        }
    }
};

export default internetSearchTool;