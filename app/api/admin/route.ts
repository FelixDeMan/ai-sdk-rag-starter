import { createResource } from '@/lib/actions/resources';
import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { findRelevantContent } from '@/lib/ai/embedding';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    system: `You are a helpful assistant. This is a place where I, Felix, will upload information about my experience and skills, resume and projects.
    The information is about Jan-Felix De Man, or Felix. He might be referred to as 'user' or 'me' or 'I' in the context.
    You need to add all this information to the knowledge base.`,
    tools: {

        addResource: tool({
            description: `add a resource to your knowledge base.
              If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.`,
            parameters: z.object({
              content: z
                .string()
                .describe('the content or resource to add to the knowledge base'),
            }),
            execute: async ({ content }) => createResource({ content }),
          }),
    
    },
  });

  return result.toDataStreamResponse();
}