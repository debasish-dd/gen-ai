import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";



async function init() {
    const filePath = "./nodejs.pdf";
    const loader = new PDFLoader(filePath);
    const docs = await loader.load()


    const embeddings = new OpenAIEmbeddings({
        model: "text-embedding-3-large"
    });


    const vectorStore = await QdrantVectorStore.fromDocuments(docs, embeddings, {
        url: "http://localhost:6333",
        collectionName: "nodejs-pdf"
    })

    console.log("Vector Store created successfully");
}

