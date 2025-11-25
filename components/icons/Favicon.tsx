import * as React from "react";

const Favicon = ({ color = "#00acc1", ...props }: React.SVGProps<SVGSVGElement> & { color?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    {...props}
  >
    <rect width="64" height="64" rx="16" fill={color} />
    <text x="32" y="52" fontFamily="Montserrat, sans-serif" fontWeight="900" fontStyle="italic" fontSize="48" fill="#ffffff" textAnchor="middle">F</text>
  </svg>
);
export default Favicon;