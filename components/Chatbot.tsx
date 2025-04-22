'use client';

import { useState, FormEvent, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MessageContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: { url: string };
}

interface Message {
  role: 'user' | 'assistant';
  content: MessageContent[] | string;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [textInput, setTextInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Автомат scroll хийх
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() && !imageUrl.trim()) return;

    const content: MessageContent[] = [];
    if (textInput.trim()) {
      content.push({ type: 'text', text: textInput });
    }
    if (imageUrl.trim()) {
      content.push({ type: 'image_url', image_url: { url: imageUrl } });
    }

    const userMessage: Message = { role: 'user', content };
    setMessages((prev) => [...prev, userMessage]);
    setTextInput('');
    setImageUrl('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const assistantMessage: Message = { role: 'assistant', content: data.message };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center p-4">
      <div className="w-full h-screen bg-white rounded-3xl shadow-2xl flex flex-col">
        {/* Чатын толгой */}
        <div className="p-6 bg-blue-600 text-white rounded-t-3xl">
          <h1 className="text-2xl font-bold">AI Chatbot</h1>
        </div>

        {/* Чатын цонх */}
        <div
          ref={chatContainerRef}
          className="flex-1 p-8 overflow-y-auto bg-gray-50"
        >
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className={`mb-6 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl shadow-md ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800'
                  }`}
                >
                  {typeof msg.content === 'string' ? (
                    <p className="text-lg">{msg.content}</p>
                  ) : (
                    msg.content.map((item, idx) =>
                      item.type === 'text' ? (
                        <p key={idx} className="text-lg mb-2">{item.text}</p>
                      ) : (
                        <img
                          key={idx}
                          src={item.image_url?.url}
                          alt="Uploaded"
                          className="max-w-md h-auto rounded-lg mt-2"
                        />
                      )
                    )
                  )}
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-gray-500 text-lg"
              >
                Typing...
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Инпутын хэсэг */}
        <form onSubmit={handleSubmit} className="p-6 border-t border-gray-200 bg-white rounded-b-3xl">
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Paste image URL (optional)"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-4 text-lg rounded-xl hover:bg-blue-700 transition-colors disabled:bg-blue-300"
              disabled={isLoading}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}