import { QdrantClient } from '@qdrant/js-client-rest';
import { QdrantVectorStore } from '@langchain/qdrant';
import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { tmpdir } from 'os';

const LOADER_MAP = {
    '.pdf': PDFLoader,
    '.docx': DocxLoader,
    '.doc': DocxLoader,
    '.txt': TextLoader,
    '.md': TextLoader,
    '.csv': CSVLoader,
};


// main file uploader
export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('files');
        if (!file || file.length === 0) {
            return Response.json(
                { error: 'No file uploaded' },
                { status: 400 }
            );
        }
        const extension = path.extname(file.name).toLowerCase();
        const loaderClass = LOADER_MAP[extension];
        if (!loaderClass) {
            throw new Error(`Unsupported file type: ${extension}`);
        }

        const bytes = await file.arrayBuffer();
        const tempPath = path.join(tmpdir(), file.name);
        await writeFile(tempPath, Buffer.from(bytes));

        try {
            const loader = new loaderClass(tempPath)
            const docs = await loader.load()
            const embeddings = new OpenAIEmbeddings({
                modelName: "text-embedding-3-large",
                openAIApiKey: process.env.OPENAI_API_KEY,
            });
            await QdrantVectorStore.fromDocuments(docs, embeddings, {
                url: process.env.QDRANT_URL,
                apiKey: process.env.QDRANT_API_KEY,
                collectionName: 'documents',
            })
            return Response.json({
                success: true,
                chunks: docs.length,
            });

        } finally {
            await unlink(tempPath);
        }
    } catch (error) {
        console.error('Error:', error);
        return Response.json({ error: error.message }, { status: 500 });

    }
}