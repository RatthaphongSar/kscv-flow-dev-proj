import PageShell from "../components/PageShell"
import { GraduationCap } from "lucide-react"

const mockGrades = [
  { code: "CS-201", name: "Web Application Development", credit: 3, grade: "A" },
  { code: "ENG-101", name: "English for Communication", credit: 3, grade: "B+" },
  { code: "MA-110", name: "Business Mathematics", credit: 2, grade: "B" },
]

export default function GradesTranscript() {
  return (
    <PageShell
      title="Grades & Transcript"
      subtitle="ผลการเรียนในเทอมปัจจุบัน (ข้อมูลตัวอย่าง)"
      right="GPA (mock): 3.25"
    >
      <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-4">
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap size={16} className="text-emerald-400" />
          <span className="text-sm font-semibold">Term 2 / 2025</span>
        </div>

        <table className="w-full text-xs text-gray-200">
          <thead className="text-[11px] text-gray-400 border-b border-[#1f2937]">
            <tr>
              <th className="py-2 text-left">Code</th>
              <th className="py-2 text-left">Subject</th>
              <th className="py-2 text-center">Credit</th>
              <th className="py-2 text-center">Grade</th>
            </tr>
          </thead>
          <tbody>
            {mockGrades.map((g) => (
              <tr key={g.code} className="border-b border-[#020617]">
                <td className="py-2">{g.code}</td>
                <td className="py-2">{g.name}</td>
                <td className="py-2 text-center">{g.credit}</td>
                <td className="py-2 text-center font-semibold text-emerald-300">
                  {g.grade}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="text-[11px] text-gray-500 mt-3">
          * เมื่อเชื่อมต่อ Backend สามารถดึง Transcript จริงและคำนวณ GPA อัตโนมัติได้
        </p>
      </div>
    </PageShell>
  )
}
