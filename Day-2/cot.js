import OpenAI from 'openai'

//chain of toughts prompting-

const client = new OpenAI({
  apiKey: 'AIzaSyAzTPoBfz310J9hPT_JsjG15wrXepLNy1U',
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/'
})

async function main () {
  const system_prompt = `
        You are an AI assistant who works on START, THINK and OUTPUT format.
        For a given user query first think and breakdown the problem into sub problems.
        You should always keep thinking and thinking before giving the actual output.
        Also, before outputing the final result to user you must check once if everything is correct.
    
        Rules:
        - Strictly follow the output JSON format
        - Always follow the output in sequence that is START, THINK, EVALUATE and OUTPUT.
        - After evey think, there is going to be an EVALUATE step that is performed manually by someone and you need to wait for it.
        - Always perform only one step at a time and wait for other step.
        - Alway make sure to do multiple steps of thinking before giving out output.
    
        Output JSON Format:
        { "step": "START | THINK | EVALUATE | OUTPUT", "content": "string" }
    
        Example:
        User: Can you solve 3 + 4 * 10 - 4 * 3
        ASSISTANT: { "step": "START", "content": "The user wants me to solve 3 + 4 * 10 - 4 * 3 maths problem" } 
        ASSISTANT: { "step": "THINK", "content": "This is typical math problem where we use BODMAS formula for calculation" } 
        ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" } 
        ASSISTANT: { "step": "THINK", "content": "Lets breakdown the problem step by step" } 
        ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" } 
        ASSISTANT: { "step": "THINK", "content": "As per bodmas, first lets solve all multiplications and divisions" }
        ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" }  
        ASSISTANT: { "step": "THINK", "content": "So, first we need to solve 4 * 10 that is 40" } 
        ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" } 
        ASSISTANT: { "step": "THINK", "content": "Great, now the equation looks like 3 + 40 - 4 * 3" }
        ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" } 
        ASSISTANT: { "step": "THINK", "content": "Now, I can see one more multiplication to be done that is 4 * 3 = 12" } 
        ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" } 
        ASSISTANT: { "step": "THINK", "content": "Great, now the equation looks like 3 + 40 - 12" } 
        ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" } 
        ASSISTANT: { "step": "THINK", "content": "As we have done all multiplications lets do the add and subtract" } 
        ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" } 
        ASSISTANT: { "step": "THINK", "content": "so, 3 + 40 = 43" } 
        ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" } 
        ASSISTANT: { "step": "THINK", "content": "new equations look like 43 - 12 which is 31" } 
        ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" } 
        ASSISTANT: { "step": "THINK", "content": "great, all steps are done and final result is 31" }
        ASSISTANT: { "step": "EVALUATE", "content": "Alright, Going good" }  
        ASSISTANT: { "step": "OUTPUT", "content": "3 + 4 * 10 - 4 * 3 = 31" } 
    `
  const messages = [
    { role: 'system', content: system_prompt },
    { role: 'user', content: 'what is 4+6/11*4' }
  ]

  while (true) {
  const response = await client.chat.completions.create({
    model: 'gemini-2.0-flash',
    messages
  })

  const content = response.choices?.[0]?.message?.content
  if (!content) {
    console.error("No content returned:", JSON.stringify(response, null, 2))
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
    console.error("Invalid JSON:", cleaned)
    break
  }
  


  messages.push({ role: 'assistant', content: JSON.stringify(parsed) })

  if (parsed.step === 'START') {
    console.log("🔥", parsed.content)
    messages.push({ role: 'user', content: 'Continue with THINK step.' })
    continue
  }

  if (parsed.step === 'THINK') {
    console.log("🧠", parsed.content)
    messages.push({ role: 'user', content: 'EVALUATE' })
    continue
  }

  if (parsed.step === 'EVALUATE') {
    console.log("🔍", parsed.content)
    messages.push({ role: 'user', content: 'Continue THINK or OUTPUT.' })
    continue
  }

  if (parsed.step === 'OUTPUT') {
    console.log("🤖", parsed.content)
    break
  }
}


  //   console.log(response.choices[0].message)
  //   console.log(response.choices[0].message.content)
  //   console.log(response.usage)
}

main()
