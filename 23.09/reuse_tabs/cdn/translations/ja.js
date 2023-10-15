import "../chunks/chunk.LZA5Z3YQ.js";
import {
  registerTranslation
} from "../chunks/chunk.UP2KMO5A.js";
import "../chunks/chunk.LKA3TPUC.js";

// src/translations/ja.ts
var translation = {
  $code: "ja",
  $name: "\u65E5\u672C\u8A9E",
  $dir: "ltr",
  carousel: "\u30AB\u30EB\u30FC\u30BB\u30EB",
  clearEntry: "\u30AF\u30EA\u30A2\u30A8\u30F3\u30C8\u30EA",
  close: "\u9589\u3058\u308B",
  copied: "\u30B3\u30D4\u30FC\u3055\u308C\u307E\u3057\u305F",
  copy: "\u30B3\u30D4\u30FC",
  currentValue: "\u73FE\u5728\u306E\u4FA1\u5024",
  error: "\u30A8\u30E9\u30FC",
  goToSlide: (slide, count) => `${count} \u679A\u4E2D ${slide} \u679A\u306E\u30B9\u30E9\u30A4\u30C9\u306B\u79FB\u52D5`,
  hidePassword: "\u30D1\u30B9\u30EF\u30FC\u30C9\u3092\u96A0\u3059",
  loading: "\u8AAD\u307F\u8FBC\u307F\u4E2D",
  nextSlide: "\u6B21\u306E\u30B9\u30E9\u30A4\u30C9",
  numOptionsSelected: (num) => {
    if (num === 0)
      return "\u30AA\u30D7\u30B7\u30E7\u30F3\u304C\u9078\u629E\u3055\u308C\u3066\u3044\u307E\u305B\u3093";
    if (num === 1)
      return "1 \u3064\u306E\u30AA\u30D7\u30B7\u30E7\u30F3\u304C\u9078\u629E\u3055\u308C\u307E\u3057\u305F";
    return `${num} \u3064\u306E\u30AA\u30D7\u30B7\u30E7\u30F3\u304C\u9078\u629E\u3055\u308C\u307E\u3057\u305F`;
  },
  previousSlide: "\u524D\u306E\u30B9\u30E9\u30A4\u30C9",
  progress: "\u9032\u884C",
  remove: "\u524A\u9664",
  resize: "\u30B5\u30A4\u30BA\u5909\u66F4",
  scrollToEnd: "\u6700\u5F8C\u306B\u30B9\u30AF\u30ED\u30FC\u30EB\u3059\u308B",
  scrollToStart: "\u6700\u521D\u306B\u30B9\u30AF\u30ED\u30FC\u30EB\u3059\u308B",
  selectAColorFromTheScreen: "\u753B\u9762\u304B\u3089\u8272\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044",
  showPassword: "\u30D1\u30B9\u30EF\u30FC\u30C9\u3092\u8868\u793A",
  slideNum: (slide) => `\u30B9\u30E9\u30A4\u30C9 ${slide}`,
  toggleColorFormat: "\u8272\u306E\u30D5\u30A9\u30FC\u30DE\u30C3\u30C8\u3092\u5207\u308A\u66FF\u3048\u308B"
};
registerTranslation(translation);
var ja_default = translation;
export {
  ja_default as default
};
