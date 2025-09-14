import { OpenAIEmbeddings } from "@langchain/openai";
import OpenAI from "openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import 'dotenv/config';

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function chat() {
    const userQuery = 'can you tell me about Installation on Windows?';

    const embeddings = new OpenAIEmbeddings({
        model: "text-embedding-3-large",
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
        url: "http://localhost:6333",
        collectionName: "nodejs-pdf",
    })

   const vectorRetriver =  vectorStore.asRetriever({
        k:3,
    });

   const relevantDocs =  await vectorRetriver.invoke(userQuery);

   const systemPrompt = `You are a helpful programming assistant. Use the following pieces of context to answer the question at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer. You will only and only answer based on the context from the file provided. also make sure to tell the page number from which you got the answer from the context.
   
    context => ${JSON.stringify(relevantDocs)}

   `;
   
    const response = await client.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
            {role: "system", content: systemPrompt},
            {role: "user", content: userQuery}
        ]
    })
    console.log(`> ${response.choices[0].message.content}`);
    
}

chat();