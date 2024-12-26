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

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-900 p-4 overflow-hidden">
      <Card className="w-full max-w-md h-[calc(100vh-2rem)] flex flex-col bg-zinc-800 border-zinc-700">
        <CardHeader className="flex flex-row items-center gap-3 p-4 shrink-0">
          <Avatar className="h-12 w-12">
            <AvatarImage src="/AVATAR.png" alt="AI Assistant" />
            <AvatarFallback>Felix</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Felix</h2>
            <p className="text-sm text-zinc-400">Always here to help</p>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-4 pt-0">
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
        <CardFooter className="p-4 pt-0 shrink-0">
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
            />
            <Button 
              type="submit" 
              size="icon" 
              className="bg-emerald-600 hover:bg-emerald-700"
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

