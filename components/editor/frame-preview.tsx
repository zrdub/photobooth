"use client";

import { useId } from "react";
import type { FrameConfig } from "@/store/booth-store";

type FramePreviewProps = {
  frame: FrameConfig;
};

function PatternPreview({ frame }: FramePreviewProps) {
  const marks = [
    [18, 18],
    [128, 20],
    [56, 44],
    [154, 58],
    [28, 78],
    [112, 88],
  ];

  if (frame.pattern === "none") return null;

  return (
    <g opacity="0.5">
      {marks.map(([x, y], index) => {
        if (frame.pattern === "stars") {
          return <path key={index} d={`M${x} ${y - 8} L${x + 3} ${y - 2} L${x + 10} ${y - 1} L${x + 5} ${y + 4} L${x + 6} ${y + 11} L${x} ${y + 7} L${x - 6} ${y + 11} L${x - 5} ${y + 4} L${x - 10} ${y - 1} L${x - 3} ${y - 2} Z`} fill={frame.accent} />;
        }
        if (frame.pattern === "dots") {
          return <circle key={index} cx={x} cy={y} r={index % 2 === 0 ? 4 : 6} fill={frame.accent} />;
        }
        if (frame.pattern === "checker") {
          return <rect key={index} x={x - 6} y={y - 6} width="12" height="12" rx="2" fill={frame.accent} transform={`rotate(45 ${x} ${y})`} />;
        }
        if (frame.pattern === "ribbon") {
          return (
            <g key={index} transform={`translate(${x} ${y}) rotate(${index % 2 === 0 ? -12 : 12})`}>
              <rect x="-12" y="-6" width="11" height="12" rx="4" fill={frame.accent} />
              <rect x="1" y="-6" width="11" height="12" rx="4" fill={frame.accent} />
              <circle cx="0" cy="0" r="3" fill="#ffffff" />
            </g>
          );
        }
        return (
          <g key={index} transform={`translate(${x} ${y})`}>
            <circle cx="-4" cy="-4" r="6" fill={frame.accent} />
            <circle cx="4" cy="-4" r="6" fill={frame.accent} />
            <rect x="-6" y="-3" width="12" height="12" rx="2" fill={frame.accent} transform="rotate(45)" />
          </g>
        );
      })}
    </g>
  );
}

export function FramePreview({ frame }: FramePreviewProps) {
  const gradientId = useId().replace(/:/g, "");

  return (
    <svg viewBox="0 0 190 118" role="img" aria-label={`${frame.name} frame preview`} className="h-24 w-full rounded-[18px] border border-white/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.5)]">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="190" y2="118">
          <stop offset="0%" stopColor={frame.background[0]} />
          <stop offset="100%" stopColor={frame.background[1]} />
        </linearGradient>
      </defs>
      <rect width="190" height="118" rx="18" fill={`url(#${gradientId})`} />
      <PatternPreview frame={frame} />
      <rect x="18" y="18" width="67" height="72" rx="12" fill={frame.border} opacity="0.95" />
      <rect x="24" y="24" width="55" height="60" rx="9" fill="#fff8fb" opacity="0.88" />
      <rect x="104" y="18" width="67" height="72" rx="12" fill={frame.border} opacity="0.95" />
      <rect x="110" y="24" width="55" height="60" rx="9" fill="#fff8fb" opacity="0.88" />
      <circle cx="44" cy="52" r="8" fill={frame.accent} opacity="0.28" />
      <circle cx="130" cy="52" r="8" fill={frame.accent} opacity="0.28" />
      <rect x="42" y="99" width="106" height="6" rx="3" fill={frame.accent} opacity="0.65" />
      <circle cx="163" cy="100" r="7" fill="#ffffff" opacity="0.72" />
      <path d="M163 104C160 101 156 98 156 94C156 91 158 89 161 90C162 90 163 91 163 92C164 91 165 90 166 90C169 89 171 91 171 94C171 98 166 101 163 104Z" fill={frame.accent} />
    </svg>
  );
}
