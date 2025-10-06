// backend/src/services/rules.js
const intents = [
  { test: /^(help|ช่วย|วิธีใช้)$/i, reply: "สวัสดีครับ 🙋 ฉันคือ Assistant ของ KVC คุณสามารถถามเกี่ยวกับ 'ตารางเรียน', 'ข่าว/ประกาศ', 'ระบบลาเรียน', 'ลงทะเบียนเรียน', หรือ 'ติดต่ออาจารย์ที่ปรึกษา' ได้เลยครับ" },
  { test: /ตาราง(เรียน|สอน)|schedule/i, reply: "📅 ตารางเรียนสามารถดูได้ในเมนู Schedule ของระบบ หากต้องการให้ฉันดึงให้ พิมพ์: 'ตารางเรียนของฉัน สัปดาห์นี้' พร้อมรหัสนักศึกษาครับ" },
  { test: /(ลาเรียน|ลากิจ|ลาป่วย|ลาบวช)/i, reply: "📝 การลาเรียน: ป่วย 30 วัน (เกิน 2 วันแนบใบรับแพทย์), ลากิจ 7 วัน, ลาบวช 60 วัน — ยื่นในเมนู Leave ได้เลยครับ" },
  { test: /(ข่าว|ประกาศ)/i, reply: "📰 ข่าว/ประกาศล่าสุด ดูในเมนู Announcements หรือแจ้งคำว่า 'ข่าวสาขาไอที วันนี้' เพื่อให้ฉันค้นให้ครับ" },
  { test: /(เกรด|ผลการเรียน|Transcript)/i, reply: "🎓 เกรดและ Transcript ดูในเมนู Grades & Transcript — หากต้องการให้ช่วยสรุป GPA ให้ส่งรหัสนักศึกษามาครับ" }
]

export const ruleBased = {
  can: (text) => intents.some(i => i.test.test(text)),
  run: async (text) => {
    const intent = intents.find(i => i.test.test(text))
    return { reply: intent?.reply || "ฉันยังไม่เข้าใจคำถาม ลองพิมพ์ 'help' เพื่อดูตัวอย่างคำถามนะครับ", sources: [], meta: { route: 'rules' } }
  }
}
