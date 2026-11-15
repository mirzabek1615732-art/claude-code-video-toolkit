import { WORDS } from "./util";

/** Uzbek translation, one line per English sentence. `at` = index of the first English word of that sentence in its clip.
 *  Text between *stars* is highlighted (the target expression and its meaning). */
const RAW: { seg: string; at: number; text: string }[] = [
  { seg: "c1", at: 0, text: "Tasavvur qiling: uchta yuragingiz bor-u, baribir ko‘nglingiz sinsa!" },
  { seg: "c2", at: 0, text: "Ahtapotning ko‘ngli aslida sinmaydi, lekin uchta yuragi chindan bor!" },
  { seg: "c3", at: 0, text: "Ikkita yurak qonni jabralar orqali haydaydi." },
  { seg: "c3", at: 7, text: "Uchinchisi esa uni butun tanaga tarqatadi." },
  { seg: "c4", at: 0, text: "Qoni-chi? Ko‘k!" },
  { seg: "c4", at: 4, text: "Kislorodni tashish uchun u temir emas, mis ishlatadi." },
  { seg: "c5", at: 0, text: "Uchta yurak, ko‘k qon?" },
  { seg: "c5", at: 4, text: "Bu *mind-blowing*, ya’ni *aqlni shoshiradigan*!" },
  { seg: "c5", at: 6, text: "Ma’nosi: *nihoyatda hayratlanarli*." },
  { seg: "c6", at: 0, text: "*Aqlni shoshiradigan* fakt!" },
  { seg: "c7", at: 0, text: "Ahtapot sizga “Yuragim sizniki” desa..." },
  { seg: "c7", at: 9, text: "...qaysi biri ekan?" },
];

export type UzLine = { s: number; e: number; text: string };
export const UZ: UzLine[] = RAW.map((r, i) => {
  const segWords = WORDS.filter((w) => w.seg === r.seg);
  const next = RAW[i + 1];
  const s = segWords[r.at].s;
  const e = next && next.seg === r.seg ? WORDS.filter((w) => w.seg === next.seg)[next.at].s : segWords[segWords.length - 1].e + 0.35;
  return { s, e, text: r.text };
});
