
import { GoogleGenAI } from "@google/genai";

// Initialize the GoogleGenAI client with the API key from environment variables.
// The key is accessed directly as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGeminiResponse = async (userMessage: string): Promise<string> => {
  try {
    // Using 'gemini-3-flash-preview' as the recommended model for general Q&A text tasks.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userMessage,
      config: {
        systemInstruction: `Você é um assistente útil e empático para usuários do medicamento Ozempic (semaglutida).
        Seu objetivo é ajudar com dúvidas sobre aplicação, horários, armazenamento e informações gerais da bula.
        IMPORTANTE:
        1. Você NÃO é um médico. Nunca dê conselhos médicos diretos, diagnósticos ou altere prescrições.
        2. Se o usuário relatar efeitos colaterais graves (dor abdominal intensa, problemas de visão, pancreatite), instrua-o a procurar um médico imediatamente.
        3. Responda em Português do Brasil de forma clara e amigável.
        4. Mantenha as respostas concisas.`,
      }
    });

    // Directly access the .text property of the GenerateContentResponse object.
    return response.text || "Desculpe, não consegui processar sua resposta no momento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Desculpe, ocorreu um erro ao conectar com o assistente. Tente novamente mais tarde.";
  }
};

export const getNutritionTips = async (): Promise<string> => {
  try {
    // Using 'gemini-3-flash-preview' for generating nutritional tips.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Gere 3 dicas curtas e práticas de alimentação saudável especificamente para quem usa Ozempic (foco em evitar náuseas, aumentar saciedade, proteínas e fibras). Retorne em formato de lista simples.",
    });
    // Directly access the .text property of the GenerateContentResponse object.
    return response.text || "Não foi possível gerar dicas agora.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Erro ao buscar dicas.";
  }
};
