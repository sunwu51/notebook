import "../chunks/chunk.LZA5Z3YQ.js";
import {
  registerTranslation
} from "../chunks/chunk.UP2KMO5A.js";
import "../chunks/chunk.LKA3TPUC.js";

// src/translations/fr.ts
var translation = {
  $code: "fr",
  $name: "Fran\xE7ais",
  $dir: "ltr",
  carousel: "Carrousel",
  clearEntry: `Effacer l'entr\xE9e`,
  close: "Fermer",
  copied: "Copi\xE9",
  copy: "Copier",
  currentValue: "Valeur actuelle",
  error: "Erreur",
  goToSlide: (slide, count) => `Aller \xE0 la diapositive ${slide} de ${count}`,
  hidePassword: "Masquer le mot de passe",
  loading: "Chargement",
  nextSlide: "Diapositive suivante",
  numOptionsSelected: (num) => {
    if (num === 0)
      return "Aucune option s\xE9lectionn\xE9e";
    if (num === 1)
      return "1 option s\xE9lectionn\xE9e";
    return `${num} options s\xE9lectionn\xE9es`;
  },
  previousSlide: "Diapositive pr\xE9c\xE9dente",
  progress: "Progr\xE8s",
  remove: "Retirer",
  resize: "Redimensionner",
  scrollToEnd: `Faire d\xE9filer jusqu'\xE0 la fin`,
  scrollToStart: `Faire d\xE9filer jusqu'au d\xE9but`,
  selectAColorFromTheScreen: `S\xE9lectionnez une couleur \xE0 l'\xE9cran`,
  showPassword: "Montrer le mot de passe",
  slideNum: (slide) => `Diapositive ${slide}`,
  toggleColorFormat: "Changer le format de couleur"
};
registerTranslation(translation);
var fr_default = translation;
export {
  fr_default as default
};
