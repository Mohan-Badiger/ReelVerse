import { GoogleGenAI } from '@google/genai';

// Optional chaining just in case API key is missing so the app doesn't crash on boot
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

export const generateMovieVibeSummary = async (movieTitle, reviews) => {
    if (!ai) {
        console.warn('GEMINI_API_KEY is not defined. Skipping Vibe Tags generation.');
        return null;
    }

    if (!reviews || reviews.length === 0) {
        return null;
    }

    try {
        const reviewTexts = reviews.map(r => `Rating: ${r.rating}/5 - ${r.comment}`).join('\n');
        
        const prompt = `
You are an expert movie critic AI. I will give you a list of user reviews for the movie "${movieTitle}".
Based strictly on these reviews, generate a short summary of the audience sentiment and 3-4 "Vibe Tags" that describe the movie's feel.

Return ONLY a valid JSON object with the following structure, nothing else. Do not include markdown formatting like \`\`\`json.
{
  "vibeTags": ["🤯 Mind-bending", "🍿 Crowd-pleaser", "🐢 Slow-burn"], // 3-4 tags with a relevant emoji at the start
  "aiSummary": "Audiences praised the visual effects but felt the pacing was slightly slow in the second half." // 1-2 sentences
}

Reviews:
${reviewTexts}
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.7,
                responseMimeType: "application/json"
            }
        });

        const textResponse = response.text;
        
        // Parse the JSON (Gemini usually returns clean JSON if asked nicely, especially with responseMimeType)
        const result = JSON.parse(textResponse);
        return result;

    } catch (error) {
        console.error('Error generating Vibe Tags with Gemini:', error);
        return null;
    }
};

export const enhanceReviewText = async (draftText) => {
    if (!ai) {
        throw new Error('GEMINI_API_KEY is not configured');
    }

    if (!draftText || draftText.trim() === '') {
        return draftText;
    }

    try {
        const prompt = `
You are an AI assistant helping a user write a movie review.
The user wrote a rough draft. Please rewrite it to be more expressive, articulate, and well-written.
Keep the original sentiment (whether positive or negative). Keep it concise (maximum 3 sentences).
Do not use quotes around the output.

User's draft: "${draftText}"
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.7,
            }
        });

        return response.text.trim();
    } catch (error) {
        console.error('Error enhancing review with Gemini:', error);
        throw new Error('Failed to enhance review');
    }
};
