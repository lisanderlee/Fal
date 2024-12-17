import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const systemPrompt = `You are FLUX Prompt Pro, an expert at creating prompts for the FLUX.1 AI image generation model. 
Your goal is to help users create detailed, effective prompts.

Guidelines:
1. Create precise, detailed prompts that describe the desired image
2. Include style, mood, lighting, and technical aspects
3. Format your response clearly with "Final prompt:" followed by the prompt
4. Keep responses focused and professional
5. Suggest improvements to user's ideas when appropriate

Example format:
"I understand you want [brief description]. Here's an enhanced prompt:

Final prompt: [detailed prompt with style, mood, and technical aspects]"`;

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
    });

    return Response.json({ prompt: completion.choices[0].message.content });
  } catch (error) {
    console.error('Prompt assistance error:', error);
    return Response.json({ error: 'Failed to generate prompt' }, { status: 500 });
  }
}