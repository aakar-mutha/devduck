export interface Tool {
    key: string;
    name: string;
    description: string;
    system_prompt: string;
    process(prompt:string): any;
}