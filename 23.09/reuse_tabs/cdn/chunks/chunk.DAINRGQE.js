import {
  progress_bar_styles_default
} from "./chunk.IK7B3ZDO.js";
import {
  o as o2
} from "./chunk.7NMJA26P.js";
import {
  LocalizeController
} from "./chunk.LZA5Z3YQ.js";
import {
  l
} from "./chunk.3BGJFSZ6.js";
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

// src/components/progress-bar/progress-bar.component.ts
var SlProgressBar = class extends ShoelaceElement {
  constructor() {
    super(...arguments);
    this.localize = new LocalizeController(this);
    this.value = 0;
    this.indeterminate = false;
    this.label = "";
  }
  render() {
    return x`
      <div
        part="base"
        class=${o({
      "progress-bar": true,
      "progress-bar--indeterminate": this.indeterminate,
      "progress-bar--rtl": this.localize.dir() === "rtl"
    })}
        role="progressbar"
        title=${l(this.title)}
        aria-label=${this.label.length > 0 ? this.label : this.localize.term("progress")}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow=${this.indeterminate ? 0 : this.value}
      >
        <div part="indicator" class="progress-bar__indicator" style=${o2({ width: `${this.value}%` })}>
          ${!this.indeterminate ? x` <slot part="label" class="progress-bar__label"></slot> ` : ""}
        </div>
      </div>
    `;
  }
};
SlProgressBar.styles = progress_bar_styles_default;
__decorateClass([
  e({ type: Number, reflect: true })
], SlProgressBar.prototype, "value", 2);
__decorateClass([
  e({ type: Boolean, reflect: true })
], SlProgressBar.prototype, "indeterminate", 2);
__decorateClass([
  e()
], SlProgressBar.prototype, "label", 2);

export {
  SlProgressBar
};
