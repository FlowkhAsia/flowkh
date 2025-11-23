import * as React from "react";

const Favicon = ({ color = "#00acc1", ...props }: React.SVGProps<SVGSVGElement> & { color?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    {...props}
  >
    <rect width="64" height="64" rx="16" fill={color} />
    <path d="M24 18 L46 32 L24 46 Z" fill="#ffffff" stroke="#ffffff" strokeWidth="4" strokeLinejoin="round" />
  </svg>
);
export default Favicon;