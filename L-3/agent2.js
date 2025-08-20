import OpenAI from 'openai'

//chain of toughts prompting-

const client = new OpenAI({
    apiKey: '',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/'
})

async function main() {
    const system_prompt = `
       You are an AI assistant who works on START, THINK and OUTPUT format.
    For a given user query first think and breakdown the problem into sub problems.
    You should always keep thinking and thinking before giving the actual output.
    
    Also, before outputing the final result to user you must check once if everything is correct.
    You also have list of available tools that you can call based on user query.
    
    For every tool call that you make, wait for the OBSERVATION from the tool which is the
    response from the tool that you called.
    
    Rules:
    - Strictly follow the output JSON format
    - Always follow the output in sequence that is START, THINK, OBSERVE and OUTPUT.
    - Always perform only one step at a time and wait for other step.
    - Alway make sure to do multiple steps of thinking before giving out output.
    - For every tool call always wait for the OBSERVE which contains the output from tool
    
        Output JSON Format:
        { "step": "START | THINK | OUTPUT", "content": "string" }
    
    // Example:
    //     User: Hey, can you tell me weather of Patiala?
    //     ASSISTANT: { "step": "START", "content": "The user is intertested in the current weather details about Patiala" } 
    //     ASSISTANT: { "step": "THINK", "content": "Let me see if there is any available tool for this query" } 
    //     ASSISTANT: { "step": "THINK", "content": "I see that there is a tool available getWeatherDetailsByCity which returns current weather data" } 
    //     ASSISTANT: { "step": "THINK", "content": "I need to call getWeatherDetailsByCity for city patiala to get weather details" }
    //     ASSISTANT: { "step": "TOOL", "input": "patiala", "tool_name": "getWeatherDetailsByCity" }
    //     DEVELOPER: { "step": "OBSERVE", "content": "The weather of patiala is cloudy with 27 Cel" }
    //     ASSISTANT: { "step": "THINK", "content": "Great, I got the weather details of Patiala" }
    //     ASSISTANT: { "step": "OUTPUT", "content": "The weather in Patiala is 27 C with little cloud. Please make sure to carry an umbrella with you. ☔️" }
  
    `
    const messages = [
        { role: 'system', content: system_prompt },
        { role: 'user', content: 'hii hru?' }
    ]

    while (true) {
        const response = await client.chat.completions.create({
            model: 'gemini-1.5-flash',
            messages
        })

        const content = response.choices?.[0]?.message?.content
        if (!content) {
            console.error('No content returned:', JSON.stringify(response, null, 2))
            break
        }

        const cleaned = content
            .replace(/^```(?:json)?\n?/i, '')
            .replace(/```$/, '')
            .trim()

        let parsed
        try {
            parsed = JSON.parse(cleaned)
        } catch (e) {
            console.error('Invalid JSON:', cleaned)
            break
        }

        messages.push({ role: 'assistant', content: JSON.stringify(parsed) })

        if (parsed.step === 'START') {
            console.log('🔥', parsed.content)
            messages.push({ role: 'user', content: 'Continue with THINK step.' })
            continue
        }

        if (parsed.step === 'THINK') {
            console.log('🧠', parsed.content)
            messages.push({ role: 'user', content: 'EVALUATE' })
            continue
        }

        if (parsed.step === 'OUTPUT') {
            console.log('🤖', parsed.content)
            break
        }
    }
}

main()
