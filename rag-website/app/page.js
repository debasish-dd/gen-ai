'use client'
import axios from "axios";
import { useEffect, useState } from "react";

export default function Home() {

  const [userMessage, setUserMessage] = useState('');
  const [messages, setMessages] = useState([
    { role: "assistant", content: "how can I help u today" }
  ]);


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

      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-gray-600 shadow-lg rounded-lg p-4 h-96 overflow-auto mb-4">
          {messages.map((msg, i) => (
            <div key={i} className={`mb-2 ${msg.role === "user" ? "text-right" : ""}`}>
              <span className={`inline-block p-2 rounded-lg ${
                msg.role === "user" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-700 text-yellow-200"
              }`}>
                <strong>{msg.role === "user" ? "You: " : "AI: "}</strong>
                {msg.content}
              </span>
            </div>
          ))}
        </div>
        
        <form onSubmit={chatHandler} className="flex gap-2">
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
  );
}
