import React from 'react';
import {AbsoluteFill} from 'remotion';
import {AliCharacter, EXPRESSIONS, mixExpression, POSES} from '../../../components/AliCharacter';
import {AnimatedText} from '../../../components/AnimatedText';
import {TEACHER_FACES, TeacherCharacter} from '../../../components/TeacherCharacter';
import {SchoolWatermark} from '../../../components/Watermark';
import {loadFonts} from '../../../fonts';
import {COLORS} from '../../../theme';
import {At, Stage} from '../../../scenes/Stage';

loadFonts();

/** Cover for Episode 5: professor Ali (huge glasses, cap), a giant dictionary, the disappointed teacher. */
export const Ep05Thumbnail: React.FC = () => (
  <AbsoluteFill style={{background: '#0E7490'}}>
    <Stage>
      <defs>
        <linearGradient id="th5" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#0E7490" />
        </linearGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#th5)" />
      <circle cx={430} cy={1060} r={520} fill={COLORS.yellow} opacity={0.9} />
      {/* the teacher peeks in from the right, deeply unimpressed */}
      <TeacherCharacter x={960} y={2050} scale={1.45} face={TEACHER_FACES.disappointed} lookX={-1} lookY={0.2} headTilt={6} armL="hip" armR="down" frozen />
      <AliCharacter x={420} y={2120} scale={1.75} pose={{...POSES.armsUpShock, armL: [150, 22], armR: [40, -120], headTilt: -6, lookX: 0.8, lookY: 0}} expression={mixExpression(EXPRESSIONS.embarrassed, EXPRESSIONS.shocked, 0.55)} handL="open" handR="open" glasses={2.1} gradCap frozen blink={0} />
      {/* massive dictionary */}
      <g transform="translate(250 1720) rotate(-8)">
        <rect x={-230} y={-160} width={460} height={320} rx={22} fill={COLORS.ink} opacity={0.35} transform="translate(12 16)" />
        <rect x={-230} y={-160} width={460} height={320} rx={22} fill="#B91C1C" stroke={COLORS.ink} strokeWidth={9} />
        <rect x={-230} y={110} width={460} height={50} fill="#FEF3C7" stroke={COLORS.ink} strokeWidth={7} />
        <text y={-30} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={64} fill={COLORS.yellow} stroke={COLORS.ink} strokeWidth={8} paintOrder="stroke">
          DICTIONARY
        </text>
        <text y={46} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={40} fill={COLORS.white}>
          10 000 000 WORDS
        </text>
      </g>
    </Stage>
    <At x={540} y={240}>
      <AnimatedText text={'ALI PROFESSOR|BO‘LIBDI!'} from={-60} size={124} accentWords={['PROFESSOR']} accent={COLORS.yellow} rotate={-4} />
    </At>
    <div style={{position: 'absolute', left: 0, right: 0, top: 540, display: 'flex', justifyContent: 'center'}}>
      <div style={{background: COLORS.white, color: COLORS.navy, border: `6px solid ${COLORS.navy}`, borderRadius: 999, padding: '10px 36px', fontFamily: 'Montserrat', fontWeight: 900, fontSize: 42, whiteSpace: 'nowrap', transform: 'rotate(2deg)'}}>ALI VA IELTS WRITING · 5-QISM</div>
    </div>
    <SchoolWatermark />
  </AbsoluteFill>
);
