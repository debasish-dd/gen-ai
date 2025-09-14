import fs from "fs";
import pdf from "pdf-parse/lib/pdf-parse.js";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import dotenv from "dotenv";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });




async function init() {
    try {
        // Check if file exists first
        const pdfPath = path.join(__dirname, "nodejs.pdf");

        if (!fs.existsSync(pdfPath)) {
            throw new Error(`File not found: ${pdfPath}`);
        }


        const dataBuffer = fs.readFileSync(pdfPath);

        const data = await pdf(dataBuffer);

        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });

        const docs = await textSplitter.createDocuments([data.text], [
            { source: "nodejs.pdf" },
        ]);



        const embeddings = new OpenAIEmbeddings({
            model: "text-embedding-3-large",
            apiKey: process.env.OPENAI_API_KEY,
        });

        const vectorStore = await QdrantVectorStore.fromDocuments(docs, embeddings, {
            url: "http://localhost:6333",
            collectionName: "nodejs-pdf",
        });

        console.log("Vector Store created successfully");

    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
}

init();