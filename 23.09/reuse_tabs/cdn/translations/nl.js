import "../chunks/chunk.LZA5Z3YQ.js";
import {
  registerTranslation
} from "../chunks/chunk.UP2KMO5A.js";
import "../chunks/chunk.LKA3TPUC.js";

// src/translations/nl.ts
var translation = {
  $code: "nl",
  $name: "Nederlands",
  $dir: "ltr",
  carousel: "Carrousel",
  clearEntry: "Invoer wissen",
  close: "Sluiten",
  copied: "Gekopieerd",
  copy: "Kopi\xEBren",
  currentValue: "Huidige waarde",
  error: "Fout",
  goToSlide: (slide, count) => `Ga naar slide ${slide} van ${count}`,
  hidePassword: "Verberg wachtwoord",
  loading: "Bezig met laden",
  nextSlide: "Volgende dia",
  numOptionsSelected: (num) => {
    if (num === 0)
      return "Geen optie geselecteerd";
    if (num === 1)
      return "1 optie geselecteerd";
    return `${num} opties geselecteerd`;
  },
  previousSlide: "Vorige dia",
  progress: "Voortgang",
  remove: "Verwijderen",
  resize: "Formaat wijzigen",
  scrollToEnd: "Scroll naar einde",
  scrollToStart: "Scroll naar begin",
  selectAColorFromTheScreen: "Selecteer een kleur van het scherm",
  showPassword: "Laat wachtwoord zien",
  slideNum: (slide) => `Schuif ${slide}`,
  toggleColorFormat: "Wissel kleurnotatie"
};
registerTranslation(translation);
var nl_default = translation;
export {
  nl_default as default
};
