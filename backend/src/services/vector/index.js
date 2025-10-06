// backend/src/services/vector/index.js
export const ragRoute = {
  can: () => Boolean(process.env.VECTOR_PROVIDER),
  run: async (text) => {
    return { reply: `ยังไม่ได้ตั้งค่า Vector DB (VECTOR_PROVIDER). ไปรวมกับ LLM ทั่วไปแทนสำหรับคำถาม: "${text}"`, sources: [], meta: { route: 'rag', provider: process.env.VECTOR_PROVIDER } }
  }
}
