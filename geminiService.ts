
import { GoogleGenAI } from "@google/genai";
import { Transaction } from "./types";

export const getFinancialInsights = async (transactions: Transaction[]): Promise<string> => {
  // Safe access for process.env
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
  
  if (!apiKey) {
    return "Great job tracking your money, Ryan! Remember that every dollar saved today is a step toward your big goals.";
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const transactionSummary = transactions.slice(-10).map(t => 
    `${t.date}: ${t.type} of $${t.amount} for ${t.category} (${t.comment})`
  ).join('\n');

  const prompt = `
    Ryan is a young student tracking his money. Here are his recent transactions:
    ${transactionSummary}

    Based on this, give Ryan 3 short, encouraging, and easy-to-understand financial tips or insights. 
    Keep the tone friendly and motivating. Use bullet points.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Keep up the great work, Ryan! Consistency is key to growing your savings.";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "Nice work on staying organized, Ryan! Keep tracking those transactions to see your habits clearly.";
  }
};
