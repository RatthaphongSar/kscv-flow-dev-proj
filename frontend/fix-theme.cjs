// Bulk theme fix script for KVC pages (CommonJS)
const fs = require('fs')
const path = require('path')

const pagesDir = path.join(__dirname, 'src', 'pages')
const skipFiles = ['Leaves.jsx', 'GradesTranscript.jsx', 'Chat.jsx', 'Chat.tsx', 'Login.jsx',
  'ChatWithAdvancedScroll.example.jsx', 'ChatWithStatusExample.jsx', 'ChatWithTypingIndicatorExample.tsx',
  'ChatSettings.tsx', 'VideoCall.jsx', 'VideoCall.tsx', 'CreateMeeting.jsx', 'MeetingImproved.jsx', 'MeetingRoom.jsx']

const files = fs.readdirSync(pagesDir).filter(function(f) { return (f.endsWith('.jsx') || f.endsWith('.tsx')) && !skipFiles.includes(f) })

let totalFixed = 0

for (const file of files) {
  const filePath = path.join(pagesDir, file)
  let code = fs.readFileSync(filePath, 'utf8')
  const original = code
  
  if (code.includes('useIsLight')) continue
  
  const hasDarkClasses = /bg-\[#0|border-\[#1f2937\]|border-white\/|bg-white\/[0-9]|text-gray-[1-4]00|bg-slate-[89]00|text-slate-[34]00/.test(code)
  if (!hasDarkClasses) continue
  
  // Add import
  const importLine = "import { useIsLight } from '../hooks/useIsLight'\n"
  const importRegex = /^import .+$/gm
  let lastImportEnd = 0
  let match
  while ((match = importRegex.exec(code)) !== null) {
    lastImportEnd = match.index + match[0].length
  }
  if (lastImportEnd > 0) {
    code = code.slice(0, lastImportEnd) + '\n' + importLine + code.slice(lastImportEnd)
  }
  
  // Add hook call after component function declaration
  const funcRegex = /export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{/
  const funcMatch = funcRegex.exec(code)
  if (funcMatch) {
    const insertPos = funcMatch.index + funcMatch[0].length
    code = code.slice(0, insertPos) + '\n  const isLight = useIsLight()\n' + code.slice(insertPos)
  }
  
  // Replace patterns - order matters: longer patterns first
  const replacements = [
    // Background colors
    ['bg-[#020617]', "${isLight ? 'bg-slate-50' : 'bg-[#020617]'}"],
    ['bg-[#0b1220]', "${isLight ? 'bg-white' : 'bg-[#0b1220]'}"],
    ['bg-[#0f172a]', "${isLight ? 'bg-white' : 'bg-[#0f172a]'}"],
    ['bg-[#111827]', "${isLight ? 'bg-slate-50' : 'bg-[#111827]'}"],
    ['bg-[#1f2937]', "${isLight ? 'bg-slate-100' : 'bg-[#1f2937]'}"],
    // Border colors
    ['border-[#1f2937]', "${isLight ? 'border-slate-200' : 'border-[#1f2937]'}"],
    ['border-[#111827]', "${isLight ? 'border-slate-200' : 'border-[#111827]'}"],
    ['border-[#374151]', "${isLight ? 'border-slate-300' : 'border-[#374151]'}"],
    ['border-white/10', "${isLight ? 'border-slate-200' : 'border-white/10'}"],
    ['border-white/5', "${isLight ? 'border-slate-100' : 'border-white/5'}"],
    // Background opacity
    ['bg-white/5', "${isLight ? 'bg-slate-50' : 'bg-white/5'}"],
    ['bg-white/10', "${isLight ? 'bg-slate-100' : 'bg-white/10'}"],
    // Text colors
    ['text-gray-100', "${isLight ? 'text-slate-900' : 'text-gray-100'}"],
    ['text-gray-200', "${isLight ? 'text-slate-800' : 'text-gray-200'}"],
    ['text-gray-300', "${isLight ? 'text-slate-600' : 'text-gray-300'}"],
    ['text-gray-400', "${isLight ? 'text-slate-500' : 'text-gray-400'}"],
    ['text-gray-500', "${isLight ? 'text-slate-400' : 'text-gray-500'}"],
    // Hover
    ['hover:bg-slate-800', "${isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'}"],
    ['hover:bg-slate-900', "${isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-900'}"],
  ]

  for (const [find, replace] of replacements) {
    // In className="..." strings, convert to template literal
    const escapedFind = find.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&')
    
    // Replace in regular className="..." strings
    const regStr = new RegExp('className="([^"]*?)' + escapedFind + '([^"]*?)"', 'g')
    code = code.replace(regStr, function(m, before, after) {
      return 'className={`' + before + replace + after + '`}'
    })
    
    // Replace in template literal className={`...`} strings
    const regTpl = new RegExp('(className=\\{`[^`]*?)' + escapedFind, 'g')
    code = code.replace(regTpl, '$1' + replace)
  }
  
  if (code !== original) {
    fs.writeFileSync(filePath, code, 'utf8')
    totalFixed++
    console.log('Fixed: ' + file)
  } else {
    console.log('Skipped: ' + file)
  }
}

console.log('\nTotal files fixed: ' + totalFixed)
