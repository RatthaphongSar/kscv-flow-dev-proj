// Bulk theme fix script for KVC pages
// Run with: node fix-theme.mjs
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

const pagesDir = './src/pages'
const skipFiles = ['Leaves.jsx', 'GradesTranscript.jsx', 'Chat.jsx', 'Chat.tsx', 'Login.jsx',
  'ChatWithAdvancedScroll.example.jsx', 'ChatWithStatusExample.jsx', 'ChatWithTypingIndicatorExample.tsx',
  'ChatSettings.tsx', 'VideoCall.jsx', 'VideoCall.tsx', 'CreateMeeting.jsx', 'MeetingImproved.jsx', 'MeetingRoom.jsx']

const files = readdirSync(pagesDir).filter(f => (f.endsWith('.jsx') || f.endsWith('.tsx')) && !skipFiles.includes(f))

let totalFixed = 0

for (const file of files) {
  const filePath = join(pagesDir, file)
  let code = readFileSync(filePath, 'utf8')
  const original = code
  
  // Skip if already has useIsLight
  if (code.includes('useIsLight')) continue
  
  // Check if file has dark-mode hardcoded classes
  const hasDarkClasses = /bg-\[#0|border-white\/|bg-white\/[0-9]|text-gray-[1-4]00|bg-slate-[89]00|text-slate-[1-3]00/.test(code)
  if (!hasDarkClasses) continue
  
  // Add import for useIsLight hook
  const importLine = "import { useIsLight } from '../hooks/useIsLight'\n"
  
  // Find the last import line
  const importRegex = /^import .+$/gm
  let lastImportEnd = 0
  let match
  while ((match = importRegex.exec(code)) !== null) {
    lastImportEnd = match.index + match[0].length
  }
  
  if (lastImportEnd > 0) {
    code = code.slice(0, lastImportEnd) + '\n' + importLine + code.slice(lastImportEnd)
  }
  
  // Find the component function and add useIsLight() call
  // Pattern: export default function ComponentName(...) {
  const funcRegex = /export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{/
  const funcMatch = funcRegex.exec(code)
  if (funcMatch) {
    const insertPos = funcMatch.index + funcMatch[0].length
    code = code.slice(0, insertPos) + '\n  const isLight = useIsLight()\n' + code.slice(insertPos)
  }
  
  // Now do the replacements - card backgrounds
  // bg-[#0b1220]/80 -> conditional
  code = code.replace(/className="([^"]*?)bg-\[#0b1220\]\/80([^"]*?)"/g, 
    'className={`$1${isLight ? \'bg-white shadow-sm\' : \'bg-[#0b1220]/80\'}$2`}')
  
  // bg-[#0b1220]/90 -> conditional  
  code = code.replace(/className="([^"]*?)bg-\[#0b1220\]\/90([^"]*?)"/g,
    'className={`$1${isLight ? \'bg-white shadow-sm\' : \'bg-[#0b1220]/90\'}$2`}')
  
  // bg-[#0b1220]/70 -> conditional
  code = code.replace(/className="([^"]*?)bg-\[#0b1220\]\/70([^"]*?)"/g,
    'className={`$1${isLight ? \'bg-white\' : \'bg-[#0b1220]/70\'}$2`}')
    
  // bg-[#0b1220] (exact) -> conditional
  code = code.replace(/className="([^"]*?)bg-\[#0b1220\]([^"/][^"]*?)"/g,
    'className={`$1${isLight ? \'bg-white\' : \'bg-[#0b1220]\'}$2`}')

  // For template literals - bg-[#0b1220]
  code = code.replace(/(className=\{`[^`]*?)bg-\[#0b1220\]\/80/g,
    '$1${isLight ? \'bg-white shadow-sm\' : \'bg-[#0b1220]/80\'}')
  code = code.replace(/(className=\{`[^`]*?)bg-\[#0b1220\]\/90/g,
    '$1${isLight ? \'bg-white shadow-sm\' : \'bg-[#0b1220]/90\'}')
  code = code.replace(/(className=\{`[^`]*?)bg-\[#0b1220\]\/70/g,
    '$1${isLight ? \'bg-white\' : \'bg-[#0b1220]/70\'}')

  // border-white/10 -> conditional (in regular strings)
  code = code.replace(/className="([^"]*?)border-white\/10([^"]*?)"/g,
    'className={`$1${isLight ? \'border-slate-200\' : \'border-white/10\'}$2`}')
  // In template literals
  code = code.replace(/(className=\{`[^`]*?)border-white\/10/g,
    '$1${isLight ? \'border-slate-200\' : \'border-white/10\'}')
    
  // border-white/5 -> conditional
  code = code.replace(/className="([^"]*?)border-white\/5([^"]*?)"/g,
    'className={`$1${isLight ? \'border-slate-100\' : \'border-white/5\'}$2`}')
  code = code.replace(/(className=\{`[^`]*?)border-white\/5/g,
    '$1${isLight ? \'border-slate-100\' : \'border-white/5\'}')

  // bg-white/5 -> conditional (in regular strings)
  code = code.replace(/className="([^"]*?)bg-white\/5([^"]*?)"/g,
    'className={`$1${isLight ? \'bg-slate-50\' : \'bg-white/5\'}$2`}')
  // In template literals  
  code = code.replace(/(className=\{`[^`]*?)bg-white\/5(?!\d)/g,
    '$1${isLight ? \'bg-slate-50\' : \'bg-white/5\'}')
    
  // bg-white/10 -> conditional
  code = code.replace(/className="([^"]*?)bg-white\/10([^"]*?)"/g,
    'className={`$1${isLight ? \'bg-slate-100\' : \'bg-white/10\'}$2`}')
  code = code.replace(/(className=\{`[^`]*?)bg-white\/10/g,
    '$1${isLight ? \'bg-slate-100\' : \'bg-white/10\'}')

  // text-gray-100 -> conditional (but be careful not to replace in conditional expressions)
  code = code.replace(/className="([^"]*?)text-gray-100([^"]*?)"/g,
    'className={`$1${isLight ? \'text-slate-900\' : \'text-gray-100\'}$2`}')
    
  // text-gray-400 -> conditional  
  code = code.replace(/className="([^"]*?)text-gray-400([^"]*?)"/g,
    'className={`$1${isLight ? \'text-slate-500\' : \'text-gray-400\'}$2`}')
  
  // text-gray-300 -> conditional
  code = code.replace(/className="([^"]*?)text-gray-300([^"]*?)"/g,
    'className={`$1${isLight ? \'text-slate-600\' : \'text-gray-300\'}$2`}')
    
  // text-gray-500 -> conditional  
  code = code.replace(/className="([^"]*?)text-gray-500([^"]*?)"/g,
    'className={`$1${isLight ? \'text-slate-400\' : \'text-gray-500\'}$2`}')

  // text-slate-400 in regular strings -> conditional
  code = code.replace(/className="([^"]*?)text-slate-400([^"]*?)"/g,
    'className={`$1${isLight ? \'text-slate-500\' : \'text-slate-400\'}$2`}')

  // text-slate-300 in regular strings -> conditional 
  code = code.replace(/className="([^"]*?)text-slate-300([^"]*?)"/g,
    'className={`$1${isLight ? \'text-slate-600\' : \'text-slate-300\'}$2`}')

  // shadow with dark opacity
  code = code.replace(/shadow-\[0_20px_60px_-50px_rgba\(0,0,0,0\.9\)\]/g,
    '${isLight ? \'shadow-sm\' : \'shadow-[0_20px_60px_-50px_rgba(0,0,0,0.9)]\'}')
  code = code.replace(/shadow-\[0_30px_90px_-70px_rgba\(0,0,0,0\.95\)\]/g,
    '${isLight ? \'shadow-md\' : \'shadow-[0_30px_90px_-70px_rgba(0,0,0,0.95)]\'}')
    
  // bg-violet-500/15 -> conditional
  code = code.replace(/(className=\{`[^`]*?)bg-violet-500\/15/g,
    '$1${isLight ? \'bg-violet-50\' : \'bg-violet-500/15\'}')
  code = code.replace(/className="([^"]*?)bg-violet-500\/15([^"]*?)"/g,
    'className={`$1${isLight ? \'bg-violet-50\' : \'bg-violet-500/15\'}$2`}')

  // bg-emerald-500/15 -> conditional
  code = code.replace(/(className=\{`[^`]*?)bg-emerald-500\/15/g,
    '$1${isLight ? \'bg-emerald-50\' : \'bg-emerald-500/15\'}')
  code = code.replace(/className="([^"]*?)bg-emerald-500\/15([^"]*?)"/g,
    'className={`$1${isLight ? \'bg-emerald-50\' : \'bg-emerald-500/15\'}$2`}')

  // bg-sky-500/15 -> conditional
  code = code.replace(/(className=\{`[^`]*?)bg-sky-500\/15/g,
    '$1${isLight ? \'bg-sky-50\' : \'bg-sky-500/15\'}')
  
  // bg-amber-500/15 -> conditional
  code = code.replace(/(className=\{`[^`]*?)bg-amber-500\/15/g,
    '$1${isLight ? \'bg-amber-50\' : \'bg-amber-500/15\'}')
  
  // bg-rose-500/15 -> conditional
  code = code.replace(/(className=\{`[^`]*?)bg-rose-500\/15/g,
    '$1${isLight ? \'bg-rose-50\' : \'bg-rose-500/15\'}')

  // text-violet-300 -> conditional
  code = code.replace(/(className=\{`[^`]*?)text-violet-300/g,
    '$1${isLight ? \'text-violet-700\' : \'text-violet-300\'}')
  code = code.replace(/className="([^"]*?)text-violet-300([^"]*?)"/g,
    'className={`$1${isLight ? \'text-violet-700\' : \'text-violet-300\'}$2`}')

  // text-emerald-300 -> conditional
  code = code.replace(/(className=\{`[^`]*?)text-emerald-300/g,
    '$1${isLight ? \'text-emerald-700\' : \'text-emerald-300\'}')
  code = code.replace(/className="([^"]*?)text-emerald-300([^"]*?)"/g,
    'className={`$1${isLight ? \'text-emerald-700\' : \'text-emerald-300\'}$2`}')

  // text-sky-300 -> conditional
  code = code.replace(/(className=\{`[^`]*?)text-sky-300/g,
    '$1${isLight ? \'text-sky-700\' : \'text-sky-300\'}')
  
  // text-amber-300 -> conditional  
  code = code.replace(/(className=\{`[^`]*?)text-amber-300/g,
    '$1${isLight ? \'text-amber-700\' : \'text-amber-300\'}')

  // text-rose-300 -> conditional
  code = code.replace(/(className=\{`[^`]*?)text-rose-300/g,
    '$1${isLight ? \'text-rose-700\' : \'text-rose-300\'}')

  // border-violet-500/30  
  code = code.replace(/(className=\{`[^`]*?)border-violet-500\/30/g,
    '$1${isLight ? \'border-violet-200\' : \'border-violet-500/30\'}')
  code = code.replace(/className="([^"]*?)border-violet-500\/30([^"]*?)"/g,
    'className={`$1${isLight ? \'border-violet-200\' : \'border-violet-500/30\'}$2`}')

  // border-emerald-500/30
  code = code.replace(/(className=\{`[^`]*?)border-emerald-500\/30/g,
    '$1${isLight ? \'border-emerald-200\' : \'border-emerald-500/30\'}')
    
  // border-amber-500/30
  code = code.replace(/(className=\{`[^`]*?)border-amber-500\/30/g,
    '$1${isLight ? \'border-amber-200\' : \'border-amber-500/30\'}')

  // hover:bg-white/10 -> conditional
  code = code.replace(/(className=\{`[^`]*?)hover:bg-white\/10/g,
    '$1${isLight ? \'hover:bg-slate-100\' : \'hover:bg-white/10\'}')
  
  // hover:bg-white/5 -> conditional
  code = code.replace(/(className=\{`[^`]*?)hover:bg-white\/5/g,
    '$1${isLight ? \'hover:bg-slate-50\' : \'hover:bg-white/5\'}')
  
  // bg-slate-800 (standalone) -> conditional
  code = code.replace(/className="([^"]*?)bg-slate-800([^"]*?)"/g,
    'className={`$1${isLight ? \'bg-slate-100\' : \'bg-slate-800\'}$2`}')

  // backdrop-blur-xl -> keep as is (works in both modes)
  
  if (code !== original) {
    writeFileSync(filePath, code, 'utf8')
    totalFixed++
    console.log(`✅ Fixed: ${file}`)
  } else {
    console.log(`⏭️ Skipped (no changes): ${file}`)
  }
}

console.log(`\nTotal files fixed: ${totalFixed}`)
