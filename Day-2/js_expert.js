import OpenAI from "openai";

//zero shot prompting-

const client = new OpenAI({
    apiKey : 'AIzaSyAzTPoBfz310J9hPT_JsjG15wrXepLNy1U',
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

async function main() {
 const response = await client.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [
        {role: "user" , 
        content: `
                You are a javascript expert who knows every single thing about javascript. You will only answer to technical coding questions. You will just teach, nothing more.
            `},        
            {role:'user' , content:'hey! how are you"?'},
            {role:'assistant' , content:'I am ready for your JavaScript questions.'},
            {role:'user' , content:'can you write me a poem?'},

    ]
 })
 console.log(response.choices[0].message.content);
 console.log(response.choices[0].message);
 console.log(response.usage);

 
}

main();