import React from 'react';
import { User } from '@/lib/chatDummyData';

export function UserAvatar({ user, size = 8 }: { user: User; size?: number }) {
  const initials = user.name.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase();
  return (
    <div className={`flex items-center justify-center rounded-full bg-[#0A4DAD] text-white`} style={{width: size*4, height: size*4}}>
      <span className={`text-sm font-medium`}>{user.avatar ? '' : initials}</span>
    </div>
  );
}

export default UserAvatar;
