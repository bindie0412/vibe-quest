
import { GoogleGenAI, Type } from "@google/genai";
import { ScheduleEntry, Project } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const suggestTags = async (title: string): Promise<string[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Suggest 3-5 short relevant tags for this task title: "${title}". Return only the tags as a JSON array of strings. Language: Korean.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    return [];
  }
};

export const generateProjectPlan = async (project: Partial<Project>): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Project Name: ${project.name}\nDescription: ${project.description}\nDifficulty: ${project.difficulty}\n\nCreate a step-by-step execution plan or flowchart description for this project. Use markdown. Language: Korean.`,
  });
  return response.text || "플랜을 생성할 수 없습니다.";
};

export const suggestAIScheduling = async (entries: ScheduleEntry[], project: Project): Promise<Partial<ScheduleEntry>[]> => {
  const context = JSON.stringify(entries.map(e => ({ day: e.dayOfWeek, date: e.date, start: e.startTime, end: e.endTime })));
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
      Project: ${project.name} (${project.description})
      Existing Schedule: ${context}
      
      Find 3-5 empty slots (between 09:00 and 21:00) this week. 
      Suggest tasks for this project to fill those slots.
      Return a JSON array of objects with: title, startTime (HH:mm), date (YYYY-MM-DD), estimatedDuration (minutes).
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            startTime: { type: Type.STRING },
            date: { type: Type.STRING },
            estimatedDuration: { type: Type.NUMBER }
          },
          required: ['title', 'startTime', 'date', 'estimatedDuration']
        }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    return [];
  }
};
