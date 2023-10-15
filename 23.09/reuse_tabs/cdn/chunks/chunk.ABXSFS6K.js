import {
  LocalizeController
} from "./chunk.LZA5Z3YQ.js";
import {
  ShoelaceElement,
  e
} from "./chunk.OEOITZKB.js";
import {
  __decorateClass
} from "./chunk.LKA3TPUC.js";

// src/components/format-bytes/format-bytes.component.ts
var SlFormatBytes = class extends ShoelaceElement {
  constructor() {
    super(...arguments);
    this.localize = new LocalizeController(this);
    this.value = 0;
    this.unit = "byte";
    this.display = "short";
  }
  render() {
    if (isNaN(this.value)) {
      return "";
    }
    const bitPrefixes = ["", "kilo", "mega", "giga", "tera"];
    const bytePrefixes = ["", "kilo", "mega", "giga", "tera", "peta"];
    const prefix = this.unit === "bit" ? bitPrefixes : bytePrefixes;
    const index = Math.max(0, Math.min(Math.floor(Math.log10(this.value) / 3), prefix.length - 1));
    const unit = prefix[index] + this.unit;
    const valueToFormat = parseFloat((this.value / Math.pow(1e3, index)).toPrecision(3));
    return this.localize.number(valueToFormat, {
      style: "unit",
      unit,
      unitDisplay: this.display
    });
  }
};
__decorateClass([
  e({ type: Number })
], SlFormatBytes.prototype, "value", 2);
__decorateClass([
  e()
], SlFormatBytes.prototype, "unit", 2);
__decorateClass([
  e()
], SlFormatBytes.prototype, "display", 2);

export {
  SlFormatBytes
};
