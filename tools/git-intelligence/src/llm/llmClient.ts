import OpenAI from 'openai';
import type { LLMPrompt } from '../types.js';
import { warn } from '../utils/logger.js';

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (_client) return _client;

  const apiKey = process.env['OPENAI_API_KEY'];
  if (!apiKey) {
    process.stderr.write(
      'Error: OPENAI_API_KEY is required. Set it in your environment or use --no-llm to skip analysis.\n',
    );
    process.exit(1);
  }

  _client = new OpenAI({
    apiKey,
    baseURL: process.env['OPENAI_BASE_URL'] ?? 'https://api.openai.com/v1',
  });
  return _client;
}

export function getModel(): string {
  return process.env['OPENAI_MODEL'] ?? 'gpt-4o';
}

export async function callLLM(prompt: LLMPrompt): Promise<string> {
  const client = getClient();
  try {
    const response = await client.chat.completions.create({
      model: getModel(),
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user },
      ],
      temperature: 0.3,
    });
    return response.choices[0]?.message?.content ?? '';
  } catch (err) {
    warn(`LLM call failed: ${String(err)} — returning heuristic result`);
    return '';
  }
}
