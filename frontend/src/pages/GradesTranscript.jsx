import { useState, useEffect } from "react"
import PageShell from "../components/PageShell"
import { GraduationCap, Loader } from "lucide-react"
import { apiClient } from "../utils/api"

export default function GradesTranscript() {
  const [grades, setGrades] = useState([])
  const [gpa, setGpa] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchGrades()
  }, [])

  const fetchGrades = async () => {
    try {
      setLoading(true)
      setError("")

      // Call backend API to get grades
      const response = await apiClient.get("/grades")

      if (response && response.data) {
        setGrades(response.data.grades || [])
        setGpa(response.data.gpa || 0)
      } else {
        throw new Error("No grades data received")
      }
    } catch (err) {
      console.error("Error fetching grades:", err)
      setError("ไม่สามารถโหลดผลการเรียนได้")
      setGrades([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell
      title="Grades & Transcript"
      subtitle="ผลการเรียนในเทอมปัจจุบัน"
      right={`GPA: ${gpa.toFixed(2)}`}
    >
      <div className="rounded-2xl border border-[#1f2937] bg-[#020617] p-4">
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap size={16} className="text-emerald-400" />
          <span className="text-sm font-semibold">Term 2 / 2025</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2">
            <Loader size={20} className="animate-spin text-emerald-400" />
            <span className="text-gray-400">โหลดผลการเรียน...</span>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-4 text-center text-red-300">
            {error}
          </div>
        ) : grades.length === 0 ? (
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-900/20 p-4 text-center text-yellow-300">
            ยังไม่มีผลการเรียน
          </div>
        ) : (
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
              {grades.map((g) => (
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
        )}

        <p className="text-[11px] text-gray-500 mt-3">
          * ข้อมูลอัดฉากจากระบบ Backend
        </p>
      </div>
    </PageShell>
  )
}
