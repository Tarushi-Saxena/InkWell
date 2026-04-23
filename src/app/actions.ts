'use server';
import { generateSummary } from '@/lib/gemini';

export async function getAiSummaryAction(text: string) {
  return await generateSummary(text);
}
