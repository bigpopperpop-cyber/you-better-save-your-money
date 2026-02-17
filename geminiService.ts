
import { GoogleGenAI } from "@google/genai";
import { Transaction } from "./types";

/**
 * Generates financial insights using the Gemini API based on user transactions.
 * Follows the @google/genai guidelines for initialization and content generation.
 */
export const getFinancialInsights = async (transactions: Transaction[]): Promise<string> => {
  // Always use this pattern for GoogleGenAI initialization with named parameter.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const transactionSummary = transactions.slice(-10).map(t => 
    `${t.date}: ${t.type} of $${t.amount} for ${t.category} (${t.comment})`
  ).join('\n');

  const prompt = `
    The user is tracking their personal finances. Here are their recent transactions:
    ${transactionSummary}

    Based on this, give the user 3 short, encouraging, and easy-to-understand financial tips or insights. 
    Keep the tone friendly and motivating. Use bullet points.
  `;

  try {
    // Basic Text Tasks: 'gemini-3-flash-preview' as per guidelines.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    // response.text is a property, not a method.
    return response.text || "Keep up the great work! Consistency is key to growing your savings.";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "Nice work on staying organized! Keep tracking those transactions to see your habits clearly.";
  }
};
