import React from "react";

export const Txt: React.FC<{ x: number; y: number; size: number; children: React.ReactNode; fill?: string; stroke?: string; sw?: number; anchor?: "start" | "middle" | "end"; font?: "anton" | "sg"; scale?: number; opacity?: number; rot?: number; glow?: string; weight?: number }> = ({ x, y, size, children, fill = "#fff", stroke = "#0A1442", sw = 12, anchor = "middle", font = "anton", scale = 1, opacity = 1, rot = 0, glow, weight = 700 }) => (
  <text transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`} textAnchor={anchor} fontFamily={font === "anton" ? "AntonX" : "SGrotesk"} fontWeight={font === "sg" ? weight : 400} fontSize={size} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" paintOrder="stroke fill" opacity={opacity} style={glow ? { filter: `drop-shadow(0 0 18px ${glow})` } : undefined}>{children}</text>
);

export const Pill: React.FC<{ x: number; y: number; w: number; h?: number; fill: string; text: string; color?: string; size?: number; scale?: number; opacity?: number; badge?: string }> = ({ x, y, w, h = 84, fill, text, color = "#0A1442", size = 42, scale = 1, opacity = 1, badge }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
    <rect x={-w / 2} y={-h / 2 + 8} width={w} height={h} rx={h / 2} fill="#04112E" opacity="0.55" />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={fill} stroke="#fff" strokeWidth="4" />
    {badge && <g><circle cx={-w / 2 + h / 2} cy="0" r={h / 2 - 8} fill="#0A1442" /><text x={-w / 2 + h / 2} y={size * 0.36} textAnchor="middle" fontFamily="AntonX" fontSize={size * 1.25} fill="#FFE766">{badge}</text></g>}
    <text x={badge ? h / 2 - 6 : 0} y={size * 0.36} textAnchor="middle" fontFamily="SGrotesk" fontWeight="700" fontSize={size} fill={color}>{text}</text>
  </g>
);

export const Star: React.FC<{ x: number; y: number; r: number; rot?: number; fill?: string; opacity?: number }> = ({ x, y, r, rot = 0, fill = "#fff", opacity = 1 }) => (
  <path d={`M0 ${-r} Q${r * 0.14} ${-r * 0.14} ${r} 0 Q${r * 0.14} ${r * 0.14} 0 ${r} Q${-r * 0.14} ${r * 0.14} ${-r} 0 Q${-r * 0.14} ${-r * 0.14} 0 ${-r}Z`} transform={`translate(${x} ${y}) rotate(${rot})`} fill={fill} opacity={opacity} />
);
