import React from 'react';
import {AbsoluteFill, Easing, Html5Audio, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Sfx} from '../components/AudioManager';
import {loadBrandFonts} from './fonts';
import {LogoReveal} from './LogoReveal';

loadBrandFonts();

/* ------------------------------------------------------------------ *
 * Teacher intro reel: talking-head segments + premium monochrome
 * overlays (logo-cell style), word-synced captions, certificate
 * cutaways, text-behind-subject hook, zoom-through logo outro.
 * All personal content comes in through props (kept out of git).
 * ------------------------------------------------------------------ */

export type Word = {text: string; start: number; end: number};
export type Seg = {src: string; duration: number; words: Word[]; captions: boolean};

export type IntroProps = {
  segments: Seg[]; // [hook, name, credentials, results, cta]
  cutoutDir: string; // RGBA frames of the hook segment, 0000.png …
  cutoutCount: number;
  hookSmall: string;
  hookBig: string;
  name: string;
  title: string;
  scores: {l: string; r: string; w: string; s: string; overall: string};
  multilevel: string;
  multilevelScore: string;
  uni: string;
  uniSub: string;
  years: string;
  students: number;
  studentsLabel: string;
  percent: number;
  percentLabel: string;
  progressFrom: string;
  progressTo: string;
  resultsLabel: string;
  dailyTag: string;
  followText: string;
  followDone: string;
  commentQ: string;
  answers: string[];
  certs: {hook: string; own: string; studentA: string; studentB: string};
  /** zoom targets (in 1080×1920 px of the certificate still) */
  certFocus: {hook: [number, number]; own: [number, number]; studentA: [number, number]; studentB: [number, number]};
  /** event times in seconds, local to each segment */
  t: {
    hookCertIn: number;
    nameIn: number;
    ownCertIn: number;
    ownCertOut: number;
    multilevelIn: number;
    uniIn: number;
    yearsIn: number;
    studentsIn: number;
    percentIn: number;
    studentCertsIn: number;
    dailyIn: number;
    skillsIn: number;
    followIn: number;
    followTap: number;
    commentIn: number;
    pushIn: number;
  };
  tvFocus: [number, number];
  monogram: string;
  schoolLine1: string;
  schoolLine2: string;
  tagline: string;
  music: string;
  /** 0 = no music bed (e.g. when music is added inside Instagram) */
  musicGain: number;
};

const FPS = 30;
const BLACK = 'Archivo Black';
const ARCH = 'Archivo';
const W = '#FFFFFF';
const INK = '#0B0B0C';
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const io = (f: number, a: number, b: number, from = 0, to = 1) => interpolate(f, [a, b], [from, to], {...clamp, easing: ease});
const s2f = (s: number) => Math.round(s * FPS);

/** spring 0→1 starting at frame `at` (no overshoot by default) */
const sp = (f: number, at: number, damping = 18) => spring({frame: f - at, fps: FPS, config: {damping, stiffness: 170, mass: 0.8}});

/** Logo-cell card: black box with a white keyline, like the BS logo. */
const Cell: React.FC<{children: React.ReactNode; style?: React.CSSProperties; light?: boolean}> = ({children, style, light}) => (
  <div
    style={{
      background: light ? W : 'rgba(11,11,12,0.92)',
      color: light ? INK : W,
      border: `5px solid ${light ? INK : W}`,
      padding: '14px 26px 12px',
      boxShadow: '0 18px 40px rgba(0,0,0,0.28)',
      ...style,
    }}
  >
    {children}
  </div>
);

/** Reveal: wipes in from the left and lifts, fades out at `out`. */
const Reveal: React.FC<{f: number; at: number; out?: number; children: React.ReactNode; style?: React.CSSProperties; from?: 'left' | 'up' | 'scale'}> = ({
  f,
  at,
  out,
  children,
  style,
  from = 'left',
}) => {
  if (f < at) return null;
  const p = sp(f, at);
  const o = out === undefined ? 1 : io(f, out - 6, out, 1, 0);
  if (out !== undefined && f > out) return null;
  const clip = from === 'left' ? `inset(0 ${(1 - p) * 100}% 0 0)` : undefined;
  const tf = from === 'up' ? `translateY(${(1 - p) * 40}px)` : from === 'scale' ? `scale(${0.85 + 0.15 * p})` : `translateX(${(1 - p) * -30}px)`;
  return <div style={{position: 'absolute', clipPath: clip, transform: tf, opacity: o * Math.min(1, p * 1.6), ...style}}>{children}</div>;
};

/** Captions: 1–3 word pages, active word inverted in a white box. */
const Captions: React.FC<{words: Word[]; f: number}> = ({words, f}) => {
  const t = f / FPS;
  const pages: Word[][] = [];
  let cur: Word[] = [];
  for (const w of words) {
    const chars = cur.reduce((n, x) => n + x.text.length + 1, 0);
    if (cur.length && (cur.length >= 3 || chars + w.text.length > 18 || w.start - cur[cur.length - 1].end > 0.35)) {
      pages.push(cur);
      cur = [];
    }
    cur.push(w);
    if (/[.!?:,]$/.test(w.text)) {
      pages.push(cur);
      cur = [];
    }
  }
  if (cur.length) pages.push(cur);
  const page = pages.find((p, i) => t >= p[0].start - 0.08 && t < (pages[i + 1] ? pages[i + 1][0].start - 0.08 : p[p.length - 1].end + 0.4));
  if (!page) return null;
  const at = s2f(page[0].start - 0.08);
  const p = sp(f, at, 22);
  return (
    <div
      style={{
        position: 'absolute',
        left: 90,
        right: 90,
        top: 1335,
        display: 'flex',
        justifyContent: 'center',
        transform: `translateY(${(1 - p) * 18}px)`,
        opacity: Math.min(1, p * 2),
      }}
    >
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px 6px', background: 'rgba(11,11,12,0.9)', border: `4px solid ${W}`, padding: '10px 12px'}}>
      {page.map((w, i) => {
        const active = t >= w.start - 0.04 && t < w.end + 0.06;
        return (
          <span
            key={i}
            style={{
              fontFamily: BLACK,
              fontSize: 58,
              lineHeight: 1.2,
              padding: '0 12px',
              color: active ? INK : W,
              background: active ? W : 'transparent',
              textTransform: 'uppercase',
              letterSpacing: -0.5,
            }}
          >
            {w.text}
          </span>
        );
      })}
      </div>
    </div>
  );
};

/** Full-screen certificate still with a slow push towards a focus point. */
const CertShot: React.FC<{src: string; f: number; dur: number; focus: [number, number]; zoom: number; dim?: number; ring?: boolean}> = ({src, f, dur, focus, zoom, dim = 0, ring}) => {
  const z = interpolate(f, [0, dur], [1.05, zoom], {...clamp, easing: Easing.bezier(0.45, 0, 0.2, 1)});
  const r = io(f, dur * 0.35, dur * 0.35 + 8);
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <AbsoluteFill style={{transformOrigin: `${focus[0]}px ${focus[1]}px`, transform: `scale(${z})`}}>
        <Img src={staticFile(src)} style={{width: 1080, height: 1920}} />
        {ring ? (
          <div
            style={{
              position: 'absolute',
              left: focus[0] - 62,
              top: focus[1] - 48,
              width: 124,
              height: 96,
              border: `${6 / z}px solid ${INK}`,
              outline: `${3 / z}px solid ${W}`,
              opacity: r,
              transform: `scale(${1.4 - 0.4 * r})`,
            }}
          />
        ) : null}
      </AbsoluteFill>
      {dim > 0 ? <AbsoluteFill style={{background: `rgba(0,0,0,${dim})`}} /> : null}
    </AbsoluteFill>
  );
};

/* ---------------- segment 1: walk-in with text behind subject ---------------- */
const HookSeg: React.FC<{p: IntroProps; seg: Seg}> = ({p, seg}) => {
  const f = useCurrentFrame();
  const certAt = s2f(p.t.hookCertIn);
  const idx = Math.min(p.cutoutCount - 1, f);
  const track = interpolate(f, [0, 22], [10, -4], {...clamp, easing: ease});
  const barAt = s2f(seg.words.find((w) => /IELTS/i.test(w.text))?.start ?? 2.4);
  const bar = io(f, barAt, barAt + 10);
  return (
    <AbsoluteFill>
      <OffthreadVideo src={staticFile(seg.src)} />
      {f < certAt ? (
        <>
          <div style={{position: 'absolute', top: 196, width: 1080, textAlign: 'center', fontFamily: ARCH, fontWeight: 700, fontSize: 44, letterSpacing: 9, color: INK, transform: `translateY(${io(f, 0, 14, 16, 0)}px)`}}>
            {p.hookSmall}
          </div>
          <div style={{position: 'absolute', top: 250, width: 1080, textAlign: 'center', fontFamily: BLACK, fontSize: 132, lineHeight: 1, color: INK, letterSpacing: track * 0.6, whiteSpace: 'nowrap'}}>
            {p.hookBig.split(' ')[0]}
          </div>
          <div style={{position: 'absolute', top: 352, width: 1080, textAlign: 'center', fontFamily: BLACK, fontSize: 330, lineHeight: 1, color: INK, letterSpacing: track, whiteSpace: 'nowrap', transform: `scale(${1 + 0.05 * bar})`}}>
            {p.hookBig.split(' ').slice(1).join(' ')}
          </div>
          {/* the subject in front of the text */}
          <Img src={staticFile(`${p.cutoutDir}/${String(idx).padStart(4, '0')}.png`)} style={{position: 'absolute', inset: 0, width: 1080, height: 1920}} />
        </>
      ) : (
        <Sequence from={certAt} layout="none">
          <HookCert p={p} dur={s2f(seg.duration) - certAt} />
        </Sequence>
      )}
      <Sfx name="whoosh" at={certAt - 4} volume={0.18} />
    </AbsoluteFill>
  );
};

const HookCert: React.FC<{p: IntroProps; dur: number}> = ({p, dur}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: io(f, 0, 3)}}>
      <CertShot src={p.certs.hook} f={f} dur={dur} focus={p.certFocus.hook} zoom={2.3} ring />
      <Reveal f={f} at={6} from="up" style={{left: 0, right: 0, top: 1360, display: 'flex', justifyContent: 'center'}}>
        <Cell light style={{fontFamily: BLACK, fontSize: 58, letterSpacing: 1}}>
          {p.hookBig}
        </Cell>
      </Reveal>
    </AbsoluteFill>
  );
};

/* ---------------- segment 2: name tag ---------------- */
const NameSeg: React.FC<{p: IntroProps; seg: Seg}> = ({p, seg}) => {
  const f = useCurrentFrame();
  const at = s2f(p.t.nameIn);
  return (
    <AbsoluteFill>
      <OffthreadVideo src={staticFile(seg.src)} />
      <Reveal f={f} at={at} style={{left: 64, top: 250}}>
        <Cell>
          <div style={{fontFamily: BLACK, fontSize: 46, lineHeight: 1.05}}>{p.name}</div>
          <div style={{fontFamily: ARCH, fontWeight: 600, fontSize: 25, letterSpacing: 5, marginTop: 10, opacity: 0.85}}>{p.title}</div>
        </Cell>
      </Reveal>
      <Sfx name="swish" at={at - 2} volume={0.14} />
    </AbsoluteFill>
  );
};

/* ---------------- segment 3: credentials ---------------- */
const ScoreRow: React.FC<{p: IntroProps; f: number}> = ({p, f}) => {
  const cells: Array<[string, string]> = [
    ['LISTENING', p.scores.l],
    ['READING', p.scores.r],
    ['WRITING', p.scores.w],
    ['SPEAKING', p.scores.s],
  ];
  const ov = sp(f, 14);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34}}>
      <div style={{display: 'flex', gap: 18}}>
        {cells.map(([k, v], i) => {
          const q = sp(f, 2 + i * 3);
          return (
            <div
              key={k}
              style={{width: 214, height: 196, border: `5px solid ${W}`, background: 'rgba(11,11,12,0.86)', color: W, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `translateY(${(1 - q) * 50}px)`, opacity: Math.min(1, q * 1.5)}}
            >
              <div style={{fontFamily: BLACK, fontSize: 86, lineHeight: 1}}>{v}</div>
              <div style={{fontFamily: ARCH, fontWeight: 700, fontSize: 21, letterSpacing: 3, marginTop: 12}}>{k}</div>
            </div>
          );
        })}
      </div>
      <div style={{background: W, color: INK, border: `5px solid ${W}`, padding: '18px 44px', display: 'flex', alignItems: 'baseline', gap: 26, transform: `scale(${0.8 + 0.2 * ov})`, opacity: Math.min(1, ov * 1.5)}}>
        <span style={{fontFamily: ARCH, fontWeight: 700, fontSize: 32, letterSpacing: 6}}>IELTS OVERALL</span>
        <span style={{fontFamily: BLACK, fontSize: 120, lineHeight: 1}}>{p.scores.overall}</span>
      </div>
    </div>
  );
};

const CredSeg: React.FC<{p: IntroProps; seg: Seg}> = ({p, seg}) => {
  const f = useCurrentFrame();
  const cIn = s2f(p.t.ownCertIn);
  const cOut = s2f(p.t.ownCertOut);
  const mIn = s2f(p.t.multilevelIn);
  const uIn = s2f(p.t.uniIn);
  return (
    <AbsoluteFill>
      <OffthreadVideo src={staticFile(seg.src)} />
      {f >= cIn && f < cOut ? (
        <Sequence from={cIn} durationInFrames={cOut - cIn} layout="none">
          <OwnCert p={p} dur={cOut - cIn} />
        </Sequence>
      ) : null}
      <Reveal f={f} at={mIn} out={uIn} style={{left: 64, top: 250}}>
        <Cell style={{display: 'flex', alignItems: 'center', gap: 22}}>
          <span style={{fontFamily: ARCH, fontWeight: 700, fontSize: 30, letterSpacing: 6}}>{p.multilevel.split(' ')[0]}</span>
          <span style={{fontFamily: BLACK, fontSize: 84, lineHeight: 1}}>{p.multilevel.split(' ').slice(1).join(' ')}</span>
          {p.multilevelScore ? <span style={{fontFamily: ARCH, fontWeight: 600, fontSize: 34, opacity: 0.8}}>· {p.multilevelScore}</span> : null}
        </Cell>
      </Reveal>
      <Reveal f={f} at={uIn} style={{left: 64, top: 250}}>
        <Cell>
          <div style={{fontFamily: BLACK, fontSize: 50, lineHeight: 1.05}}>{p.uni}</div>
          <div style={{fontFamily: ARCH, fontWeight: 600, fontSize: 27, letterSpacing: 4, marginTop: 10, opacity: 0.85}}>{p.uniSub}</div>
        </Cell>
      </Reveal>
      <Sfx name="whoosh" at={cIn - 4} volume={0.16} />
      <Sfx name="tick" at={mIn} volume={0.25} />
      <Sfx name="tick" at={uIn} volume={0.25} />
    </AbsoluteFill>
  );
};

const OwnCert: React.FC<{p: IntroProps; dur: number}> = ({p, dur}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: io(f, 0, 3) * io(f, dur - 3, dur, 1, 0)}}>
      <CertShot src={p.certs.own} f={f} dur={dur} focus={p.certFocus.own} zoom={1.35} dim={0.55} />
      <ScoreRow p={p} f={f} />
      {[2, 5, 8, 11, 14].map((a) => (
        <Sfx key={a} name="tick" at={a} volume={0.18} />
      ))}
    </AbsoluteFill>
  );
};

/* ---------------- segment 4: results ---------------- */
const Ring: React.FC<{p: IntroProps; f: number}> = ({p, f}) => {
  const k = io(f, 0, 26);
  const R = 120;
  const C = 2 * Math.PI * R;
  return (
    <div style={{position: 'relative', width: 300, height: 300}}>
      <svg width={300} height={300} style={{position: 'absolute', inset: 0}}>
        <circle cx={150} cy={150} r={R} fill="rgba(11,11,12,0.9)" stroke="rgba(255,255,255,0.25)" strokeWidth={14} />
        <circle cx={150} cy={150} r={R} fill="none" stroke={W} strokeWidth={14} strokeDasharray={C} strokeDashoffset={C * (1 - (k * p.percent) / 100)} transform="rotate(-90 150 150)" strokeLinecap="butt" />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: BLACK, fontSize: 92, color: W}}>{Math.round(k * p.percent)}%</div>
    </div>
  );
};

const ResultsSeg: React.FC<{p: IntroProps; seg: Seg}> = ({p, seg}) => {
  const f = useCurrentFrame();
  const yIn = s2f(p.t.yearsIn);
  const sIn = s2f(p.t.studentsIn);
  const pIn = s2f(p.t.percentIn);
  const cIn = s2f(p.t.studentCertsIn);
  const end = s2f(seg.duration);
  const count = Math.round(io(f, sIn, sIn + 18) * p.students);
  const half = Math.floor((end - cIn) / 2);
  return (
    <AbsoluteFill>
      <OffthreadVideo src={staticFile(seg.src)} />
      <Reveal f={f} at={yIn} out={pIn} style={{left: 64, top: 250, display: 'flex', gap: 16}}>
        <Cell style={{fontFamily: BLACK, fontSize: 60, lineHeight: 1.05}}>{p.years}</Cell>
        {f >= sIn ? (
          <Cell light style={{display: 'flex', alignItems: 'baseline', gap: 14, transform: `scale(${0.85 + 0.15 * sp(f, sIn)})`, transformOrigin: 'left center'}}>
            <span style={{fontFamily: BLACK, fontSize: 60, lineHeight: 1.05}}>{count}+</span>
            <span style={{fontFamily: ARCH, fontWeight: 700, fontSize: 26, letterSpacing: 4}}>{p.studentsLabel}</span>
          </Cell>
        ) : null}
      </Reveal>
      {f >= pIn && f < cIn ? (
        <div style={{position: 'absolute', left: 64, top: 240, display: 'flex', alignItems: 'center', gap: 24, opacity: Math.min(1, sp(f, pIn) * 1.6), transform: `scale(${0.85 + 0.15 * sp(f, pIn)})`, transformOrigin: 'left center'}}>
          <Ring p={p} f={f - pIn} />
          <Cell light style={{fontFamily: ARCH, fontWeight: 700, fontSize: 30, letterSpacing: 4, maxWidth: 420, lineHeight: 1.25}}>
            {p.percentLabel}
          </Cell>
        </div>
      ) : null}
      {f >= cIn ? (
        <>
          <Sequence from={cIn} durationInFrames={half} layout="none">
            <StudentCert src={p.certs.studentA} focus={p.certFocus.studentA} dur={half} fadeIn />
          </Sequence>
          <Sequence from={cIn + half} durationInFrames={end - cIn - half} layout="none">
            <StudentCert src={p.certs.studentB} focus={p.certFocus.studentB} dur={end - cIn - half} fadeIn={false} />
          </Sequence>
          <Reveal f={f} at={cIn + 4} from="up" style={{left: 0, right: 0, top: 250, display: 'flex', justifyContent: 'center'}}>
            <Cell light style={{display: 'flex', alignItems: 'center', gap: 20}}>
              <span style={{fontFamily: ARCH, fontWeight: 700, fontSize: 28, letterSpacing: 5}}>{p.resultsLabel}</span>
              <span style={{fontFamily: BLACK, fontSize: 64}}>{p.progressFrom}</span>
              <svg width={70} height={30}>
                <path d={`M 2 15 L ${2 + 60 * io(f, cIn + 10, cIn + 22)} 15`} stroke={INK} strokeWidth={8} />
                <path d="M 50 3 L 66 15 L 50 27" fill="none" stroke={INK} strokeWidth={8} opacity={io(f, cIn + 20, cIn + 24)} />
              </svg>
              <span style={{fontFamily: BLACK, fontSize: 64, opacity: io(f, cIn + 20, cIn + 26)}}>{p.progressTo}</span>
            </Cell>
          </Reveal>
        </>
      ) : null}
      <Sfx name="tick" at={yIn} volume={0.25} />
      <Sfx name="tick" at={sIn} volume={0.25} />
      <Sfx name="swish" at={pIn - 2} volume={0.14} />
      <Sfx name="whoosh" at={cIn - 4} volume={0.16} />
      <Sfx name="ding" at={cIn + 24} volume={0.12} />
    </AbsoluteFill>
  );
};

/** fadeIn only for the first cutaway; a cert that follows another cert cuts in
 * hard, otherwise the talking clip underneath ghosts through the fade. */
const StudentCert: React.FC<{src: string; focus: [number, number]; dur: number; fadeIn: boolean}> = ({src, focus, dur, fadeIn}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: fadeIn ? io(f, 0, 3) : 1}}>
      <CertShot src={src} f={f} dur={dur} focus={focus} zoom={1.9} ring />
    </AbsoluteFill>
  );
};

/* ---------------- segment 5: daily tips + follow + comment, zoom into TV logo ---------------- */
const CtaSeg: React.FC<{p: IntroProps; seg: Seg}> = ({p, seg}) => {
  const f = useCurrentFrame();
  const end = s2f(seg.duration);
  const dIn = s2f(p.t.dailyIn);
  const kIn = s2f(p.t.skillsIn);
  const fIn = s2f(p.t.followIn);
  const tap = s2f(p.t.followTap);
  const cIn = s2f(p.t.commentIn);
  const push = s2f(p.t.pushIn);
  const z = interpolate(f, [push, end], [1, 4.2], {...clamp, easing: Easing.bezier(0.55, 0, 0.85, 0.35)});
  const blur = interpolate(f, [end - 8, end], [0, 6], clamp);
  const toBlack = io(f, end - 5, end);
  const skills = ['LISTENING', 'READING', 'WRITING', 'SPEAKING'];
  const answer = p.answers[Math.floor(Math.max(0, f - cIn - 18) / 12) % p.answers.length];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transformOrigin: `${p.tvFocus[0]}px ${p.tvFocus[1]}px`, transform: `scale(${z})`, filter: blur ? `blur(${blur}px)` : undefined}}>
        <OffthreadVideo src={staticFile(seg.src)} style={{width: 1080, height: 1920}} />
      </AbsoluteFill>
      {f < push ? (
        <>
          <Reveal f={f} at={dIn} out={kIn} style={{left: 64, top: 250}}>
            <Cell style={{fontFamily: BLACK, fontSize: 60}}>{p.dailyTag}</Cell>
          </Reveal>
          {f >= kIn && f < fIn ? (
            <div style={{position: 'absolute', left: 0, right: 0, top: 250, display: 'flex', justifyContent: 'center', gap: 12}}>
              {skills.map((s, i) => {
                const q = sp(f, kIn + i * 4);
                return (
                  <div key={s} style={{border: `4px solid ${INK}`, background: i === 1 || i === 3 ? INK : W, color: i === 1 || i === 3 ? W : INK, fontFamily: ARCH, fontWeight: 700, fontSize: 24, letterSpacing: 3, padding: '14px 16px', transform: `translateY(${(1 - q) * 30}px)`, opacity: Math.min(1, q * 1.5)}}>
                    {s}
                  </div>
                );
              })}
            </div>
          ) : null}
          {f >= fIn && f < cIn ? (
            <div style={{position: 'absolute', left: 0, right: 0, top: 250, display: 'flex', justifyContent: 'center'}}>
              <div
                style={{
                  background: f >= tap ? W : INK,
                  color: f >= tap ? INK : W,
                  border: `5px solid ${INK}`,
                  padding: '22px 46px',
                  fontFamily: BLACK,
                  fontSize: 52,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  transform: `scale(${(0.85 + 0.15 * sp(f, fIn)) * (f >= tap && f < tap + 5 ? 0.94 : 1)})`,
                  opacity: Math.min(1, sp(f, fIn) * 1.6),
                  boxShadow: '0 18px 40px rgba(0,0,0,0.25)',
                }}
              >
                {f >= tap ? (
                  <svg width={46} height={40}>
                    <path d="M 4 22 L 17 35 L 42 6" fill="none" stroke={INK} strokeWidth={9} />
                  </svg>
                ) : (
                  <span style={{fontSize: 60, lineHeight: 0.8}}>+</span>
                )}
                {f >= tap ? p.followDone : p.followText}
              </div>
            </div>
          ) : null}
          {f >= cIn ? (
            <>
              <Reveal f={f} at={cIn} from="up" style={{left: 64, right: 64, top: 240}}>
                <div style={{background: W, color: INK, border: `5px solid ${INK}`, padding: '24px 30px', boxShadow: '0 18px 40px rgba(0,0,0,0.25)'}}>
                  <div style={{fontFamily: BLACK, fontSize: 44, lineHeight: 1.15}}>{p.commentQ}</div>
                  <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 18, fontFamily: ARCH, fontWeight: 700, fontSize: 34}}>
                    <div style={{width: 48, height: 48, borderRadius: 24, background: INK}} />
                    <span style={{borderBottom: `4px solid ${INK}`, minWidth: 90, paddingBottom: 2}}>{f >= cIn + 18 ? answer : ''}</span>
                    <span style={{width: 4, height: 38, background: INK, opacity: Math.floor(f / 8) % 2 ? 1 : 0}} />
                  </div>
                </div>
              </Reveal>
              {/* arrow toward Instagram's comment button */}
              <svg width={90} height={150} style={{position: 'absolute', left: 950, top: 1180 + Math.sin(f / 5) * 10, opacity: io(f, cIn + 10, cIn + 18)}}>
                <path d="M 45 6 L 45 120 M 15 92 L 45 124 L 75 92" fill="none" stroke={W} strokeWidth={12} style={{filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))'}} />
              </svg>
            </>
          ) : null}
        </>
      ) : null}
      <AbsoluteFill style={{background: '#000', opacity: toBlack}} />
      <Sfx name="tick" at={dIn} volume={0.25} />
      {skills.map((_, i) => (
        <Sfx key={i} name="tick" at={kIn + i * 4} volume={0.14} />
      ))}
      <Sfx name="swish" at={fIn - 2} volume={0.14} />
      <Sfx name="pop" at={tap} volume={0.18} />
      <Sfx name="swish" at={cIn - 2} volume={0.14} />
      <Sfx name="whoosh" at={push + 2} volume={0.28} rate={0.85} />
    </AbsoluteFill>
  );
};

/* ---------------- master ---------------- */
export const TeacherIntroReel: React.FC<IntroProps> = (p) => {
  const {durationInFrames} = useVideoConfig();
  const frame = useCurrentFrame();
  const comps = [HookSeg, NameSeg, CredSeg, ResultsSeg, CtaSeg];
  const starts: number[] = [];
  let acc = 0;
  for (const s of p.segments) {
    starts.push(acc);
    acc += s2f(s.duration);
  }
  const outroAt = acc;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {p.segments.map((s, i) => {
        const C = comps[i];
        return (
          <Sequence key={i} from={starts[i]} durationInFrames={s2f(s.duration)} name={`seg${i + 1}`}>
            <C p={p} seg={s} />
          </Sequence>
        );
      })}
      {/* captions sit above every segment, in one consistent zone */}
      {p.segments.map((s, i) =>
        s.captions ? (
          <Sequence key={`c${i}`} from={starts[i]} durationInFrames={s2f(s.duration)} layout="none">
            <CaptionLayer words={s.words} />
          </Sequence>
        ) : null,
      )}
      {/* dip to black into the logo, for cuts that end mid-sentence */}
      <AbsoluteFill style={{background: '#000', opacity: interpolate(frame, [outroAt - 6, outroAt], [0, 1], clamp), pointerEvents: 'none'}} />
      <Sequence from={outroAt} name="logo">
        <LogoReveal monogram={p.monogram} line1={p.schoolLine1} line2={p.schoolLine2} tagline={p.tagline} transparent={false} sound />
      </Sequence>
      <Html5Audio
        src={staticFile(p.music)}
        volume={(f) => interpolate(f, [0, 10, outroAt - 10, outroAt + 6, durationInFrames - 20, durationInFrames], [0, 0.07, 0.07, 0.2, 0.2, 0], clamp) * p.musicGain}
      />
    </AbsoluteFill>
  );
};

const CaptionLayer: React.FC<{words: Word[]}> = ({words}) => {
  const f = useCurrentFrame();
  return <Captions words={words} f={f} />;
};

export const introDuration = (p: IntroProps) => p.segments.reduce((n, s) => n + s2f(s.duration), 0) + 75;
