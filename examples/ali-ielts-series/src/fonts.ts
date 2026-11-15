import {continueRender, delayRender, staticFile} from 'remotion';

const faces: Array<[string, string]> = [
  ['600', 'montserrat-latin-600-normal.woff2'],
  ['800', 'montserrat-latin-800-normal.woff2'],
  ['900', 'montserrat-latin-900-normal.woff2'],
  ['600', 'montserrat-latin-ext-600-normal.woff2'],
  ['800', 'montserrat-latin-ext-800-normal.woff2'],
  ['900', 'montserrat-latin-ext-900-normal.woff2'],
];

let loaded = false;

/** Load the bundled Montserrat font files (no network at render time). */
export const loadFonts = () => {
  if (loaded || typeof document === 'undefined') {
    return;
  }
  loaded = true;
  const handle = delayRender('Loading Montserrat');
  Promise.all(
    faces.map(([weight, file]) => {
      const face = new FontFace('Montserrat', `url(${staticFile(`fonts/${file}`)}) format('woff2')`, {weight});
      document.fonts.add(face);
      return face.load();
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
};
