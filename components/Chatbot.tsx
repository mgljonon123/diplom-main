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
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Автомат scroll хийх
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() && !uploadedImage) return;

    const content: MessageContent[] = [];
    if (textInput.trim()) {
      content.push({ type: 'text', text: textInput });
    }
    if (uploadedImage) {
      // In a real application, you would upload the image to your server or cloud storage
      // and get back a URL. For now, we'll use the data URL directly
      content.push({ type: 'image_url', image_url: { url: imagePreview! } });
    }

    const userMessage: Message = { role: 'user', content };
    setMessages((prev) => [...prev, userMessage]);
    setTextInput('');
    setUploadedImage(null);
    setImagePreview(null);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[90vh] bg-white rounded-3xl shadow-xl flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
            AI Assistant
          </h1>
        </div>

        {/* Chat Window */}
        <div
          ref={chatContainerRef}
          className="flex-1 p-6 overflow-y-auto bg-gray-50/50"
        >
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={`mb-6 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                  }`}
                >
                  {typeof msg.content === 'string' ? (
                    <p className="text-base leading-relaxed">{msg.content}</p>
                  ) : (
                    msg.content.map((item, idx) =>
                      item.type === 'text' ? (
                        <p key={idx} className="text-base leading-relaxed mb-2">{item.text}</p>
                      ) : (
                        <img
                          key={idx}
                          src={item.image_url?.url}
                          alt="Uploaded"
                          className="max-w-md h-auto rounded-lg mt-2 shadow-sm"
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
                className="flex justify-start mb-6"
              >
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-6 border-t border-gray-100 bg-white">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full p-4 pr-12 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Type your message..."
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || (!textInput.trim() && !uploadedImage)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-indigo-600 hover:text-indigo-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {uploadedImage ? 'Change Image' : 'Upload Image'}
              </button>
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-12 w-12 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedImage(null);
                      setImagePreview(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}