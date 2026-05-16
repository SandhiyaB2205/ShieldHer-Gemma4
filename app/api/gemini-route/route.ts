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
      You are a fallback routing engine because the Google Maps API is currently restricted.
      The user wants to drive from "${origin}" (Lat: ${originLat}, Lng: ${originLng}) to "${destination}" (Lat: ${destLat}, Lng: ${destLng}).
      
      Generate a highly realistic driving route. 
      Return ONLY a valid JSON object (without any markdown formatting or \`\`\`json blocks) strictly matching this schema:
      {
        "duration": "estimated time, e.g. 25 mins",
        "distance": "estimated distance, e.g. 8.5 km",
        "steps": [
          "Head north on <b>[Street Name]</b>",
          "Turn left onto <b>[Street Name]</b>",
          "Arrive at destination"
        ],
        "waypoints": [
           // Provide 2 to 4 intermediate realistic latitude and longitude coordinates between the origin and destination.
           // This will be used to draw the path on the map so it isn't just a straight line.
           { "lat": 13.08, "lng": 80.27 }
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
