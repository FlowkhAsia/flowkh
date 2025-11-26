import React from 'react';

export default function Loading() {
  return (
    <div className="flex justify-center items-center h-screen w-full">
      <div className="w-16 h-16 border-4 border-[var(--brand-color)] border-solid border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}