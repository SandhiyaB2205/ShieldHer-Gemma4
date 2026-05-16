import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { origin, destination, originLat, originLng, destLat, destLng } = await req.json();

    if (!origin || !destination) {
      return NextResponse.json({ error: 'Origin and destination required' }, { status: 400 });
    }

    const prompt = `
      You are a smart routing engine.
      The user wants to drive from "${origin}" (Lat: ${originLat}, Lng: ${originLng}) to "${destination}" (Lat: ${destLat}, Lng: ${destLng}).
      
      Generate the best driving route.
      Return ONLY a valid JSON object (without any markdown formatting or \`\`\`json blocks) strictly matching this schema:
      {
        "distance": "total estimated distance, e.g. 8.5 km",
        "duration": "total estimated time, e.g. 25 mins",
        "summary": "A brief 1-2 sentence summary of the route and its safety",
        "steps": [
          {
            "instruction": "Head north on [Street Name]",
            "distance": "200 m"
          },
          {
            "instruction": "Turn left onto [Street Name]",
            "distance": "1.2 km"
          }
        ]
      }
    `;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    
    // Clean up if Gemini accidentally returns markdown blocks
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const routeData = JSON.parse(text);

    return NextResponse.json(routeData);
  } catch (error) {
    console.error('Error generating Gemini route:', error);
    return NextResponse.json(
      { error: 'Failed to generate Gemini route' },
      { status: 500 }
    );
  }
}
