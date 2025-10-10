import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request) {
    try {
        const { messages } = await request.json()
        
        const openAiMessages = [
                { role: "system", content: "You are a helpful assistant."},
                ...messages
            ]   
            
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: openAiMessages ,
        })

        return Response.json({
            response: response.choices[0].message.content
        })

    } catch (error) {
        console.error("OpenAI API error:", error);
        return Response.json(
            {
                error: error.message,
                message: "failed to process request from the user",
            },
            { status: 500 }
        );
    }
}