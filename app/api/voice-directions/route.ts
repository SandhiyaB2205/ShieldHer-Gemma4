import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { steps, destination } = await req.json();

    if (!steps || !Array.isArray(steps)) {
      return NextResponse.json({ error: 'Invalid steps' }, { status: 400 });
    }

    // Clean HTML tags from steps for the prompt
    const cleanSteps = steps.map(s => s.replace(/<[^>]+>/g, '')).join(', ');

    const prompt = `
      You are ShieldHer, a friendly and reassuring AI navigation assistant.
      The user is navigating to ${destination}.
      Here are the driving directions step-by-step: ${cleanSteps}.
      
      Please write a short, clear, and reassuring audio script for a voice assistant to read to the user.
      Start with a warm greeting. Keep it concise, focused on the first few major steps, and end by wishing them a safe trip.
      Do not use any special formatting or markdown. Just return plain conversational text that is easy for a text-to-speech engine to read out loud.
    `;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ script: text });
  } catch (error) {
    console.error('Error generating voice script:', error);
    return NextResponse.json(
      { error: 'Failed to generate voice script' },
      { status: 500 }
    );
  }
}
