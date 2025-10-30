'use client'
import axios from "axios";
import { useEffect, useState } from "react";
import FileDropzone from "./components/FileDropzone";

export default function Home() {

  const [userMessage, setUserMessage] = useState('');
  const [messages, setMessages] = useState([
    { role: "assistant", content: "how can I help u today" }
  ]);
  const [files, setFiles] = useState([]);
  const [fileAvailable, setFileAvailable] = useState(false)

  const handleFiles = (acceptedFiles) => {
    setFiles(acceptedFiles);
    setFileAvailable(true);
  };

  async function chatHandler(e) {
    e.preventDefault()

    if (!userMessage.trim()) {
      return;
    }
    const newUserMessage = { role: "user", content: userMessage }
    const updatedMessages = [...messages, newUserMessage];

    setMessages(updatedMessages)
    setUserMessage('')

    try {

      const { data } = await axios.post("/api/chat", {
        messages: updatedMessages,
      });


      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response }
      ]);



    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, there was an error processing your request." }
      ]);
    }

  }

  return (
    <div>
      <div className="text-center p-4">
        <h1 className="text-2xl font-bold">Chat with AI Assistant</h1>
      </div>
      <div className="flex justify-center md:justify-around flex-wrap gap-4 items-center">

        {/* dropzone */}
        <div className="flex flex-col items-center">
          <FileDropzone onFiles={handleFiles} />
        { fileAvailable && ( <div className="relative ml-8 bg-gray-600 text-center w-60 p-4 rounded-lg shadow-md">
            <button
              onClick={() => {
                setFiles([]);
                setFileAvailable(false);
               }}
              className="absolute top-2 right-2 text-white hover:text-gray-300 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h2 className="text-xl font-semibold">Uploaded File:</h2>
            name: {files[0]?.name}
            <br />
            size: {((files[0]?.size) / (1024 * 1024)).toFixed(3)} mb
          </div>)}

        </div>


       <div className="p-2 md:p-4 flex flex-col items-center w-full md:w-auto px-4 md:px-0">
          <div className="bg-gray-600 shadow-lg rounded-lg p-3 md:p-4 h-96 md:h-[28rem] overflow-auto mb-4 w-full md:w-[32rem]">
            {messages.map((msg, i) => (
              <div key={i} className={`mb-2 ${msg.role === "user" ? "text-right" : ""}`}>
                <span className={`inline-block p-2 rounded-lg ${msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-yellow-200"
                  }`}>
                  <strong>{msg.role === "user" ? "You: " : "AI: "}</strong>
                  {msg.content}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={chatHandler} className="flex gap-2 w-full md:w-[32rem]">
            <input
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 rounded border border-gray-300"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Send
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
