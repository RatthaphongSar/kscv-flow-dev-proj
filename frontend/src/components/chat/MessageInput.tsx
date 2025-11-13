import { useRef, useState, useEffect } from 'react';
import { users, User } from '@/lib/chatDummyData';

interface Attachment {
  file: File;
  preview: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];

export function MessageInput({ onSend } : { onSend: (text: string, attachment?: Attachment | null) => void }) {
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [mentions, setMentions] = useState<User[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStart, setMentionStart] = useState(-1);
  const [error, setError] = useState('');
  
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (taRef.current) {
      taRef.current.style.height = 'auto';
      taRef.current.style.height = Math.min(taRef.current.scrollHeight, 120) + 'px';
    }
  }, [text]);

  // Handle @mention detection
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const afterAt = value.substring(lastAtIndex + 1);
      
      // Check if we're still in mention mode (no space/special char after @)
      if (!afterAt.includes(' ') && !afterAt.includes('\n')) {
        setMentionStart(lastAtIndex);
        setMentionQuery(afterAt.toLowerCase());
        setShowMentions(true);
        setMentions(users.filter(u => u.name.toLowerCase().includes(afterAt.toLowerCase())));
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  // Insert mention
  const insertMention = (user: typeof users[0]) => {
    const before = text.substring(0, mentionStart);
    const after = text.substring(mentionStart + mentionQuery.length + 1);
    const newText = `${before}@${user.name} ${after}`;
    setText(newText);
    setShowMentions(false);
    setMentions([]);
    taRef.current?.focus();
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds 10MB limit. (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      return;
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError('File type not allowed. Allowed: images, PDF, Word docs, text files.');
      return;
    }

    const preview = URL.createObjectURL(file);
    setAttachment({ file, preview });
  };

  // Remove attachment
  const removeAttachment = () => {
    if (attachment) {
      URL.revokeObjectURL(attachment.preview);
    }
    setAttachment(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  function submit() {
    const v = text.trim();
    if (!v && !attachment) return;
    onSend(v, attachment);
    setText('');
    removeAttachment();
  }

  return (
    <div className="p-4 border-t bg-white">
      {/* Error message */}
      {error && (
        <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
          <button onClick={() => setError('')} className="float-right text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      {/* Attachment preview */}
      {attachment && (
        <div className="mb-2 p-2 bg-gray-100 rounded flex items-center justify-between">
          <div className="flex items-center gap-2">
            {attachment.file.type.startsWith('image/') ? (
              <img src={attachment.preview} alt="preview" className="w-10 h-10 object-cover rounded" />
            ) : (
              <div className="w-10 h-10 bg-gray-300 rounded flex items-center justify-center text-xs">📄</div>
            )}
            <span className="text-sm text-gray-700">{attachment.file.name} ({(attachment.file.size / 1024).toFixed(0)}KB)</span>
          </div>
          <button onClick={removeAttachment} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
      )}

      {/* Mention dropdown */}
      {showMentions && mentions.length > 0 && (
        <div className="mb-2 p-2 bg-white border rounded shadow-lg max-h-40 overflow-y-auto">
          <div className="text-xs text-gray-500 mb-1">Select to mention:</div>
          {mentions.map(u => (
            <button
              key={u.id}
              onClick={() => insertMention(u)}
              className="block w-full text-left px-2 py-1 text-sm hover:bg-blue-50 rounded"
            >
              @{u.name} <span className="text-gray-500 text-xs">({u.role})</span>
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-3">
        {/* Attachment button */}
        <button 
          onClick={() => fileRef.current?.click()}
          className="p-2 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-800"
          title="Attach file (Max 10MB)"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.5 2v19c0 .55-.45 1-1 1H3.5c-.55 0-1-.45-1-1V2m4 6h10M9 4v16M15 4v16" />
          </svg>
        </button>

        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
        />

        {/* Textarea */}
        <textarea
          ref={taRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          className="flex-1 resize-none rounded-xl p-3 bg-[#F5F9FF] focus:outline-none border border-gray-200 focus:border-[#0A4DAD] focus:ring-1 focus:ring-[#0A4DAD]"
          placeholder="Type @ to mention... (Shift+Enter for new line)"
        />

        {/* Send button */}
        <button 
          onClick={submit} 
          className="bg-[#0A4DAD] text-white px-4 py-2 rounded-lg hover:bg-[#083a7f] transition"
          title="Send (Enter)"
        >
          Send
        </button>
      </div>

      {/* Helper text */}
      <div className="text-xs text-gray-400 mt-1">Tip: Type @ to mention someone • Max file size: 10MB</div>
    </div>
  );
}

export default MessageInput;
