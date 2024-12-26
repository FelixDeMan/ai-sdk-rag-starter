'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';

export default function Chat() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const correctPassword = 'YourSecurePassword123'; // Replace with a secure password or fetch it from env

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    maxSteps: 3,
    api: '/api/admin',
  });

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === correctPassword) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <input
            type="password"
            className="border border-gray-300 p-2 rounded"
            placeholder="Enter password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-500 rounded"
          >
            Submit
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <div className="space-y-4">
        {messages.map((m) => (
          <div key={m.id} className="whitespace-pre-wrap">
            <div>
              <div className="font-bold">{m.role}</div>
              <p>
                {m.content.length > 0 ? (
                  m.content
                ) : (
                  <span className="italic font-light">
                    {'calling tool: ' + m?.toolInvocations?.[0]?.toolName}
                  </span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}