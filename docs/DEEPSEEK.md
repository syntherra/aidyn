# DeepSeek Integration

## Prerequisites
- Obtain an API key from DeepSeek and set `VITE_DEEPSEEK_API_KEY` in `.env.local`.
- Endpoint: `https://api.deepseek.com/v1/chat/completions`
- Models: `deepseek-chat` (default), others as available.

## Client Usage
- File: `src/ai/deepseek.ts`
- Streaming:
```
import { streamChat } from '@/ai/deepseek'
const msgs = [
  { role: 'system', content: 'You are AIDYN…' },
  { role: 'user', content: 'Tell me your company name…' }
]
await streamChat(msgs, (chunk) => setText(prev => prev + chunk))
```
- Non-stream:
```
import { chatOnce } from '@/ai/deepseek'
const reply = await chatOnce(msgs)
```

## Error Handling
- Missing key: throws `Missing VITE_DEEPSEEK_API_KEY`
- Network/HTTP errors: throws `DeepSeek error <status>`
- Implement UI retries/backoff.

## Prompting
- Use stage-specific system prompts derived from the onboarding structure.
- Ask for clear conversational reply; parse separately into structured fields.

## Security
- Do not hardcode keys.
- Keys live in `.env.local`; never commit.
