// frontend/src/components/Preloader.jsx
import React from "react"

export default function Preloader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#020617]">
      {/* Glow Circle */}
      <div className="relative">
        <div className="w-28 h-28 rounded-full border-4 border-violet-600/30 border-t-violet-400 animate-spin-slow"></div>

        {/* Logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/kvc-logo.png"
            alt="KVC Logo"
            className="w-12 h-12 object-contain drop-shadow-xl animate-pulse scale-125"
          />
        </div>
      </div>

      {/* Loading Text */}
      {/* <div className="mt-6 text-gray-300 text-sm tracking-wide animate-fade-in">
        loading...
      </div> */}
    </div>
  )
}
