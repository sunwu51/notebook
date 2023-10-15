import "../chunks/chunk.LZA5Z3YQ.js";
import {
  registerTranslation
} from "../chunks/chunk.UP2KMO5A.js";
import "../chunks/chunk.LKA3TPUC.js";

// src/translations/hu.ts
var translation = {
  $code: "hu",
  $name: "Magyar",
  $dir: "ltr",
  carousel: "K\xF6rhinta",
  clearEntry: "Bejegyz\xE9s t\xF6rl\xE9se",
  close: "Bez\xE1r\xE1s",
  copied: "M\xE1solva",
  copy: "M\xE1sol\xE1s",
  currentValue: "Aktu\xE1lis \xE9rt\xE9k",
  error: "Hiba",
  goToSlide: (slide, count) => `Ugr\xE1s a ${count}/${slide}. di\xE1ra`,
  hidePassword: "Jelsz\xF3 elrejt\xE9se",
  loading: "Bet\xF6lt\xE9s",
  nextSlide: "K\xF6vetkez\u0151 dia",
  numOptionsSelected: (num) => {
    if (num === 0)
      return "Nincsenek kiv\xE1lasztva opci\xF3k";
    if (num === 1)
      return "1 lehet\u0151s\xE9g kiv\xE1lasztva";
    return `${num} lehet\u0151s\xE9g kiv\xE1lasztva`;
  },
  previousSlide: "El\u0151z\u0151 dia",
  progress: "Folyamat",
  remove: "Elt\xE1vol\xEDt\xE1s",
  resize: "\xC1tm\xE9retez\xE9s",
  scrollToEnd: "G\xF6rgessen a v\xE9g\xE9re",
  scrollToStart: "G\xF6rgessen az elej\xE9re",
  selectAColorFromTheScreen: "Sz\xEDn v\xE1laszt\xE1sa a k\xE9perny\u0151r\u0151l",
  showPassword: "Jelsz\xF3 megjelen\xEDt\xE9se",
  slideNum: (slide) => `${slide}. dia`,
  toggleColorFormat: "Sz\xEDnform\xE1tum v\xE1ltoztat\xE1sa"
};
registerTranslation(translation);
var hu_default = translation;
export {
  hu_default as default
};
