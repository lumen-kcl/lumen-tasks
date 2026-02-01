import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Simple in-memory context for short-term conversation
let recentContext: string[] = [];

const SYSTEM_PROMPT = `You are Lumen, Ben's AI assistant. You're responding to voice commands via Siri.

Keep responses:
- CONCISE (1-3 sentences max for driving safety)
- Conversational and warm
- Helpful and actionable

You're Ben's proactive assistant who helps with his businesses (TYay.ai, Kernion Cognitive Labs) and personal life.

If asked something you don't know, be honest. If it's a task, acknowledge it and say you'll handle it.`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body.message || body.text || '';
    
    if (!message) {
      return NextResponse.json({ 
        response: "I didn't catch that. Could you try again?" 
      });
    }

    console.log(`[Voice] Received: ${message}`);

    // Add to recent context
    recentContext.push(`User: ${message}`);
    if (recentContext.length > 10) {
      recentContext = recentContext.slice(-10);
    }

    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('No ANTHROPIC_API_KEY configured');
      return NextResponse.json({ 
        response: "Voice assistant is not fully configured yet. Tell Ben to add the API key." 
      });
    }

    // Call Claude
    const anthropic = new Anthropic({ apiKey });
    
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [
        // Include recent context
        ...recentContext.slice(0, -1).map(ctx => {
          const [role, ...content] = ctx.split(': ');
          return {
            role: role.toLowerCase() === 'user' ? 'user' as const : 'assistant' as const,
            content: content.join(': ')
          };
        }),
        { role: 'user', content: message }
      ]
    });

    const assistantResponse = response.content[0].type === 'text' 
      ? response.content[0].text 
      : "I couldn't generate a response.";

    // Add assistant response to context
    recentContext.push(`Assistant: ${assistantResponse}`);

    console.log(`[Voice] Response: ${assistantResponse}`);

    return NextResponse.json({ 
      response: assistantResponse,
      message: assistantResponse // Backup field
    });

  } catch (error) {
    console.error('[Voice] Error:', error);
    return NextResponse.json({ 
      response: "Sorry, I had trouble processing that. Try again in a moment." 
    });
  }
}

// Also support GET for testing
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Lumen Voice API is running. Use POST with { "message": "your text" }' 
  });
}
