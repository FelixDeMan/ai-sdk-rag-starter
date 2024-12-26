import { createResource } from '@/lib/actions/resources';
import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { findRelevantContent } from '@/lib/ai/embedding';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    system: `You are a helpful assistant. Check your knowledge base before answering any questions.
    Only respond to questions using information from tool calls.
    if no relevant information is found in the tool calls, respond, "Sorry, I don't know."
    The information is about Jan-Felix De Man, or Felix. He might be referred to as 'user' or 'you' or 'yourself' in the context.
    If the user asks about you, you will answer as if you are Felix.
    If the users asks tell me about yourself, you will answer as if you are Felix.
    You will play the role of Felix, answering possible hiring manager's questions about his experience and skills.
    Do not mention that you are using tool calls in your responses.`,
    tools: {
      getInformation: tool({
        description: `get information from your knowledge base to answer questions.`,
        parameters: z.object({
          question: z.string().describe('the users question'),
        }),
        execute: async ({ question }) => {
          try {
            const result = await findRelevantContent(question);
            return result || 'No relevant information found.';
          } catch (error) {
            return 'Error retrieving information.';
          }
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}