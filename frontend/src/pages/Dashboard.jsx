import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts'

// Mock data ตัวอย่าง
const salesTrend = [
  { day: 'Mon', value: 120 },
  { day: 'Tue', value: 200 },
  { day: 'Wed', value: 150 },
  { day: 'Thu', value: 300 },
  { day: 'Fri', value: 280 },
  { day: 'Sat', value: 190 },
  { day: 'Sun', value: 220 },
]

const classStats = [
  { name: 'IT', students: 120 },
  { name: 'Business', students: 90 },
  { name: 'Mechanic', students: 70 },
]

const COLORS = ['#0A4DAD', '#47B5FF', '#92E3A9']

export default function Dashboard() {
  const [progress] = useState(65) // % จำลองผลการเรียน

  return (
    <section className="p-6 bg-white rounded-xl shadow-md border space-y-6">
      <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
      <p className="text-sm text-slate-600">
        Overview of student performance, classes, and activities.
      </p>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border bg-surface shadow-sm">
          <h2 className="text-sm text-slate-500">Attendance Rate</h2>
          <p className="text-2xl font-bold text-primary">92%</p>
        </div>
        <div className="p-4 rounded-xl border bg-surface shadow-sm">
          <h2 className="text-sm text-slate-500">Assignments Completed</h2>
          <p className="text-2xl font-bold text-primary">78%</p>
        </div>
        <div className="p-4 rounded-xl border bg-surface shadow-sm">
          <h2 className="text-sm text-slate-500">Clubs Joined</h2>
          <p className="text-2xl font-bold text-primary">15</p>
        </div>
      </div>

      {/* Line Chart: Weekly Trend */}
      <div className="p-4 rounded-xl border bg-surface shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Weekly Attendance Trend</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={salesTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#0A4DAD" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart + Pie Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border bg-surface shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Students by Department</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={classStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="students" fill="#0A4DAD" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 rounded-xl border bg-surface shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Class Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={classStats}
                dataKey="students"
                nameKey="name"
                outerRadius={90}
                label
              >
                {classStats.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="p-4 rounded-xl border bg-surface shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Learning Progress</h2>
        <div className="w-full bg-gray-200 rounded-full h-5">
          <div
            className="bg-primary h-5 rounded-full text-xs text-white flex items-center justify-center"
            style={{ width: `${progress}%` }}
          >
            {progress}%
          </div>
        </div>
      </div>
    </section>
  )
}
