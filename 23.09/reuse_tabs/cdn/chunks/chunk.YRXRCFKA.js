import {
  spinner_styles_default
} from "./chunk.5PZGQVNG.js";
import {
  LocalizeController
} from "./chunk.LZA5Z3YQ.js";
import {
  ShoelaceElement
} from "./chunk.OEOITZKB.js";
import {
  x
} from "./chunk.CYORH2MW.js";

// src/components/spinner/spinner.component.ts
var SlSpinner = class extends ShoelaceElement {
  constructor() {
    super(...arguments);
    this.localize = new LocalizeController(this);
  }
  render() {
    return x`
      <svg part="base" class="spinner" role="progressbar" aria-label=${this.localize.term("loading")}>
        <circle class="spinner__track"></circle>
        <circle class="spinner__indicator"></circle>
      </svg>
    `;
  }
};
SlSpinner.styles = spinner_styles_default;

export {
  SlSpinner
};
