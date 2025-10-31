import OpenAI from "openai";
import "dotenv/config";
import { QdrantClient } from '@qdrant/js-client-rest';
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

const qdrantClient = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
});

const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
});
const COLLECTION_NAME = 'documents';

export async function POST(request) {
    try {
        const { messages } = await request.json()

        const lastUserMessage = messages[messages.length - 1].content;

        if (!lastUserMessage) {
            return Response.json(
                { error: "No user message found" },
                { status: 400 }
            );
        }
        let context = "";
        let sources = [];

        try {
            //setting up qdrant vector store
            const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
                url: process.env.QDRANT_URL,
                apiKey: process.env.QDRANT_API_KEY,
                collectionName: COLLECTION_NAME,
            })

            const vectorSerarcher = vectorStore.asRetriever({
                k: 3
            });
            const relevantChunks = await vectorSerarcher.invoke(lastUserMessage);

            context = relevantChunks;
        } catch (retrievalError) {
            console.log("No documents found or retrieval error:", retrievalError.message);
        }

        const openAiMessages = [
            {
                role: "system",
                content: `You are a helpful assistant who answer user quries based on the context provided from the user.
                context: ${context}
                If you don't know the answer, just say that you don't know, Please Provide a document or link. Do not try to make up an answer.
            
                ` },
            ...messages
        ]

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: openAiMessages,
        })

        return Response.json({
            response: response.choices[0].message.content
        })

    } catch (error) {
        console.error("OpenAI API error:", error);
        return Response.json(
            {
                error: error.message,
                message: "failed to process request from the user",
            },
            { status: 500 }
        );
    }
}