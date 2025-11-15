# Chat UI Testing & Deployment Guide

## Quick Start

### Development Mode (Fastest)
```bash
cd frontend
npx vite
```
Then visit: **http://localhost:5173**

The UI will auto-refresh when you make changes!

### Production Mode (Like Real Server)
```bash
cd frontend
npm run build
npm start
```
Then visit: **https://localhost:3000**

## What to Test

### ✅ Basic Features
- [ ] **Chat Page Opens** - Should load with mock user
- [ ] **Large Avatar** - 80x80px circle with blue gradient in right panel
- [ ] **User Info** - Name, role (@), and online status showing
- [ ] **Contact Buttons** - 4 quick action buttons visible (💬 ☎️ 🎥 ⓘ)

### ✅ Messaging Features
- [ ] **Type Message** - Input field accepts text
- [ ] **@Mention** - Type "@" and see autocomplete dropdown
- [ ] **Mention Highlight** - Selected mention appears with yellow gradient
- [ ] **Send Message** - Message appears in conversation
- [ ] **Message Bubbles** - Sent messages (blue) and received (light blue)
- [ ] **Message Formatting** - Text wraps nicely, time shows on bottom

### ✅ Attachment Features
- [ ] **Attach File** - Click 📎 icon to attach
- [ ] **File Types** - JPG, PNG, PDF, DOCX, TXT all work
- [ ] **Size Validation** - Error if file > 10MB
- [ ] **Attachment Display** - Document shows 📄 icon, images show thumbnail
- [ ] **Attachment List** - Appears in Attachments section on right
- [ ] **Download Button** - Shows on hover over attachment

### ✅ Right Panel Features
- [ ] **Search Box** - Input field for searching messages
- [ ] **Attachments Section**
  - [ ] Shows file name
  - [ ] Shows file size
  - [ ] Download button on hover
  - [ ] Count badge shows number
- [ ] **Notes Section**
  - [ ] Notes display with left yellow border
  - [ ] Can add new note (button works)
  - [ ] Section expands/collapses smoothly
- [ ] **Tasks Section**
  - [ ] Checkboxes work
  - [ ] Completed tasks show strikethrough
  - [ ] Can add new task
  - [ ] Count badge updates

### ✅ UI/UX Polish
- [ ] **Colors** - Theme colors look right (blue #0A4DAD, light #F5F9FF)
- [ ] **Spacing** - Proper padding and margins throughout
- [ ] **Shadows** - Subtle shadows on elements
- [ ] **Hover Effects** - Buttons and items respond to hover
- [ ] **Animations** - Sections collapse/expand smoothly
- [ ] **Fonts** - Poppins font used throughout
- [ ] **Responsive** - Layout looks good (try resizing window)

## Visual Inspection

### ChatDetailsPanel (Right Sidebar)

**Avatar Section:**
```
Expected:
┌──────────────┐
│    👤        │  ← 80x80px, blue gradient
│              │
│  John Smith  │  ← Large text, semibold
│  @ Student   │  ← Gray, with @ prefix
│  🟢 Online   │  ← Green dot + text
│              │
│ [💬][☎️][🎥]│  ← 4 action buttons
│     [ⓘ]      │
└──────────────┘
```

**Sections:**
```
Expected:
┌──────────────────┐
│ 🔍 Search...     │
├──────────────────┤
│ ▼ Attachments (3)│  ← Chevron rotates
│ ├─ 📄 File1.pdf  │
│ ├─ 📄 File2.doc  │
│ └─ 📄 File3.txt  │
├──────────────────┤
│ ▼ Notes (2)      │
│ ├─ Note 1 text   │  ← Yellow left border
│ ├─ Note 2 text   │
│ └─ + Add note    │
├──────────────────┤
│ ▼ Tasks (4)      │
│ ├─ ✓ Task 1      │  ← Strikethrough
│ ├─ ☐ Task 2      │
│ ├─ ☐ Task 3      │
│ └─ + Add task    │
└──────────────────┘
```

### Message Bubbles

**Sent Message:**
```
Expected:
                    ┌────────────────────┐
                    │ Your message text  │  ← Blue background
                    │ goes here...       │  ← White text
                    └────────────────────┘
                                      14:32  ← Small blue timestamp
```

**Received Message:**
```
Expected:
┌────────────────────┐
│ Their message text │  ← Light blue background
│ goes here...       │  ← Dark text
└────────────────────┘
14:31  ← Small gray timestamp
```

**With @Mention:**
```
Expected:
Hello [yellow-gradient]@John Smith[/gradient] let's start the project!
       └─ Highlighted with gradient yellow background
```

**With Attachment:**
```
Expected:
┌─────────────────────────┐
│ 📄 Project_Report.pdf   │  ← Document preview
│ 2.3 MB            [⬇️] │  ← Download button on hover
└─────────────────────────┘
Your message text below...

OR

┌─────────────────────────┐
│   [Image Preview]       │  ← Full image shown
│  With rounded corners   │
│  and drop shadow        │
└─────────────────────────┘
```

## Browser DevTools Inspection

### Colors
Open DevTools (F12) and inspect:
- Avatar background: Should be `#0A4DAD` to `#0863a8` gradient
- Message bubbles (sent): Should be `#0A4DAD`
- Message bubbles (received): Should be `#E8F1FF`
- Mentions: Gradient yellow-200 to yellow-100
- Online status: `#22C55E` (green)

### Layout
- Avatar: `width: 80px; height: 80px;`
- Details panel: `width: 320px;`
- Message max-width: 70% of container
- Grid/Flex properly aligned

### Fonts
- Font-family: Poppins
- User name: 18px (lg), semibold
- Message text: 14px (sm)
- Time: 12px (xs)

## Common Issues & Solutions

### Issue: Avatar too small
**Solution**: Check if `w-20 h-20` classes applied to avatar div
```tsx
<div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#0A4DAD] to-[#0863a8]">
  {/* initials here */}
</div>
```

### Issue: Mention not highlighted
**Solution**: Check if mention render function is working
```tsx
renderTextWithMentions(msg.text, msg.mentions)
// Should find @mentions in array and apply styling
```

### Issue: Attachments not showing
**Solution**: Check ChatLayout is passing attachments to ChatDetailsPanel
```tsx
<ChatDetailsPanel 
  attachments={attachments}  // ← must be passed
/>
```

### Issue: Sections not expanding
**Solution**: Check Section component state management
```tsx
const [open, setOpen] = useState(true);  // ← should have state
```

### Issue: Download button not appearing
**Solution**: Check hover state CSS
```tsx
opacity-0 group-hover:opacity-100 transition-opacity
// Parent needs group class, child uses group-hover
```

## Performance Tips

### For Development
```bash
# Hot reload with Vite (fastest)
npx vite
```
Changes to TypeScript/React files update in <100ms

### For Production
```bash
# Build once
npm run build

# Serve built files
npm start
```
Gzipped size: ~10KB CSS + ~196KB JS

## Deployment Checklist

- [ ] Build succeeds: `npm run build`
- [ ] dist/ folder created
- [ ] No TypeScript errors in console
- [ ] No console warnings (except expected ones)
- [ ] All components render
- [ ] Interactions work smoothly
- [ ] Responsive on desktop/tablet/mobile
- [ ] Dark mode looks good (if applicable)

## Environment Variables Needed

### Development
None required - uses mock data by default

### Production
Create `.env` file (if using real backend):
```
VITE_API_URL=https://api.example.com
VITE_WS_URL=wss://api.example.com
```

## Build Output

```
dist/
├── index.html (0.43 KB)
├── assets/
│   ├── index-HASH.css (44.69 KB)
│   ├── index-HASH.js (649.12 KB)
│   └── [other assets]
```

All files are production-ready!

## Support Files

- 📄 **CHAT_UI_IMPROVEMENTS.md** - Detailed changes made
- 📄 **CHAT_DESIGN_GUIDE.md** - Visual design specifications
- 📄 **CHAT_UI_TESTING.md** - This file

## Next Steps

1. **Run Development Server**
   ```bash
   cd frontend
   npx vite
   ```

2. **Test All Features** (see checklist above)

3. **Take Screenshots** (for documentation)

4. **Deploy to Production**
   ```bash
   npm run build
   npm start
   ```

5. **Share with Team**
   - Link to https://localhost:3000
   - Or build for deployment

## Questions?

Check these files for details:
- Component code: `frontend/src/components/chat/`
- Design specs: `frontend/CHAT_DESIGN_GUIDE.md`
- Changes log: `frontend/CHAT_UI_IMPROVEMENTS.md`
- Build config: `frontend/vite.config.js`
- Tailwind config: `frontend/tailwind.config.js`

---

**Status**: ✅ Ready for testing
**Last Updated**: 2024
**Build Version**: 0.1.0
