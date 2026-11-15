import React from 'react';
import {Composition, Still} from 'remotion';
import {CharacterSheet} from './dev/CharacterSheet';
import {TIMELINE, FPS} from './episode/timeline';
import {Reel} from './Reel';
import {Thumbnail} from './Thumbnail';
import {HighlightCover} from './brand/HighlightCover';
import {LogoStill} from './brand/LogoStill';
import {LogoReveal} from './brand/LogoReveal';
import {PortraitOptions} from './brand/PortraitOptions';
import {TeacherCover} from './brand/TeacherCover';
import {CoverOptions} from './brand/CoverOptions';
import {EP03_DURATION, Ep03AliReading} from './episodes/ep03/composition';
import {Ep03Thumbnail} from './episodes/ep03/thumbnail/Ep03Thumbnail';
import {introDuration, TeacherIntroReel, type IntroProps} from './brand/TeacherIntroReel';
import {VIDEO} from './theme';

// Generic placeholder content; real content is passed with --props (kept private).
const INTRO_DEFAULTS: IntroProps = {
  segments: [],
  cutoutDir: 'private/cutout',
  cutoutCount: 1,
  hookSmall: 'HOOK LINE',
  hookBig: 'BIG HOOK',
  name: 'TEACHER NAME',
  title: 'TITLE',
  scores: {l: '0.0', r: '0.0', w: '0.0', s: '0.0', overall: '0.0'},
  multilevel: 'LEVEL B2',
  multilevelScore: '',
  uni: 'UNIVERSITY',
  uniSub: 'PROGRAMME',
  years: 'N YEARS',
  students: 0,
  studentsLabel: 'STUDENTS',
  percent: 0,
  percentLabel: 'RESULT',
  progressFrom: '0',
  progressTo: '0',
  resultsLabel: 'RESULTS',
  dailyTag: 'DAILY',
  followText: 'FOLLOW',
  followDone: 'FOLLOWING',
  commentQ: 'Question?',
  answers: ['1'],
  certs: {hook: '', own: '', studentA: '', studentB: ''},
  certFocus: {hook: [540, 960], own: [540, 960], studentA: [540, 960], studentB: [540, 960]},
  t: {hookCertIn: 0, nameIn: 0, ownCertIn: 0, ownCertOut: 0, multilevelIn: 0, uniIn: 0, yearsIn: 0, studentsIn: 0, percentIn: 0, studentCertsIn: 0, dailyIn: 0, skillsIn: 0, followIn: 0, followTap: 0, commentIn: 0, pushIn: 0},
  tvFocus: [540, 960],
  monogram: 'YS',
  schoolLine1: 'YOUR NAME',
  schoolLine2: 'SCHOOL',
  tagline: 'TAGLINE',
  music: 'audio/music_brand.wav',
  musicGain: 1,
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="AliIeltsReel" component={Reel} durationInFrames={TIMELINE.durationInFrames} fps={FPS} width={VIDEO.width} height={VIDEO.height} />
    <Still id="Thumbnail" component={Thumbnail} width={VIDEO.width} height={VIDEO.height} />
    <Still id="Ep03Thumbnail" component={Ep03Thumbnail} width={1080} height={1920} />
    <Still id="HighlightCover" component={HighlightCover} width={VIDEO.width} height={VIDEO.height} defaultProps={{icon: 'results' as const, monogram: 'BS'}} />
    <Still
      id="LogoStill"
      component={LogoStill}
      width={1254}
      height={1254}
      defaultProps={{monogram: 'YS', line1: 'YOUR NAME', line2: 'SCHOOL', tagline: 'YOUR TAGLINE', transparent: false}}
    />
    <Composition id="LogoRevealSquare" component={LogoReveal} durationInFrames={120} fps={30} width={1080} height={1080} defaultProps={{monogram: 'YS', line1: 'YOUR NAME', line2: 'SCHOOL', tagline: 'YOUR TAGLINE', transparent: false, sound: true}} />
    <Composition id="LogoRevealVertical" component={LogoReveal} durationInFrames={120} fps={30} width={1080} height={1920} defaultProps={{monogram: 'YS', line1: 'YOUR NAME', line2: 'SCHOOL', tagline: 'YOUR TAGLINE', transparent: false, sound: true}} />
    <Still id="Portrait4x5" component={PortraitOptions} width={1080} height={1350} defaultProps={{variant: 'studioCanvas' as const, photo: 'private/teacher_cutout.png', firstName: 'First', lastName: 'Last', title: 'IELTS teacher', subtitle: 'Online & offline lessons', handle: '@handle', monogram: 'YS', schoolLine1: 'YOUR NAME', schoolLine2: 'SCHOOL', tagline: 'YOUR TAGLINE'}} />
    <Still id="Portrait9x16" component={PortraitOptions} width={1080} height={1920} defaultProps={{...{variant: 'studioCanvas' as const, photo: 'private/teacher_cutout.png', firstName: 'First', lastName: 'Last', title: 'IELTS teacher', subtitle: 'Online & offline lessons', handle: '@handle', monogram: 'YS', schoolLine1: 'YOUR NAME', schoolLine2: 'SCHOOL', tagline: 'YOUR TAGLINE'}, variant: 'story' as const}} />
    <Still id="PortraitSquare" component={PortraitOptions} width={1080} height={1080} defaultProps={{...{variant: 'studioCanvas' as const, photo: 'private/teacher_cutout.png', firstName: 'First', lastName: 'Last', title: 'IELTS teacher', subtitle: 'Online & offline lessons', handle: '@handle', monogram: 'YS', schoolLine1: 'YOUR NAME', schoolLine2: 'SCHOOL', tagline: 'YOUR TAGLINE'}, variant: 'pfp' as const}} />
    <Composition
      id="TeacherIntroReel"
      component={TeacherIntroReel}
      fps={30}
      width={1080}
      height={1920}
      durationInFrames={75}
      defaultProps={INTRO_DEFAULTS}
      calculateMetadata={({props}) => ({durationInFrames: introDuration(props)})}
    />
    <Still
      id="TeacherCover"
      component={TeacherCover}
      width={1080}
      height={1920}
      defaultProps={{frame: 'private/cover_frame.png', cutout: 'private/cutout.png', big1: 'BIG', big2: 'TEXT', name: 'TEACHER NAME', facts: ['FACT 1', 'FACT 2'], guide: false}}
    />
    <Still
      id="CoverOptions"
      component={CoverOptions}
      width={1080}
      height={1920}
      defaultProps={{variant: 'magazine' as const, portrait: 'private/teacher_cutout.png', schoolFrame: 'private/cover_school.png', cert: 'private/certs/mine_ielts.jpg', certFocus: [540, 960] as [number, number], name: 'TEACHER NAME', headline: 'HEADLINE', score: '0.0', facts: ['FACT']}}
    />
    <Composition id="Ep03AliReading" component={Ep03AliReading} durationInFrames={EP03_DURATION} fps={30} width={1080} height={1920} defaultProps={{stem: 'all' as const}} />
    <Still id="CharacterSheet" component={CharacterSheet} width={VIDEO.width} height={VIDEO.height} />
  </>
);
