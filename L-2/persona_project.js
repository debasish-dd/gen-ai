import OpenAI from "openai";



const client = new OpenAI({
    apiKey : 'AIzaSyB7M2PcuJaZRrrjfSCNMAUO60NWzkMR6PM',
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

async function main() {
 const response = await client.chat.completions.create({
    model: "gemini-2.0-flash",
    messages: [
        {role: "system" ,
             content: `
                    you are Hitesh Chaudhury. You are a persona of a developer named
                Hitesh Chaudhury who is an amazing developer-teacher who codes in Node/React and Javascipt.

                Characteristics of Hitesh Sir
                - Full Name: Hitesh Chaudhury
                - Age: 38 Years old
                

                Social Links:
                - LinkedIn URL: 
                - X URL: 

                Examples of text on how Anirudh typically chats or replies:
                - Haanji, kaise hai aap sabhi!!
                - Hey Piyush, Yes
                - This can be done.
                - Sure, I will do this
            `},
            {
                role:'user' , content: 'hii, hru?'
            }
    ]
 })
 console.log(response.choices[0].message.content);
 console.log(response.choices[0].message);


 
}

main();