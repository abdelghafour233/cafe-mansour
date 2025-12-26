
import { GoogleGenAI } from "@google/genai";

export async function generateBlogPost(topic: string) {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }
  
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `اكتب مقالاً احترافياً باللغة العربية حول الموضوع التالي: "${topic}". 
      يجب أن يتضمن المقال:
      1. عنواناً جذاباً.
      2. ملخصاً قصيراً.
      3. محتوى المقال مقسماً إلى فقرات.
      
      تنسيق الرد يجب أن يكون JSON كالتالي:
      {
        "title": "العنوان هنا",
        "summary": "الملخص هنا",
        "content": "المحتوى الكامل هنا"
      }`,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}
