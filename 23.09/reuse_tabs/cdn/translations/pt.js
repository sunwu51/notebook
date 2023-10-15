import "../chunks/chunk.LZA5Z3YQ.js";
import {
  registerTranslation
} from "../chunks/chunk.UP2KMO5A.js";
import "../chunks/chunk.LKA3TPUC.js";

// src/translations/pt.ts
var translation = {
  $code: "pt",
  $name: "Portugu\xEAs",
  $dir: "ltr",
  carousel: "Carrossel",
  clearEntry: "Limpar entrada",
  close: "Fechar",
  copied: "Copiado",
  copy: "Copiar",
  currentValue: "Valor atual",
  error: "Erro",
  goToSlide: (slide, count) => `V\xE1 para o slide ${slide} de ${count}`,
  hidePassword: "Esconder a senha",
  loading: "Carregando",
  nextSlide: "Pr\xF3ximo slide",
  numOptionsSelected: (num) => {
    if (num === 0)
      return "Nenhuma op\xE7\xE3o selecionada";
    if (num === 1)
      return "1 op\xE7\xE3o selecionada";
    return `${num} op\xE7\xF5es selecionadas`;
  },
  previousSlide: "Slide anterior",
  progress: "Progresso",
  remove: "Remover",
  resize: "Mudar o tamanho",
  scrollToEnd: "Rolar at\xE9 o final",
  scrollToStart: "Rolar at\xE9 o in\xEDcio",
  selectAColorFromTheScreen: "Selecionar uma cor da tela",
  showPassword: "Mostrar senha",
  slideNum: (slide) => `Slide ${slide}`,
  toggleColorFormat: "Trocar o formato de cor"
};
registerTranslation(translation);
var pt_default = translation;
export {
  pt_default as default
};
