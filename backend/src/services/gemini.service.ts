import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const responseSchema: any = {
  type: SchemaType.OBJECT,
  properties: {
    category: {
      type: SchemaType.STRING,
      description: "Must be exactly one of: 'Bug', 'Feature Request', 'Improvement', 'Other'",
    },
    sentiment: {
      type: SchemaType.STRING,
      description: "Must be exactly one of: 'Positive', 'Neutral', 'Negative'",
    },
    priority_score: {
      type: SchemaType.INTEGER,
      description: "A numeric score from 1 (lowest priority) to 10 (highest critical priority)",
    },
    summary: {
      type: SchemaType.STRING,
      description: "A concise 1-2 sentence summary of the feedback",
    },
    tags: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Array of 1 to 5 short tags categorizing the topic, e.g., 'UI', 'Performance', 'Settings'",
    },
  },
  required: ['category', 'sentiment', 'priority_score', 'summary', 'tags'],
};

export const analyzeFeedback = async (title: string, description: string) => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY not set. Using fallback mock analysis.');
    return {
      success: false,
      category: 'Other',
      sentiment: 'Neutral',
      priority_score: 5,
      summary: 'AI Analysis skipped due to missing API key.',
      tags: ['Unanalyzed'],
    };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });

    const prompt = `
      Analyze this product feedback.
      Title: "${title}"
      Description: "${description}"
      
      Return ONLY valid JSON with these fields: category (Bug | Feature Request | Improvement | Other), sentiment (Positive | Neutral | Negative), priority_score (1-10), summary, tags.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    const parsed = JSON.parse(text);
    return { ...parsed, success: true };
  } catch (error: any) {
    console.error('❌ Gemini API Error:', error);
    // Return a fallback if AI fails, gracefully degrading.
    return {
      success: false,
      category: 'Other',
      sentiment: 'Neutral',
      priority_score: 5,
      summary: `Automated analysis failed. Error: ${error?.message || 'Unknown error'}`,
      tags: [],
    };
  }
};

export const generateWeeklySummary = async (feedbacks: any[]) => {
  if (!process.env.GEMINI_API_KEY) {
    return "AI Weekly Summary skipped due to missing API key.";
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Prepare a condensed text of feedbacks
    const textData = feedbacks.map(f => `Title: ${f.title}\nDescription: ${f.description}`).join('\n\n');

    const prompt = `
      You are a product manager analyzing recent user feedback.
      Here is the feedback from the last 7 days:
      
      ${textData}
      
      Please identify and describe the Top 3 most important themes or trends in 3-5 sentences total. Be concise and actionable.
      If there is no feedback, just say "Not enough feedback to determine themes."
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('❌ Gemini API Summary Error:', error);
    return "Error occurred while generating the weekly insights.";
  }
};
