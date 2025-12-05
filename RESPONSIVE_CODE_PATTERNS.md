# 🎨 Responsive Design Code Examples & Patterns
## KVC WebApp - Copy-Paste Ready Solutions

---

## 📱 Mobile-First Responsive Patterns

### Pattern 1: Responsive Container
```tsx
// Basic responsive container
<div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl mx-auto px-4">
  Content
</div>

// Or using Tailwind's container
<div className="container mx-auto px-4 sm:px-6 md:px-8">
  Content
</div>
```

---

### Pattern 2: Collapsible Sidebar Navigation
```tsx
// Sidebar that hides on mobile, shows as drawer
export function Layout() {
  const [showDrawer, setShowDrawer] = useState(false)

  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 xl:w-80 border-r border-slate-700 bg-slate-900">
        <nav className="flex-1 overflow-y-auto p-4">
          <NavLinks />
        </nav>
      </aside>

      {/* Mobile Drawer */}
      {showDrawer && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowDrawer(false)}
          />
          
          {/* Drawer Panel */}
          <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 z-50 lg:hidden overflow-y-auto">
            <div className="p-4 flex justify-between items-center border-b border-slate-700">
              <h2 className="font-bold">Menu</h2>
              <button onClick={() => setShowDrawer(false)}>
                <X size={20} />
              </button>
            </div>
            <nav className="p-4">
              <NavLinks />
            </nav>
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Topbar with menu button */}
        <header className="lg:hidden border-b border-slate-700 p-4 flex items-center">
          <button 
            onClick={() => setShowDrawer(true)}
            className="p-2 hover:bg-slate-800 rounded"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
          Your content here
        </div>
      </main>
    </div>
  )
}
```

---

### Pattern 3: Responsive Grid System
```tsx
// Grid that adapts from 1 column to 4 columns
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {items.map(item => (
    <Card key={item.id} {...item} />
  ))}
</div>

// Grid with different aspect ratios
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
  {items.map(item => (
    <div key={item.id} className="aspect-video sm:aspect-square lg:aspect-auto">
      <img src={item.image} className="w-full h-full object-cover" />
    </div>
  ))}
</div>

// Grid with responsive gap
<div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 md:gap-6">
  {items.map(item => (
    <Card key={item.id} {...item} />
  ))}
</div>
```

---

### Pattern 4: Responsive Typography
```tsx
// Heading that scales with screen size
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
  Main Title
</h1>

// Paragraph with responsive sizing
<p className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
  Body text that scales appropriately
</p>

// Large heading
<h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold">
  Section Title
</h2>

// Small text
<small className="text-xs sm:text-sm md:text-base">
  Small print or captions
</small>
```

---

### Pattern 5: Responsive Spacing/Padding
```tsx
// Padding that scales with screen size
<div className="p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8">
  Content with responsive padding
</div>

// Margin with responsive values
<div className="my-2 sm:my-4 md:my-6 lg:my-8">
  Content with responsive margins
</div>

// Gap in flex layouts
<div className="flex gap-2 sm:gap-3 md:gap-4 lg:gap-6">
  <Item />
  <Item />
</div>

// Responsive width
<div className="w-full sm:w-5/6 md:w-2/3 lg:w-1/2 mx-auto">
  Content that gets narrower on larger screens
</div>
```

---

### Pattern 6: Responsive Table (Mobile Card View)
```tsx
// Show as cards on mobile, table on desktop
<div className="block md:hidden">
  {/* Mobile: Card-based layout */}
  {data.map(row => (
    <div key={row.id} className="mb-4 p-4 border border-slate-700 rounded-lg bg-slate-800">
      <div className="flex justify-between mb-2">
        <span className="font-bold">{row.name}</span>
        <span className="text-violet-400">{row.value}</span>
      </div>
      <div className="text-sm text-gray-400">
        <div>Status: {row.status}</div>
        <div>Date: {row.date}</div>
      </div>
    </div>
  ))}
</div>

<div className="hidden md:block overflow-x-auto">
  {/* Desktop: Table layout */}
  <table className="w-full text-sm">
    <thead className="border-b border-slate-700 bg-slate-800">
      <tr>
        <th className="text-left p-3">Name</th>
        <th className="text-left p-3">Value</th>
        <th className="text-left p-3">Status</th>
        <th className="text-left p-3">Date</th>
      </tr>
    </thead>
    <tbody>
      {data.map(row => (
        <tr key={row.id} className="border-b border-slate-700 hover:bg-slate-800">
          <td className="p-3">{row.name}</td>
          <td className="p-3">{row.value}</td>
          <td className="p-3">{row.status}</td>
          <td className="p-3">{row.date}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

---

### Pattern 7: Responsive Form
```tsx
// Form that stacks on mobile, 2-column on desktop
<form className="space-y-4 sm:space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
    {/* First row - 2 columns on desktop, 1 on mobile */}
    <div>
      <label className="block text-sm font-medium mb-1 sm:mb-2">First Name</label>
      <input 
        type="text"
        className="w-full px-3 py-2 sm:py-3 border border-slate-600 rounded-lg bg-slate-800 text-white focus:outline-none focus:border-violet-500"
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1 sm:mb-2">Last Name</label>
      <input 
        type="text"
        className="w-full px-3 py-2 sm:py-3 border border-slate-600 rounded-lg bg-slate-800 text-white focus:outline-none focus:border-violet-500"
      />
    </div>
  </div>

  {/* Full width field */}
  <div>
    <label className="block text-sm font-medium mb-1 sm:mb-2">Email</label>
    <input 
      type="email"
      className="w-full px-3 py-2 sm:py-3 border border-slate-600 rounded-lg bg-slate-800 text-white focus:outline-none focus:border-violet-500"
    />
  </div>

  {/* Buttons */}
  <div className="flex gap-2 sm:gap-4 pt-4">
    <button className="flex-1 px-4 py-2 sm:py-3 bg-violet-600 hover:bg-violet-700 rounded-lg font-medium">
      Submit
    </button>
    <button className="flex-1 px-4 py-2 sm:py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium">
      Cancel
    </button>
  </div>
</form>
```

---

### Pattern 8: Responsive Modal Dialog
```tsx
// Modal that's full screen on mobile, centered on desktop
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
        <div className="w-full sm:w-96 md:w-[500px] max-h-[90vh] bg-slate-800 rounded-lg shadow-xl overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-700 sticky top-0">
            <h2 className="text-lg sm:text-xl font-bold">{title}</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6">
            {children}
          </div>

          {/* Footer - optional */}
          <div className="flex gap-3 p-4 sm:p-6 border-t border-slate-700">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg"
            >
              Cancel
            </button>
            <button className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg">
              Confirm
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
```

---

### Pattern 9: Responsive Buttons
```tsx
// Button sizes that scale with screen
<button className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base md:text-lg">
  Click me
</button>

// Button group that wraps on mobile
<div className="flex flex-col sm:flex-row gap-2">
  <button className="flex-1">Option 1</button>
  <button className="flex-1">Option 2</button>
  <button className="flex-1">Option 3</button>
</div>

// Icon button that scales
<button className="p-2 sm:p-3 md:p-4">
  <Icon size={20} className="sm:block md:hidden" />
  <Icon size={24} className="hidden sm:block md:hidden" />
  <Icon size={28} className="hidden md:block" />
</button>
```

---

### Pattern 10: Responsive Card Layout
```tsx
// Card with responsive padding and font sizes
<div className="p-3 sm:p-4 md:p-6 rounded-lg border border-slate-700 bg-slate-800">
  {/* Card header */}
  <div className="mb-2 sm:mb-3 md:mb-4">
    <h3 className="text-base sm:text-lg md:text-xl font-semibold">Card Title</h3>
  </div>

  {/* Card content */}
  <div className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4 md:mb-6">
    Card description text that scales with screen size
  </div>

  {/* Card footer */}
  <div className="flex gap-2">
    <button className="flex-1 px-2 sm:px-3 py-2 text-xs sm:text-sm rounded bg-violet-600">
      Action
    </button>
  </div>
</div>
```

---

## 🎯 Quick Fixes for Common Issues

### Issue: Horizontal Overflow on Mobile
```tsx
// ❌ BAD: Fixed width causes overflow
<div className="w-400">Content</div>

// ✅ GOOD: Responsive width
<div className="w-full px-4">Content</div>
// or
<div className="max-w-xs sm:max-w-sm md:max-w-md">Content</div>
```

### Issue: Text Too Small on Mobile
```tsx
// ❌ BAD: Fixed font size
<p className="text-xs">Small text</p>

// ✅ GOOD: Responsive font
<p className="text-xs sm:text-sm md:text-base lg:text-lg">
  Text that grows on larger screens
</p>
```

### Issue: Buttons Too Small to Click
```tsx
// ❌ BAD: Small touch target
<button className="px-2 py-1">Button</button>

// ✅ GOOD: At least 48x48px on mobile
<button className="px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3">
  Button
</button>
```

### Issue: Sidebar Covers Content on Mobile
```tsx
// ❌ BAD: Always visible sidebar
<div className="flex">
  <Sidebar />
  <Content />
</div>

// ✅ GOOD: Responsive layout
<div className="flex">
  <div className="hidden lg:block lg:w-80">
    <Sidebar />
  </div>
  <Content />
</div>
```

### Issue: Modal Too Large on Mobile
```tsx
// ❌ BAD: Fixed modal size
<div className="w-600 h-400">Modal</div>

// ✅ GOOD: Responsive modal
<div className="w-full sm:w-96 md:w-[500px] max-h-[90vh]">
  Modal that fits all screens
</div>
```

---

## 📊 Breakpoint Reference

```
Mobile First (recommended):
- Default styles (mobile: 320px - 639px)
- sm:  640px and up  (large phones, small tablets)
- md:  768px and up  (tablets, large tablets)
- lg:  1024px and up (laptops, small desktops)
- xl:  1280px and up (desktops)
- 2xl: 1536px and up (large desktops, 4K)

Usage:
<div className="w-full sm:w-1/2 md:w-2/3 lg:w-3/4">
  Width: 100% on mobile, 50% on sm+, 66% on md+, 75% on lg+
</div>
```

---

## ✅ Testing Checklist for Each Component

```
Before committing responsive changes:

□ 375px (iPhone SE)
  □ No horizontal scroll
  □ All buttons clickable (≥ 48x48px)
  □ Text readable (≥ 16px)
  □ All features accessible

□ 768px (iPad)
  □ Layout proper for tablet
  □ No awkward spacing
  □ Sidebars visible or accessible

□ 1024px (iPad Pro / Laptop)
  □ Full layout visible
  □ All elements properly sized
  □ No mobile UI on desktop

□ 1920px (Desktop)
  □ Content centered if needed
  □ Not too stretched
  □ Proper max-widths applied

□ All browsers
  □ Chrome DevTools
  □ Firefox DevTools
  □ Safari (if possible)
```

---

## 💾 Copy-Paste Template

Here's a complete template for a new responsive page:

```tsx
export function MyResponsivePage() {
  const [showDrawer, setShowDrawer] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Mobile Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/50"
            onClick={() => setShowDrawer(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 overflow-y-auto">
            {/* Drawer content */}
          </aside>
        </div>
      )}

      {/* Main Container */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-80 border-r border-slate-700">
          {/* Sidebar content */}
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Topbar */}
          <header className="lg:hidden border-b border-slate-700 p-4 flex items-center">
            <button 
              onClick={() => setShowDrawer(true)}
              className="p-2 hover:bg-slate-800 rounded"
            >
              <Menu size={24} />
            </button>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
              {/* Your responsive content here */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 md:mb-8">
                Page Title
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Card items */}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
```

---

**Ready to implement! Pick a page and start with one of these patterns.**
