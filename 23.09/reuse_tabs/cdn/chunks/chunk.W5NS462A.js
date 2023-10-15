import {
  skeleton_styles_default
} from "./chunk.446EZHZP.js";
import {
  o
} from "./chunk.F3GQIC3Z.js";
import {
  ShoelaceElement,
  e
} from "./chunk.OEOITZKB.js";
import {
  x
} from "./chunk.CYORH2MW.js";
import {
  __decorateClass
} from "./chunk.LKA3TPUC.js";

// src/components/skeleton/skeleton.component.ts
var SlSkeleton = class extends ShoelaceElement {
  constructor() {
    super(...arguments);
    this.effect = "none";
  }
  render() {
    return x`
      <div
        part="base"
        class=${o({
      skeleton: true,
      "skeleton--pulse": this.effect === "pulse",
      "skeleton--sheen": this.effect === "sheen"
    })}
      >
        <div part="indicator" class="skeleton__indicator"></div>
      </div>
    `;
  }
};
SlSkeleton.styles = skeleton_styles_default;
__decorateClass([
  e()
], SlSkeleton.prototype, "effect", 2);

export {
  SlSkeleton
};
