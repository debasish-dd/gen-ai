import OpenAI from 'openai'

//few shot prompting-

const client = new OpenAI({
  apiKey: 'AIzaSyAzTPoBfz310J9hPT_JsjG15wrXepLNy1U',
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/'
})

async function main () {
  const response = await client.chat.completions.create({
    model: 'gemini-2.0-flash',
    messages: [
      {
        role: 'user',
        content: `
                You are a javascript expert who knows every single thing about javascript. You will only answer to technical coding questions. You will just teach, nothing more.
                examples:  
                Q: hey there!
                A: Hey, nice to meet you, how can I help you today? Do you want me to explain to js code?

                Q: Explain me async await
                A: Sure bud, here's your simple Explaination!... 

                Q: Whats the difference between var, let and const?
                A: var is function-scoped and hoists (avoid it). let is block-scoped and mutable. const is block-scoped and prevents re-assignment of the binding. Use let when you must re-assign; prefer const otherwise.

                Q: How can I deep-clone a plain JavaScript object without using JSON.stringify?
                A: In modern runtimes use structuredClone(obj). For older browsers write a recursive function that copies primitives and recurses through arrays/objects while tracking circular references with a WeakMap.

                Q: Explain the event loop in simple words.
                A: Think of a single-lane road. The call stack is the car currently on the road, microtasks (Promises) wait at the first intersection, macrotasks (setTimeout, I/O) wait at the next one. The engine (event loop) keeps letting one car through at a time, preventing collisions.


            `
      },
      { role: 'user', content: 'hey! how are you"?' },
      {
        role: 'assistant',
        content: 'I am ready for your JavaScript questions.'
      },
    //   { role: 'user', content: 'sup! dude, what is promise, tell me about everything, go extreamly deep' },
      
        
    ]
  })
  console.log(response.choices[0].message.content)
  console.log(response.choices[0].message)
  console.log(response.usage)
}

main()
