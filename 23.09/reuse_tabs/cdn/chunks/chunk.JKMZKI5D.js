import {
  card_styles_default
} from "./chunk.XDZKIXQF.js";
import {
  HasSlotController
} from "./chunk.NYIIDP5N.js";
import {
  o
} from "./chunk.F3GQIC3Z.js";
import {
  ShoelaceElement
} from "./chunk.OEOITZKB.js";
import {
  x
} from "./chunk.CYORH2MW.js";

// src/components/card/card.component.ts
var SlCard = class extends ShoelaceElement {
  constructor() {
    super(...arguments);
    this.hasSlotController = new HasSlotController(this, "footer", "header", "image");
  }
  render() {
    return x`
      <div
        part="base"
        class=${o({
      card: true,
      "card--has-footer": this.hasSlotController.test("footer"),
      "card--has-image": this.hasSlotController.test("image"),
      "card--has-header": this.hasSlotController.test("header")
    })}
      >
        <slot name="image" part="image" class="card__image"></slot>
        <slot name="header" part="header" class="card__header"></slot>
        <slot part="body" class="card__body"></slot>
        <slot name="footer" part="footer" class="card__footer"></slot>
      </div>
    `;
  }
};
SlCard.styles = card_styles_default;

export {
  SlCard
};
