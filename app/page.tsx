'use client'

import { useChat } from 'ai/react'
import { useEffect, useRef, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from 'lucide-react'

export default function Chat() {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isConsulting, setIsConsulting] = useState(false)
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
  
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Hi! 👋 Ask me any question and I\'ll do my best to help.',
      },
    ],
    api: '/api/chat',
    maxSteps: 3,
    onResponse: (response) => {
      if (!response.ok) {
        console.error('Response error:', response.statusText)
      }
    },
    onFinish: (message) => {
      setIsConsulting(false);
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
      }
    },
    onError: (error) => {
      setIsConsulting(false);
    }
  })

  // Watch for toolInvocations in messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.toolInvocations && lastMessage.content === '') {
      setIsConsulting(true);
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmitWrapper = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim()) {
      handleSubmit(e)
    }
  }

  useEffect(() => {
    const handleResize = () => {
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      const isKeyboard = viewportHeight < window.innerHeight;
      setIsKeyboardVisible(isKeyboard);
      
      if (isKeyboard) {
        setTimeout(() => scrollToBottom(), 100);
      }
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex items-end justify-center min-h-[100dvh] bg-zinc-900 p-2 sm:p-4">
      <Card className={`w-full max-w-md flex flex-col bg-zinc-800 border-zinc-700 
        ${isKeyboardVisible ? 'h-auto pb-1' : 'h-[100dvh] sm:h-[calc(100vh-2rem)]'}`}>
        <CardHeader className={`flex flex-row items-center gap-3 p-3 sm:p-4 shrink-0
          ${isKeyboardVisible ? 'hidden' : ''}`}>
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
            <AvatarImage src="/AVATAR.png" alt="AI Assistant" />
            <AvatarFallback>Felix</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-zinc-100">Felix</h2>
            <p className="text-xs sm:text-sm text-zinc-400">Always here to help</p>
          </div>
        </CardHeader>
        <CardContent className={`flex-1 overflow-hidden p-3 sm:p-4 pt-0 
          ${isKeyboardVisible ? 'max-h-[40vh]' : ''}`}>
          <ScrollArea className="h-full pr-4 overflow-y-auto bg-zinc-800">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    {message.role === 'user' ? (
                      <AvatarFallback>You</AvatarFallback>
                    ) : (
                      <>
                        <AvatarImage src="/AVATAR.png" alt="AI" />
                        <AvatarFallback>AI</AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <div
                    className={`rounded-lg px-3 py-2 max-w-[80%] ${
                      message.role === 'user'
                        ? 'bg-emerald-600 text-emerald-50'
                        : 'bg-zinc-700 text-zinc-100'
                    }`}
                  >
                    {message.content || (message.toolInvocations ? 
                      <span className="flex items-center gap-2">
                        <span className={isConsulting ? "animate-pulse" : ""}>
                          {isConsulting ? "Consulting knowledge base..." : "Finding information..."}
                        </span>
                      </span> : '')}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-3 sm:p-4 pt-0 shrink-0">
          <form
            onSubmit={handleSubmitWrapper}
            className="flex w-full items-center space-x-2"
          >
            <Input
              type="text"
              placeholder="Ask me anything..."
              value={input}
              onChange={handleInputChange}
              className="flex-1 bg-zinc-700 border-zinc-600 text-zinc-100 placeholder:text-zinc-400"
              style={{ fontSize: '16px' }}
              onFocus={() => setTimeout(scrollToBottom, 100)}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="bg-emerald-600 hover:bg-emerald-700 h-10 w-10"
              disabled={!input.trim() || isConsulting}
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}

