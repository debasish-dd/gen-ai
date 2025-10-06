import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request) {
    try {
        const { message } = await request.json()

        const messages = [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: message },
            ]

            
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: messages ,
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