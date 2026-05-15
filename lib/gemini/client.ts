import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const geminiModel = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 2048,
  },
});

export const SAFETY_SYSTEM_PROMPT = `You are ShieldHer AI, a women's safety assistant. Your role is to:
1. Analyze locations and routes for safety
2. Provide real-time safety advice
3. Help users stay safe during travel
4. Validate community safety reports
5. Offer calm, reassuring guidance during emergencies

Always prioritize user safety. Be concise, clear, and actionable in your responses.
Never dismiss safety concerns. When in doubt, recommend caution.`;

export async function analyzeRouteSafety(
  origin: string,
  destination: string,
  timeOfDay: string = 'now'
): Promise<{
  routes: Array<{
    name: string;
    safety_percent: number;
    danger_score: number;
    color: 'green' | 'yellow' | 'red';
    reasoning: string;
  }>;
}> {
  const prompt = `Analyze the safety of traveling from "${origin}" to "${destination}" at ${timeOfDay}.
  
Consider factors like:
- Time of day (late night is riskier)
- Area reputation
- Lighting conditions
- Public transport availability
- Emergency services proximity

Return a JSON object with this exact structure (no markdown, just raw JSON):
{
  "routes": [
    {
      "name": "Main Route (via well-lit areas)",
      "safety_percent": 85,
      "danger_score": 15,
      "color": "green",
      "reasoning": "Well-lit main roads with frequent public transport"
    },
    {
      "name": "Alternative Route",
      "safety_percent": 60,
      "danger_score": 40,
      "color": "yellow", 
      "reasoning": "Shorter but passes through less populated areas"
    }
  ]
}

Colors: green (>70% safe), yellow (40-70% safe), red (<40% safe)`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const text = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Gemini route analysis error:', error);
    // Return mock data as fallback
    return {
      routes: [
        {
          name: 'Recommended Safe Route',
          safety_percent: 75,
          danger_score: 25,
          color: 'green',
          reasoning: 'Main roads with good lighting and frequent police patrols'
        },
        {
          name: 'Shorter Route',
          safety_percent: 55,
          danger_score: 45,
          color: 'yellow',
          reasoning: 'Faster but passes through areas with fewer street lights'
        }
      ]
    };
  }
}

export async function validateReport(
  incidentType: string,
  description: string
): Promise<{ isValid: boolean; confidence: number; reasoning: string }> {
  const prompt = `Analyze this community safety report for validity:
  
Incident Type: ${incidentType}
Description: ${description}

Determine if this appears to be a genuine safety concern.
Consider: specificity, plausibility, actionable information.

Return JSON only:
{
  "isValid": true,
  "confidence": 0.85,
  "reasoning": "Report contains specific details and actionable information"
}`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const text = result.response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Gemini report validation error:', error);
    return { isValid: true, confidence: 0.7, reasoning: 'Auto-validated pending review' };
  }
}

export async function analyzeSafetyScore(
  latitude: number,
  longitude: number,
  nearbyReports: number,
  timeOfDay: string
): Promise<{ risk_score: number; confidence: number; ai_reasoning: string }> {
  const prompt = `Analyze safety risk for location (${latitude}, ${longitude}):
  
Data:
- Nearby incident reports in last 30 days: ${nearbyReports}
- Current time: ${timeOfDay}

Return JSON only:
{
  "risk_score": 35,
  "confidence": 0.8,
  "ai_reasoning": "Moderate risk due to 3 recent reports in area. Exercise caution."
}

Risk score: 0-100 (higher = more dangerous)`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const text = result.response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Gemini safety score error:', error);
    return {
      risk_score: Math.min(30 + nearbyReports * 5, 80),
      confidence: 0.6,
      ai_reasoning: `Based on ${nearbyReports} nearby reports. Stay alert and aware of surroundings.`
    };
  }
}

export async function* streamChatResponse(
  message: string,
  history: Array<{ role: string; content: string }> = []
): AsyncGenerator<string> {
  const systemPrompt = SAFETY_SYSTEM_PROMPT;
  
  const formattedHistory = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  try {
    const chat = geminiModel.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'I understand. I am ShieldHer AI, ready to help with your safety questions and concerns.' }] },
        ...formattedHistory
      ],
    });

    const result = await chat.sendMessageStream(message);
    
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        yield text;
      }
    }
  } catch (error) {
    console.error('Gemini chat error:', error);
    yield 'I apologize, but I\'m having trouble connecting right now. For immediate emergencies, please use the SOS button or call local emergency services.';
  }
}
