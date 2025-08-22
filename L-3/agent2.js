import OpenAI from 'openai'
import { exec } from 'child_process'

//chain of toughts prompting-

const client = new OpenAI({
  apiKey: 'AIzaSyCEd4x5AgoetFcx-u9-dJtCBbsmwEFHTt4',
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/'
})

async function getWeatherDetailsByCity(cityName = '') {
  const url = `https://fr.wttr.in/${cityName.toLowerCase()}?format=%t`

  const response = await fetch(url)
  const data = await response.text()

  return `The Current Weather of ${cityName} is ${data}`
}

async function executeCommand(cmd = '') {
  return new Promise((res, rej) => {
    exec(cmd, (err, data) => {
      if (err) {
        return res(`Error while running executeComand fn -> ${err} `)
      } else res(data)
    })
  })
}

const TOOL_MAP = {
  getWeatherDetailsByCity: getWeatherDetailsByCity,
  executeCommand: executeCommand
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
    - executeCommand(command: string): Takes a linux / unix command as arg and executes the command on user's machine and returns the output
    
    Rules:
    - Strictly follow the output JSON format
    - Always follow the output in sequence that is START, THINK, OBSERVE and OUTPUT.
    - Always perform ONLY AND ONLY ONE STEP AT A TIME and wait for other step.
    - Always wait for the next step until I add the prevous step
    - Alway make sure to do multiple steps of thinking before giving out output.
    - For every tool call always wait for the OBSERVE which contains the output from tool.
    - Never write explanations or text outside JSON.
    - If you cannot comply, still output valid JSON with { "step": "OUTPUT", "content": "error" }.
    
    
    Available Tools: 


        Output JSON Format:
        { "step": "START | THINK | OUTPUT", "content": "string" }
    Example:
        User: Hey, How are you?
        ASSISTANT: { "step": "START", "content": "The user is asking how I am." } now you will start here Untill the system added this object into your context. then you will give me the next json
        ASSISTANT: { "step": "THINK", "content": "I should answer the user nicely" }
        ASSISTANT: { "step": "OUTPUT", "content": "I am good, thanks for asking!" }

    Example:
    User: Hey, can you tell me weather of Patiala?
    ASSISTANT: { "step": "START", "content": "The user is intertested in the current weather details about Patiala" } 
    ASSISTANT: { "step": "THINK", "content": "Let me see if there is any available tool for this query" } 
    ASSISTANT: { "step": "THINK", "content": "I see that there is a tool available getWeatherDetailsByCity which returns current weather data" } 
    ASSISTANT: { "step": "THINK", "content": "I need to call getWeatherDetailsByCity for city patiala to get weather details" }
    ASSISTANT: { "step": "TOOL", "input": "patiala", "tool_name": "getWeatherDetailsByCity" }
    After TOOL step and after OBSERVE step, you must still respond with valid JSON in the required format.
    Never return an empty response. If unsure, output { "step": "OUTPUT", "content": "error: empty" }.

    DEVELOPER: { "step": "OBSERVE", "content": "The weather of patiala is cloudy with 27 Cel" }
    ASSISTANT: { "step": "THINK", "content": "Great, I got the weather details of Patiala" }
    ASSISTANT: { "step": "OUTPUT", "content": "The weather in Patiala is 27 C with little cloud. Please make sure to carry an umbrella with you. ☔️" } 

    Example-
    user: create a todo-app forlder and make a simple todo Website inside this folder using html, css & js.

   
    
    `
  const messages = [
    { role: 'system', content: system_prompt },
    {
      role: 'user',
      content:
        ' create a todo-app forlder and make a simple todo Website inside this folder using html, css & js'
    }
  ]

  while (true) {
    const response = await client.chat.completions.create({
      model: 'gemini-2.5-flash',
      messages
    })

    const choice = response.choices?.[0]
    let rawData = choice?.message?.content

    if (!rawData) {
      console.error('Empty Gemini output, nudging with continuation...')
      messages.push({
        role: 'user',
        content: 'Continue with THINK step based on the OBSERVE data.'
      })
      continue // go back to loop
    }

    let parsed
    try {
      parsed = JSON.parse(rawData)
    } catch {
      console.error('Invalid JSON:', rawData)
      parsed = { step: 'OUTPUT', content: 'error: invalid JSON' }
    }
    // AI hallucinations! gemini wasn't genrating the content part after TOOL step.

    messages.push({ role: 'assistant', content: JSON.stringify(parsed) })
    console.log('parsed->', parsed)

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

    if (parsed.step === 'TOOL') {
      const toolToCall = parsed.tool_name

      if (!TOOL_MAP[toolToCall]) {
        messages.push({
          role: 'developer',
          content: `there is no such tool as ${toolToCall}`
        })
        continue
      }

      const responseFromTool = await TOOL_MAP[toolToCall](parsed.input)

      console.log(`🛠️: ${toolToCall}(${parsed.input}) = `, responseFromTool)
      messages.push({
        role: 'developer',
        content: JSON.stringify({ step: 'OBSERVE', content: responseFromTool })
      })

      continue
    }

    if (parsed.step === 'OUTPUT' || 'FINISH') {
      console.log('🤖', parsed.content)
      break
    }
  }

  console.log('done..')
}

main()
