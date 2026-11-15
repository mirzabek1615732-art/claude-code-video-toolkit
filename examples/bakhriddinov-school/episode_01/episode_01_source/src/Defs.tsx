import React from "react";

/** shared gradients and filters, referenced by id from every SVG layer */
export const Defs: React.FC = () => (
  <svg width="0" height="0" style={{ position: "absolute" }}>
    <defs>
      <linearGradient id="bodyG" x1="0" y1="-1" x2="0.2" y2="1"><stop offset="0" stopColor="#FF9AA8" /><stop offset="0.45" stopColor="#F2508A" /><stop offset="1" stopColor="#A02EA6" /></linearGradient>
      <radialGradient id="bodyHi" cx="0.3" cy="0.22" r="0.55"><stop offset="0" stopColor="#fff" stopOpacity="0.65" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
      <radialGradient id="bodyShade" cx="0.6" cy="0.95" r="0.7"><stop offset="0" stopColor="#4a0f6e" stopOpacity="0" /><stop offset="1" stopColor="#4a0f6e" stopOpacity="0.55" /></radialGradient>
      <linearGradient id="rimG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#8DF7FF" stopOpacity="0.95" /><stop offset="0.35" stopColor="#8DF7FF" stopOpacity="0" /><stop offset="1" stopColor="#FFC27D" stopOpacity="0.5" /></linearGradient>
      <linearGradient id="armG" gradientUnits="userSpaceOnUse" x1="0" y1="150" x2="0" y2="560"><stop offset="0" stopColor="#F2508A" /><stop offset="1" stopColor="#B53AAA" /></linearGradient>
      <radialGradient id="heartG" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stopColor="#FFB3C8" /><stop offset="0.35" stopColor="#FF4F7E" /><stop offset="1" stopColor="#C4123F" /></radialGradient>
      <radialGradient id="eyeG" cx="0.4" cy="0.35" r="0.8"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#DDE8F5" /></radialGradient>
      <radialGradient id="irisG" cx="0.5" cy="0.4" r="0.7"><stop offset="0" stopColor="#FFD86B" /><stop offset="1" stopColor="#E8892B" /></radialGradient>
      <linearGradient id="dropG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8EF1FF" /><stop offset="0.5" stopColor="#2F8CFF" /><stop offset="1" stopColor="#1637C8" /></linearGradient>
      <radialGradient id="cuG" cx="0.35" cy="0.3" r="0.85"><stop offset="0" stopColor="#FFD2A6" /><stop offset="0.45" stopColor="#E08A4A" /><stop offset="1" stopColor="#8A431D" /></radialGradient>
      <radialGradient id="feG" cx="0.35" cy="0.3" r="0.85"><stop offset="0" stopColor="#FFC0B8" /><stop offset="0.5" stopColor="#D8453A" /><stop offset="1" stopColor="#6A1410" /></radialGradient>
      <radialGradient id="o2G" cx="0.35" cy="0.3" r="0.85"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.6" stopColor="#FF8A8A" /><stop offset="1" stopColor="#D83A3A" /></radialGradient>
      <radialGradient id="protG" cx="0.4" cy="0.35" r="0.75"><stop offset="0" stopColor="#CFF6FF" stopOpacity="0.85" /><stop offset="1" stopColor="#4FB3FF" stopOpacity="0.55" /></radialGradient>
      <linearGradient id="titleG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#FFC3E1" /></linearGradient>
      <linearGradient id="goldG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF3A8" /><stop offset="1" stopColor="#FFB02E" /></linearGradient>
      <linearGradient id="vocabG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FF5FA8" /><stop offset="0.55" stopColor="#FFB02E" /><stop offset="1" stopColor="#FFF07A" /></linearGradient>
    </defs>
  </svg>
);
