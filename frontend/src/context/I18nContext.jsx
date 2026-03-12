import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'kvc-lang'

const TEXTS = {
  th: {
    'nav.home': 'หน้าแรก',
    'nav.dashboard': 'แดชบอร์ด',
    'nav.chat': 'แชท',
    'nav.class': 'ห้องเรียน',
    'nav.meeting': 'ประชุม',
    'nav.checkline': 'เช็คชื่อ',
    'nav.profile': 'โปรไฟล์',
    'nav.announcements': 'ประกาศ',
    'nav.assignment': 'งาน',
    'nav.grades': 'เกรดและทรานสคริปต์',
    'nav.exam': 'สอบ',
    'nav.schedule': 'ตารางเรียน',
    'nav.resources': 'เอกสารการเรียน',
    'nav.advisor': 'อาจารย์ที่ปรึกษา',
    'nav.register': 'บริการนักศึกษา',
    'nav.clubs': 'ชมรมและกิจกรรม',
    'nav.settings': 'ตั้งค่า',
    'nav.organization': 'โครงสร้างองค์กร',
    'nav.title': 'เมนูนำทาง',
    'common.searchPlaceholder': 'ค้นหาเมนู...',
    'common.login': 'เข้าสู่ระบบ',
    'common.dark': 'Dark',
    'common.light': 'Light',
    'common.loading': 'กำลังโหลด...',
    'common.weekly': 'รายสัปดาห์',
    'common.monthly': 'รายเดือน',
    'page.schedule.title': 'ตารางเรียน',
    'page.schedule.subtitle': 'ตารางเรียนประจำสัปดาห์',
    'schedule.overview': 'ภาพรวมตารางเรียน',
    'schedule.weeklyView': 'มุมมองรายสัปดาห์',
    'schedule.monthlyView': 'มุมมองรายเดือน',
    'schedule.totalPeriods': 'ทั้งหมด {count} คาบ',
    'schedule.tasks': 'มีงาน {count} รายการ',
    'schedule.daysUsed': 'ใช้ {count} วัน',
    'schedule.loading': 'โหลดตารางเรียน...',
    'schedule.empty': 'ยังไม่มีตารางเรียน',
    'schedule.error': 'ไม่สามารถโหลดตารางเรียนได้',
    'page.settings.title': 'ตั้งค่า',
    'page.settings.subtitle': 'ตั้งค่าระบบพื้นฐานของ KSVC Connect Portal ให้เหมาะกับสไตล์การเรียนของคุณ',
    'page.grades.title': 'เกรดและทรานสคริปต์',
    'page.grades.subtitle': 'ผลการเรียนในเทอมปัจจุบัน',
    'page.clubs.title': 'ชมรมและกิจกรรม',
    'page.clubs.subtitle': 'ชมรมและกิจกรรมเสริมหลักสูตรของคุณ',
    'page.assignments.title': 'งานที่ได้รับมอบหมาย',
    'page.assignments.subtitle': 'ภาพรวมงานที่ได้รับมอบหมายจากทุกวิชา และสถานะการส่งของคุณ',
    'page.announcements.title': 'ประกาศ',
    'page.announcements.subtitle': 'ข่าวประกาศจากวิทยาลัยและอาจารย์ผู้สอน',
    'page.organization.title': 'โครงสร้างองค์กร',
    'page.organization.subtitle': 'โครงสร้างการดูแลในสายการเรียนของคุณ และผู้บริหารที่เกี่ยวข้อง',
    'page.register.title': 'บริการงานทะเบียน',
    'page.register.subtitle': 'บริการงานทะเบียน – แบบฟอร์มออนไลน์และระบบคำร้องการลา',
    'page.exam.title': 'ตารางสอบ',
    'page.exam.subtitle': 'ตารางสอบรายวิชาที่ลงทะเบียน',
    'page.resources.title': 'เอกสารและสื่อการเรียน',
    'page.resources.subtitle': 'ไฟล์เอกสารและสื่อการสอนจากรายวิชาต่าง ๆ',
    'page.advisor.title': 'ที่ปรึกษา',
    'page.advisor.subtitle': 'ข้อมูลการติดต่ออาจารย์ที่ปรึกษา และระบบขอคิวปรึกษาเบื้องต้น',
    'page.meetingCreate.title': 'สร้างการประชุม',
    'page.meetingCreate.subtitle': 'สร้างการประชุมออนไลน์ใหม่',
    'page.meetingCreate.subtitleLoading': 'สร้างการประชุมใหม่',
  },
  en: {
    'nav.home': 'Home',
    'nav.dashboard': 'Dashboard',
    'nav.chat': 'Chat',
    'nav.class': 'Class',
    'nav.meeting': 'Meeting',
    'nav.checkline': 'Checkline',
    'nav.profile': 'Profile',
    'nav.announcements': 'Announcements',
    'nav.assignment': 'Assignment',
    'nav.grades': 'Grades & Transcript',
    'nav.exam': 'Exam',
    'nav.schedule': 'Schedule',
    'nav.resources': 'Resources / Materials',
    'nav.advisor': 'Advisor Contact',
    'nav.register': 'Register Services',
    'nav.clubs': 'Clubs & Activities',
    'nav.settings': 'Settings',
    'nav.organization': 'Organization',
    'nav.title': 'Navigation',
    'common.searchPlaceholder': 'Search...',
    'common.login': 'Login',
    'common.dark': 'Dark',
    'common.light': 'Light',
    'common.loading': 'Loading...',
    'common.weekly': 'Weekly',
    'common.monthly': 'Monthly',
    'page.schedule.title': 'Schedule',
    'page.schedule.subtitle': 'Weekly class schedule',
    'schedule.overview': 'Schedule overview',
    'schedule.weeklyView': 'Weekly View',
    'schedule.monthlyView': 'Monthly View',
    'schedule.totalPeriods': 'Total {count} periods',
    'schedule.tasks': '{count} tasks',
    'schedule.daysUsed': '{count} days',
    'schedule.loading': 'Loading schedule...',
    'schedule.empty': 'No schedule yet',
    'schedule.error': 'Unable to load schedule',
    'page.settings.title': 'Settings',
    'page.settings.subtitle': 'Customize KSVC Connect Portal to match your learning style',
    'page.grades.title': 'Grades & Transcript',
    'page.grades.subtitle': 'Your current term grades',
    'page.clubs.title': 'Clubs & Activities',
    'page.clubs.subtitle': 'Clubs and extracurricular activities for you',
    'page.assignments.title': 'Assignments',
    'page.assignments.subtitle': 'Overview of assignments and submission status',
    'page.announcements.title': 'Announcements',
    'page.announcements.subtitle': 'College and teacher announcements',
    'page.organization.title': 'Organization',
    'page.organization.subtitle': 'Your academic chain of support and leadership',
    'page.register.title': 'Register Services',
    'page.register.subtitle': 'Registry services, online forms, and leave requests',
    'page.exam.title': 'Exam Schedule',
    'page.exam.subtitle': 'Registered course exam schedule',
    'page.resources.title': 'Resources / Materials',
    'page.resources.subtitle': 'Documents and learning materials',
    'page.advisor.title': 'Advisor Contact',
    'page.advisor.subtitle': 'Advisor contact details and consultation queue',
    'page.meetingCreate.title': 'Create Meeting',
    'page.meetingCreate.subtitle': 'Create a new online meeting',
    'page.meetingCreate.subtitleLoading': 'Create Meeting',
  },
  zh: {
    'nav.home': '主页',
    'nav.dashboard': '仪表盘',
    'nav.chat': '聊天',
    'nav.class': '班级',
    'nav.meeting': '会议',
    'nav.checkline': '考勤',
    'nav.profile': '个人资料',
    'nav.announcements': '公告',
    'nav.assignment': '作业',
    'nav.grades': '成绩与成绩单',
    'nav.exam': '考试',
    'nav.schedule': '课程表',
    'nav.resources': '学习资料',
    'nav.advisor': '导师联系',
    'nav.register': '学生服务',
    'nav.clubs': '社团与活动',
    'nav.settings': '设置',
    'nav.organization': '组织架构',
    'nav.title': '导航',
    'common.searchPlaceholder': '搜索菜单...',
    'common.login': '登录',
    'common.dark': '深色',
    'common.light': '浅色',
    'common.loading': '加载中...',
    'common.weekly': '每周',
    'common.monthly': '每月',
    'page.schedule.title': '课程表',
    'page.schedule.subtitle': '每周课程安排',
    'schedule.overview': '课程表概览',
    'schedule.weeklyView': '每周视图',
    'schedule.monthlyView': '每月视图',
    'schedule.totalPeriods': '共 {count} 节课',
    'schedule.tasks': '有 {count} 项任务',
    'schedule.daysUsed': '{count} 天',
    'schedule.loading': '正在加载课程表...',
    'schedule.empty': '暂无课程表',
    'schedule.error': '无法加载课程表',
    'page.settings.title': '设置',
    'page.settings.subtitle': '个性化 KSVC Connect Portal 以适合你的学习风格',
    'page.grades.title': '成绩与成绩单',
    'page.grades.subtitle': '本学期成绩概览',
    'page.clubs.title': '社团与活动',
    'page.clubs.subtitle': '你的社团与课外活动',
    'page.assignments.title': '作业',
    'page.assignments.subtitle': '作业概览与提交状态',
    'page.announcements.title': '公告',
    'page.announcements.subtitle': '来自学院和老师的公告',
    'page.organization.title': '组织架构',
    'page.organization.subtitle': '你的学习支持链与管理人员',
    'page.register.title': '学生服务',
    'page.register.subtitle': '注册服务、在线表单与请假申请',
    'page.exam.title': '考试安排',
    'page.exam.subtitle': '已选课程的考试安排',
    'page.resources.title': '学习资料',
    'page.resources.subtitle': '课程文件与学习资料',
    'page.advisor.title': '导师联系',
    'page.advisor.subtitle': '导师联系信息与预约咨询',
    'page.meetingCreate.title': '创建会议',
    'page.meetingCreate.subtitle': '创建新的线上会议',
    'page.meetingCreate.subtitleLoading': '创建会议',
  },
}

const RAW_KEY_MAP = {
  Schedule: 'page.schedule.title',
  'ตารางเรียนประจำสัปดาห์': 'page.schedule.subtitle',
  Settings: 'page.settings.title',
  'ตั้งค่าระบบพื้นฐานของ KSVC Connect Portal ให้เหมาะกับสไตล์การเรียนของคุณ':
    'page.settings.subtitle',
  'Grades & Transcript': 'page.grades.title',
  'ผลการเรียนในเทอมปัจจุบัน': 'page.grades.subtitle',
  'Clubs & Activities': 'page.clubs.title',
  'ชมรมและกิจกรรมเสริมหลักสูตรของคุณ': 'page.clubs.subtitle',
  Assignments: 'page.assignments.title',
  'ภาพรวมงานที่ได้รับมอบหมายจากทุกวิชา และสถานะการส่งของคุณ':
    'page.assignments.subtitle',
  Announcements: 'page.announcements.title',
  'ข่าวประกาศจากวิทยาลัยและอาจารย์ผู้สอน': 'page.announcements.subtitle',
  Organization: 'page.organization.title',
  'โครงสร้างการดูแลในสายการเรียนของคุณ และผู้บริหารที่เกี่ยวข้อง':
    'page.organization.subtitle',
  'Register Services': 'page.register.title',
  'บริการงานทะเบียน – แบบฟอร์มออนไลน์และระบบคำร้องการลา':
    'page.register.subtitle',
  'Exam Schedule': 'page.exam.title',
  'ตารางสอบรายวิชาที่ลงทะเบียน': 'page.exam.subtitle',
  'Resources / Materials': 'page.resources.title',
  'ไฟล์เอกสารและสื่อการสอนจากรายวิชาต่าง ๆ':
    'page.resources.subtitle',
  'Advisor Contact': 'page.advisor.title',
  'ข้อมูลการติดต่ออาจารย์ที่ปรึกษา และระบบขอคิวปรึกษาเบื้องต้น':
    'page.advisor.subtitle',
  'Create Meeting': 'page.meetingCreate.title',
  'สร้างการประชุมออนไลน์ใหม่': 'page.meetingCreate.subtitle',
  'สร้างการประชุมใหม่': 'page.meetingCreate.subtitleLoading',
}

const I18nContext = createContext({
  language: 'th',
  setLanguage: () => null,
  t: (key, fallback, params) => fallback || key,
  translateText: (text) => text,
})

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored || 'th'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language)
  }, [language])

  const t = (key, fallback, params) => {
    const phrase = TEXTS[language]?.[key] || TEXTS.en?.[key] || fallback || key
    if (!params) return phrase
    return Object.keys(params).reduce((acc, paramKey) => {
      return acc.replaceAll(`{${paramKey}}`, params[paramKey])
    }, phrase)
  }

  const translateText = (text) => {
    if (!text) return text
    const key = RAW_KEY_MAP[text]
    if (!key) return text
    return t(key, text)
  }

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      translateText,
    }),
    [language],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = () => useContext(I18nContext)
