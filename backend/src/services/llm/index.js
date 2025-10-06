// backend/src/services/llm/index.js
import { generateWithOpenAI } from './openai.js'
import { systemPrompt } from './prompts.js'

export const llmRoute = {
  can: () => true,
  run: async (text) => {
    const provider = (process.env.AI_PROVIDER || 'none').toLowerCase()
    if (provider === 'openai' && process.env.OPENAI_API_KEY) {
      const out = await generateWithOpenAI({ system: systemPrompt, user: text })
      return { reply: out, sources: [], meta: { route: 'llm', provider } }
    }
    const reply = `คำถาม: ${text}\n\nขณะนี้ไม่ได้เชื่อมต่อผู้ให้บริการ LLM ภายนอก จึงตอบแบบสรุปย่อ:\n- ฉันคือ Assistant ของ KVC\n- คุณสามารถถาม: ตารางเรียน, ข่าว/ประกาศ, ระบบลา, เกรด/Transcript\n- หากต้องการความสามารถเต็มรูปแบบ ให้ตั้งค่า AI_PROVIDER=openai และ OPENAI_API_KEY`
    return { reply, sources: [], meta: { route: 'llm', provider: 'local-fallback' } }
  }
}
