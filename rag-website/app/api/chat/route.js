import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request){
    try {
        const {message} = await request.json()
        const response = await openai.chat.completions.create({
            model: 'gpt-4.1-mini',
            messages: message
        })

        return Response.json({
            response: response.choices[0].message.content
        })
        
    } catch (error) {
        return Response.json({
            error: error,
            message: 'failed to process request from the user'
        },
        {status: 500}        
    )
    }
}