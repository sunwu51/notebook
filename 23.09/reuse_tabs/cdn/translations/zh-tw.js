import "../chunks/chunk.LZA5Z3YQ.js";
import {
  registerTranslation
} from "../chunks/chunk.UP2KMO5A.js";
import "../chunks/chunk.LKA3TPUC.js";

// src/translations/zh-tw.ts
var translation = {
  $code: "zh-tw",
  $name: "\u6B63\u9AD4\u4E2D\u6587",
  $dir: "ltr",
  carousel: "\u65CB\u8F49\u6728\u99AC",
  clearEntry: "\u6E05\u7A7A",
  close: "\u95DC\u9589",
  copied: "\u5DF2\u5FA9\u5236",
  copy: "\u8907\u88FD",
  currentValue: "\u7576\u524D\u503C",
  error: "\u932F\u8AA4",
  goToSlide: (slide, count) => `\u8F49\u5230\u7B2C ${slide} \u5F35\u5E7B\u71C8\u7247\uFF0C\u5171 ${count} \u5F35`,
  hidePassword: "\u96B1\u85CF\u5BC6\u78BC",
  loading: "\u8F09\u5165\u4E2D",
  nextSlide: "\u4E0B\u4E00\u5F35\u5E7B\u71C8\u7247",
  numOptionsSelected: (num) => {
    if (num === 0)
      return "\u672A\u9078\u64C7\u4EFB\u4F55\u9805\u76EE";
    if (num === 1)
      return "\u5DF2\u9078\u64C7 1 \u500B\u9805\u76EE";
    return `${num} \u9078\u64C7\u9805\u76EE`;
  },
  previousSlide: "\u4E0A\u4E00\u5F35\u5E7B\u71C8\u7247",
  progress: "\u9032\u5EA6",
  remove: "\u79FB\u9664",
  resize: "\u8ABF\u6574\u5927\u5C0F",
  scrollToEnd: "\u6372\u81F3\u9801\u5C3E",
  scrollToStart: "\u6372\u81F3\u9801\u9996",
  selectAColorFromTheScreen: "\u5F9E\u87A2\u5E55\u4E2D\u9078\u64C7\u4E00\u7A2E\u984F\u8272",
  showPassword: "\u986F\u793A\u5BC6\u78BC",
  slideNum: (slide) => `\u5E7B\u71C8\u7247 ${slide}`,
  toggleColorFormat: "\u5207\u63DB\u984F\u8272\u683C\u5F0F"
};
registerTranslation(translation);
var zh_tw_default = translation;
export {
  zh_tw_default as default
};
