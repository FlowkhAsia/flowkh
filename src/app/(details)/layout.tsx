import React from 'react';

// This layout ensures that all pages within the (details) group share the same root layout.
export default function DetailsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}