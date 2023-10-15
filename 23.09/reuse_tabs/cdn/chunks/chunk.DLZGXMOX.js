import {
  visually_hidden_styles_default
} from "./chunk.CWG7NIPY.js";
import {
  ShoelaceElement
} from "./chunk.OEOITZKB.js";
import {
  x
} from "./chunk.CYORH2MW.js";

// src/components/visually-hidden/visually-hidden.component.ts
var SlVisuallyHidden = class extends ShoelaceElement {
  render() {
    return x` <slot></slot> `;
  }
};
SlVisuallyHidden.styles = visually_hidden_styles_default;

export {
  SlVisuallyHidden
};
