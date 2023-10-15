import "../chunks/chunk.LZA5Z3YQ.js";
import {
  registerTranslation
} from "../chunks/chunk.UP2KMO5A.js";
import "../chunks/chunk.LKA3TPUC.js";

// src/translations/he.ts
var translation = {
  $code: "he",
  $name: "\u05E2\u05D1\u05E8\u05D9\u05EA",
  $dir: "rtl",
  carousel: "\u05E7\u05E8\u05D5\u05E1\u05DC\u05D4",
  clearEntry: "\u05E0\u05E7\u05D4 \u05E7\u05DC\u05D8",
  close: "\u05E1\u05D2\u05D5\u05E8",
  copied: "\u05DE\u05D5\u05BC\u05E2\u05B2\u05EA\u05B8\u05E7",
  copy: "\u05D4\u05E2\u05EA\u05E7",
  currentValue: "\u05E2\u05E8\u05DA \u05E0\u05D5\u05DB\u05D7\u05D9",
  error: "\u05E9\u05C1\u05B0\u05D2\u05B4\u05D9\u05D0\u05B8\u05D4",
  goToSlide: (slide, count) => `\u05E2\u05D1\u05D5\u05E8 \u05DC\u05E9\u05E7\u05D5\u05E4\u05D9\u05EA ${slide} \u05E9\u05DC ${count}`,
  hidePassword: "\u05D4\u05E1\u05EA\u05E8 \u05E1\u05D9\u05E1\u05DE\u05D0",
  loading: "\u05D8\u05D5\u05E2\u05DF",
  nextSlide: "Next slide",
  numOptionsSelected: (num) => {
    if (num === 0)
      return "\u05DC\u05D0 \u05E0\u05D1\u05D7\u05E8\u05D5 \u05D0\u05E4\u05E9\u05E8\u05D5\u05D9\u05D5\u05EA";
    if (num === 1)
      return "\u05E0\u05D1\u05D7\u05E8\u05D4 \u05D0\u05E4\u05E9\u05E8\u05D5\u05EA \u05D0\u05D7\u05EA";
    return `\u05E0\u05D1\u05D7\u05E8\u05D5 ${num} \u05D0\u05E4\u05E9\u05E8\u05D5\u05D9\u05D5\u05EA`;
  },
  previousSlide: "Previous slide",
  progress: "\u05D4\u05EA\u05E7\u05D3\u05DE\u05D5\u05EA",
  remove: "\u05DC\u05B0\u05D4\u05B7\u05E1\u05B4\u05D9\u05E8",
  resize: "\u05E9\u05E0\u05D4 \u05D2\u05D5\u05D3\u05DC",
  scrollToEnd: "\u05D2\u05DC\u05D5\u05DC \u05E2\u05D3 \u05D4\u05E1\u05D5\u05E3",
  scrollToStart: "\u05D2\u05DC\u05D5\u05DC \u05DC\u05D4\u05EA\u05D7\u05DC\u05D4",
  selectAColorFromTheScreen: "\u05D1\u05D7\u05D5\u05E8 \u05E6\u05D1\u05E2 \u05DE\u05D4\u05DE\u05E1\u05DA",
  showPassword: "\u05D4\u05E8\u05D0\u05D4 \u05E1\u05D9\u05E1\u05DE\u05D4",
  slideNum: (slide) => `\u05E9\u05E7\u05D5\u05E4\u05D9\u05EA ${slide}`,
  toggleColorFormat: "\u05D4\u05D7\u05DC\u05E3 \u05E4\u05D5\u05E8\u05DE\u05D8 \u05E6\u05D1\u05E2"
};
registerTranslation(translation);
var he_default = translation;
export {
  he_default as default
};
