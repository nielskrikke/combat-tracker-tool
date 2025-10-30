import { GoogleGenAI } from "@google/genai";
import type { Participant } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export async function generateSceneDescription(
  participants: Participant[],
  currentIndex: number,
  round: number
): Promise<string> {

  if (currentIndex < 0 || !participants[currentIndex]) {
    throw new Error("Invalid combat state for scene description.");
  }

  const currentCharacter = participants[currentIndex];
  const participantStatus = participants
    .map(p => {
      let status = `HP: ${p.hp}/${p.maxHp}`;
      if (p.hp === 0) status += " (Unconscious)";
      else if (p.hp <= p.maxHp / 4) status += " (Heavily Wounded)";
      else if (p.hp <= p.maxHp / 2) status += " (Wounded)";
      
      if (p.conditions.length > 0) {
        const conditionString = p.conditions.map(c => `${c.name}${c.duration !== Infinity ? ` (${c.duration} rounds left)`: ''}`).join(', ');
        status += ` | Conditions: ${conditionString}`;
      }

      return `- ${p.name}: ${status}`;
    })
    .join('\n');

  const prompt = `
    You are a Dungeon Master for a tabletop role-playing game.
    Your task is to provide a vivid, dramatic, and concise description of the current combat scene based on the information provided.
    Incorporate the character's status and any conditions they are suffering from into your description.
    Do not break character. Do not give game advice. Only describe the scene.
    Keep the description to 2-3 paragraphs.

    Current State of Battle:
    - Round: ${round}
    - It is currently ${currentCharacter.name}'s turn to act.
    
    Combatant Status:
    ${participantStatus}

    Now, describe the scene. Focus on the atmosphere, the tension, and what the current character might be seeing, hearing, and feeling.
    `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error("Failed to communicate with the generative AI.");
  }
}
