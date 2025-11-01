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

        // Correct file validation
        if (!file || !(file instanceof File) || file.size === 0) {
            return Response.json(
                { error: 'No valid file uploaded' },
                { status: 400 }
            );
        }

        const extension = path.extname(file.name).toLowerCase();
        const loaderClass = LOADER_MAP[extension];

        if (!loaderClass) {
            return Response.json(
                { error: `Unsupported file type: ${extension}` },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const tempPath = path.join(tmpdir(), file.name);
        await writeFile(tempPath, Buffer.from(bytes));

        try {
            const loader = new loaderClass(tempPath);
            const docs = await loader.load();

            // Add text splitting
            const textSplitter = new RecursiveCharacterTextSplitter({
                chunkSize: 1000,
                chunkOverlap: 200,
            });
            const splitDocs = await textSplitter.splitDocuments(docs);

            const embeddings = new OpenAIEmbeddings({
                modelName: "text-embedding-3-large",
                openAIApiKey: process.env.OPENAI_API_KEY,
            });

            await QdrantVectorStore.fromDocuments(splitDocs, embeddings, {
                url: process.env.QDRANT_URL,
                apiKey: process.env.QDRANT_API_KEY,
                collectionName: 'documents',
            });

            return Response.json({
                success: true,
                chunks: splitDocs.length,
            });

        } finally {
            await unlink(tempPath);
        }
    } catch (error) {
        console.error('Upload Error:', error);
        return Response.json({
            error: error.message
        }, { status: 500 });
    }
}