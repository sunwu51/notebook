import "../chunks/chunk.LZA5Z3YQ.js";
import {
  registerTranslation
} from "../chunks/chunk.UP2KMO5A.js";
import "../chunks/chunk.LKA3TPUC.js";

// src/translations/tr.ts
var translation = {
  $code: "tr",
  $name: "T\xFCrk\xE7e",
  $dir: "ltr",
  carousel: "Atl\u0131kar\u0131nca",
  clearEntry: "Giri\u015Fi sil",
  close: "Kapat",
  copied: "Kopyaland\u0131",
  copy: "Kopya",
  currentValue: "Mevcut de\u011Fer",
  error: "Hata",
  goToSlide: (slide, count) => `${count} slayttan ${slide} slayta gidin`,
  hidePassword: "\u015Eifreyi sakla",
  loading: "Y\xFCkleme",
  nextSlide: "Sonraki slayt",
  numOptionsSelected: (num) => {
    if (num === 0)
      return "Hi\xE7bir se\xE7enek se\xE7ilmedi";
    if (num === 1)
      return "1 se\xE7enek se\xE7ildi";
    return `${num} se\xE7enek se\xE7ildi`;
  },
  previousSlide: "Bir onceki slayt",
  progress: "\u0130lerleme",
  remove: "Kald\u0131r",
  resize: "Yeniden boyutland\u0131r",
  scrollToEnd: "Sona kay",
  scrollToStart: "Ba\u015Fa kay",
  selectAColorFromTheScreen: "Ekrandan bir renk se\xE7in",
  showPassword: "\u015Eifreyi g\xF6ster",
  slideNum: (slide) => `Slayt ${slide}`,
  toggleColorFormat: "Renk bi\xE7imini de\u011Fi\u015Ftir"
};
registerTranslation(translation);
var tr_default = translation;
export {
  tr_default as default
};
