import {
  menu_label_styles_default
} from "./chunk.V7G2BEYY.js";
import {
  ShoelaceElement
} from "./chunk.OEOITZKB.js";
import {
  x
} from "./chunk.CYORH2MW.js";

// src/components/menu-label/menu-label.component.ts
var SlMenuLabel = class extends ShoelaceElement {
  render() {
    return x` <slot part="base" class="menu-label"></slot> `;
  }
};
SlMenuLabel.styles = menu_label_styles_default;

export {
  SlMenuLabel
};
