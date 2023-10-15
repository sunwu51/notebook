import {
  carousel_item_styles_default
} from "./chunk.6TJJYPNU.js";
import {
  ShoelaceElement
} from "./chunk.OEOITZKB.js";
import {
  x
} from "./chunk.CYORH2MW.js";

// src/components/carousel-item/carousel-item.component.ts
var SlCarouselItem = class extends ShoelaceElement {
  static isCarouselItem(node) {
    return node instanceof Element && node.getAttribute("aria-roledescription") === "slide";
  }
  connectedCallback() {
    super.connectedCallback();
    this.setAttribute("role", "group");
  }
  render() {
    return x` <slot></slot> `;
  }
};
SlCarouselItem.styles = carousel_item_styles_default;

export {
  SlCarouselItem
};
