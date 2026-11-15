import {continueRender, delayRender, staticFile} from 'remotion';

let loaded = false;

/** Archivo / Archivo Black: the closest open-licence match to the school logo. */
export const loadBrandFonts = () => {
  if (loaded || typeof document === 'undefined') return;
  loaded = true;
  const handle = delayRender('Loading brand fonts');
  const faces = [
    new FontFace('Archivo Black', `url(${staticFile('fonts/archivo-black-latin-400-normal.woff2')}) format('woff2')`, {weight: '400'}),
    new FontFace('Archivo', `url(${staticFile('fonts/archivo-latin-500-normal.woff2')}) format('woff2')`, {weight: '500'}),
    new FontFace('Archivo', `url(${staticFile('fonts/archivo-latin-600-normal.woff2')}) format('woff2')`, {weight: '600'}),
    new FontFace('Archivo', `url(${staticFile('fonts/archivo-latin-700-normal.woff2')}) format('woff2')`, {weight: '700'}),
  ];
  Promise.all(faces.map((f) => (document.fonts.add(f), f.load())))
    .then(() => continueRender(handle))
    .catch((e) => {
      console.error(e);
      continueRender(handle);
    });
};
