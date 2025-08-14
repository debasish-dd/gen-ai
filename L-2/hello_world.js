import OpenAI from "openai";



const client = new OpenAI({
    apiKey : 'AIzaSyAzTPoBfz310J9hPT_JsjG15wrXepLNy1U',
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

async function main() {
 const response = await client.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [
        {role: "user" , content: 'hi there, what is your name'},        
        {role: "assistant" , content: "I am a large language model, trained by Google. I don't have a personal name. You can just call me Bard."},
        {role: "user" , content: 'hi Bard, nice to meet you , I am Debasish'},
            

    ]
 })
 console.log(response.choices[0].message.content);
 console.log(response.choices[0].message);
 console.log(response.usage);

 
}

main();