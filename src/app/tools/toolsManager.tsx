import { Tool } from "@/lib/types";
import ideationTool from "@/app/tools/ideationTool";
import internetSearchTool from "@/app/tools/internetSearchTool";
import therapistTool from "@/app/tools/therapistTool";
import { getFromRust } from "@/components/staticAPI";

class ToolManager {
    private tools = new Map<string, Tool>();
    private current_tool: string = "";

    addTool(tool: Tool): void {
        this.tools.set(tool.key, tool);
    }
    getTools(): string {
        const toolsArray = Array.from(this.tools.values())
            .map(tool => ({ name: tool.key, description: tool.description }));
        return JSON.stringify(toolsArray);
    }

    async decideTool(current_prompt:string, full_prompt:string):  Promise<string> {
        try {
            let tools = this.getTools();
            console.log(tools);
            const tool_selection_prompt = `You are an expert decision maker. I want your help to make a tool choice depending on the tools provided. Tools: ${tools.toString()}. Here is the text that you should use to decide what tool to use: ${JSON.stringify(current_prompt)}. Previously used tool: ${this.current_tool}. It might be a follow up question. Return only a json object in the format {"tool_to_use": "tool_name"} and nothing else.`;
            console.log(tool_selection_prompt);
            const apiKey = await getFromRust("PERPLEXITY_API_KEY")
            console.log("API KEY: "+ apiKey);
            const response = await fetch('https://api.perplexity.ai/chat/completions', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                model: 'llama-3.1-8b-instruct',
                messages: [{ role: 'user', content: tool_selection_prompt }]
                })
            });

            // const response = await fetch('http://127.0.0.1:1234/v1/chat/completions', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         messages: [{ role: 'user', content: tool_selection_prompt }],
            //         model: 'llama-3.2-3b-instruct',
            //         max_tokens: 1000,
            //     }),
            // });
            

            const result = await response.json();
            console.log(result);
            this.current_tool = JSON.parse(result.choices[0].message.content).tool_to_use;
            console.log(this.current_tool);
            const results = this.executeToolProcess(this.current_tool, full_prompt);
            return results;
            return "";
        } catch (error) {
            console.error('Chat API error:', error);
            return "Sorry, there was an error processing your request.";
        }

    }


    executeToolProcess(tool_name: string, prompt: string): Promise<string> {
        return this.tools.get(tool_name).process(prompt);

    }
}

const toolManager = new ToolManager();
toolManager.addTool(ideationTool);
toolManager.addTool(internetSearchTool);
toolManager.addTool(therapistTool);


export default toolManager;