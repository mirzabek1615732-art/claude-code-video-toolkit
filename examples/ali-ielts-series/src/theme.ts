/** Visual design system shared by every scene and future episodes. */
export const COLORS = {
  navy: '#111827',
  navy2: '#1E293B',
  navy3: '#0B1220',
  blue: '#2563EB',
  blueDark: '#1D4ED8',
  blueLight: '#60A5FA',
  yellow: '#FACC15',
  orange: '#FB923C',
  white: '#FFFFFF',
  green: '#22C55E',
  red: '#EF4444',
  redDark: '#B91C1C',
  ink: '#0B0B0F',
  // character palette
  skin: '#E2A47A',
  skinShade: '#C7845A',
  hair: '#121216',
  hoodie: '#2563EB',
  hoodieShade: '#1D4ED8',
  hoodieLight: '#3B82F6',
  trousers: '#1F2937',
  sneaker: '#FFFFFF',
  sneakerSole: '#CBD5E1',
} as const;

export const FONT_FAMILY = 'Montserrat, "Arial Black", sans-serif';

export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
} as const;

/**
 * Instagram/TikTok UI-safe zones (approximate). Captions live inside
 * captionBand; headlines live inside the top band.
 */
export const SAFE = {
  top: 220,
  bottom: 1920 - 380,
  left: 70,
  right: 1080 - 150,
  captionY: 1380,
  captionWidth: 860,
} as const;
