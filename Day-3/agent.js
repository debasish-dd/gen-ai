import { asyncWrapProviders } from 'async_hooks'
import OpenAI from 'openai'

//chain of toughts prompting-

const client = new OpenAI({
    apiKey: '',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/'
})

async function safeCall(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (err.status === 429) {
        console.log("Rate limited. Waiting 2s...");
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Failed after retries");
}


async function getWeatherDetailsByCity(cityName = '') {
    const url = `https://fr.wttr.in/${cityName.toLowerCase()}?format=%t`

    const response = await fetch(url)
    const data = await response.text()

    return `The Current Weather of ${cityName} is ${data}`
}

const tool_name = {
    getWeatherDetailsByCity: getWeatherDetailsByCity
}
async function main() {
    const system_prompt = `
         You are an AI assistant who works on START, THINK and OUTPUT format.
    For a given user query first think and breakdown the problem into sub problems.
    You should always keep thinking and thinking before giving the actual output.

    Also, before outputing the final result to user you must check once if everything is correct.
    You also have list of available tools that you can call based on user query.
    
    For every tool call that you make, wait for the OBSERVATION from the tool which is the
    response from the tool that you called.

    Available Tools:
    - getWeatherDetailsByCity(cityname: string): Returns a string of the current weather data of the city.
    
        Rules:
    - Strictly follow the output JSON format
    - Respond with a single JSON object. Do not include explanations, text, or Markdown fences.
    - Always output a single JSON object with fields step, content, and tool_name/input if needed. 
      Do not output multiple objects or markdown fences.

    - Always follow the output in sequence that is START, THINK, OBSERVE and OUTPUT.
    - Always perform only one step at a time and wait for other step.
    - Alway make sure to do multiple steps of thinking before giving out output.
    - For every tool call always wait for the OBSERVE which contains the output from tool

    Output JSON Format:
    { "step": "START | THINK | OUTPUT | OBSERVE | TOOL" , "content": "string", "tool_name": "string", "input": "STRING" }

    Example:
    User: Hey, can you tell me weather of Patiala?
    ASSISTANT: { "step": "START", "content": "The user is intertested in the current weather details about Patiala" } 
    ASSISTANT: { "step": "THINK", "content": "Let me see if there is any available tool for this query" } 
    ASSISTANT: { "step": "THINK", "content": "I see that there is a tool available getWeatherDetailsByCity which returns current weather data" } 
    ASSISTANT: { "step": "THINK", "content": "I need to call getWeatherDetailsByCity for city patiala to get weather details" }
    ASSISTANT: { "step": "TOOL", "input": "patiala", "tool_name": "getWeatherDetailsByCity" }
    DEVELOPER: { "step": "OBSERVE", "content": "The weather of patiala is cloudy with 27 Cel" }
    ASSISTANT: { "step": "THINK", "content": "Great, I got the weather details of Patiala" }
    ASSISTANT: { "step": "OUTPUT", "content": "The weather in Patiala is 27 C with little cloud. Please make sure to carry an umbrella with you. ☔️" }
    `
    const messages = [
        { role: 'system', content: system_prompt },
        { role: 'user', content: 'hi, hru' }
    ]

    while (true) {
       
        const response = await safeCall(() =>
  client.chat.completions.create({
    model: "gemini-2.0-flash",
    messages
  })
);


        // const content = response.choices?.[0]?.message?.content

        function extractJsonBlocks(text) {
            const regex = /```(?:json)?\s*([\s\S]*?)\s*```/g;
            const blocks = [];
            let match;

            while ((match = regex.exec(text)) !== null) {
                try {
                    blocks.push(JSON.parse(match[1]));
                } catch (e) {
                    console.error("Invalid JSON:", match[0]);
                }
            }

            return blocks;
        }

        const rawContent = response.choices[0].message.content
        
        const parsed = extractJsonBlocks(rawContent)

        if (!parsed) {
            console.error('Invalid JSON:', rawContent)
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

        if (parsed.step === "TOOL") {
            const toolFn = tool_name[parsed.tool_name];
            if (toolFn) {
                const output = await toolFn(parsed.input);
                console.log("tool->", output);
                // optionally feed the tool output back into the conversation
                messages.push({ role: "tool", content: output });
            } else {
                messages.push({
                    role: 'developer',
                    content: `There is no such tool as ${toolToCall}`,
                });
                continue;
            }
        }
        if (parsed.step === 'OUTPUT') {
            console.log('🤖', parsed.content)
            break
        }
    }
}

main()
