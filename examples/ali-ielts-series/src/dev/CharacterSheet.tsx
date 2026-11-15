import React from 'react';
import {AbsoluteFill} from 'remotion';
import {AliCharacter, EXPRESSIONS, POSES, type ExpressionName} from '../components/AliCharacter';
import {COLORS} from '../theme';
import {loadFonts} from '../fonts';

loadFonts();

const names = Object.keys(EXPRESSIONS) as ExpressionName[];
const poses = [POSES.stand, POSES.pointUpRight, POSES.fistUp, POSES.shrug, POSES.holdPhone, POSES.seatedLazy, POSES.armsUpShock, POSES.pointViewer, POSES.seated];

/** Model sheet: every expression × a pose, used to review the character design. */
export const CharacterSheet: React.FC = () => (
  <AbsoluteFill style={{background: '#E2E8F0'}}>
    <svg viewBox="0 0 1080 1920" width={1080} height={1920}>
      {names.map((n, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        return (
          <g key={n}>
            <AliCharacter
              x={180 + col * 360}
              y={600 + row * 620}
              scale={0.82}
              expression={n}
              pose={poses[i]}
              itemR={i === 4 ? 'phone' : 'none'}
              phoneGlow={i === 4 ? 1 : 0}
              handR={i === 1 || i === 7 ? 'point' : 'fist'}
              headphones={i === 8}
              blink={0}
            />
            <text x={180 + col * 360} y={640 + row * 620} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={30} fill={COLORS.navy}>
              {n}
            </text>
          </g>
        );
      })}
    </svg>
  </AbsoluteFill>
);
