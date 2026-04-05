import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyBEvJCbfZ2tRt7Z6Wr5CCECaPHwloCK0jI');

const responseSchema = {
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
      description: "Array of 1 to 5 short tags categorizing the topic",
    },
  },
  required: ['category', 'sentiment', 'priority_score', 'summary', 'tags'],
};

async function test() {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });

    const result = await model.generateContent("hello");
    console.log(result.response.text());
  } catch (error) {
    console.error("ERROR:");
    console.error(error);
  }
}
test();
