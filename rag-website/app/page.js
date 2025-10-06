'use client'
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {

  const [userMessage, setUserMessage] = useState('');
  const [messages, setMessages] = useState([
    { sender: "ai", text: "how can I help u today" }
  ]);


  async function chatHandler(e) {
    e.preventDefault()
    if (!userMessage) {
      return;
    }
    const newUserMessage = { sender: "user", text: userMessage }
    setMessages((prev)=>[...prev , newUserMessage])

    const currMessage = userMessage;
    setUserMessage('')

    try {

      const { data } = await axios.post("/api/chat", {
        message: currMessage,
      });

      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: data.response }
      ]);
      console.log('from page->', messages);

    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Sorry, there was an error processing your request." }
      ]);
    }

  }

  return (
    <div>

      <div className=" text-center" >
        <h1 >Rag Website Project</h1>
      </div>

      <div className="flex justify-end m-2 max-h-1/2 h-150 ">
        <div className="bg-gray-600 shadow-lg w-90 p-2 rounded-lg m-3 flex flex-col overflow-auto">
          <div className="w-full bg-gray-500 rounded border-transparent flex-1 p-2">
            {messages.map((m, i) => (
              <p key={i} className={m.sender === "ai" ? "text-yellow-200" : "text-white text-right"}>
                {m.sender === "ai" ? "AI> " : "You> "}
                {m.text}
              </p>
            ))}

          </div>
        </div>
          <form className=" flex items-center p-2 rounded-b-lg">
            <input
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              className="flex-1 p-1  rounded border" />
            <button
              onClick={chatHandler}
              className="ml-2 px-3 py-1 bg-blue-700 hover:bg-blue-600 cursor-pointer text-white rounded">Send</button>
          </form>

      </div>
    </div>
  );
}
