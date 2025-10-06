# KVC Assistant (Frontend Widget)

## Install
```
npm i lucide-react
```

## Usage
```jsx
import AssistantWidget from './components/AssistantWidget'

export default function App() {
  const userId = 'student-123'
  const roomId = 'room-abc'
  return <AssistantWidget userId={userId} roomId={roomId} />
}
```

Set `VITE_API_BASE=http://localhost:4000/api` in your frontend `.env`.
