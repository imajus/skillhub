import { ChatOpenAI } from '@langchain/openai';

export const MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o';

export const model = new ChatOpenAI({ model: MODEL, temperature: 0 });
