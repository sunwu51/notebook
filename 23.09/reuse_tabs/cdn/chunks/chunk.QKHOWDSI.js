import {
  radio_styles_default
} from "./chunk.FQXWNSAM.js";
import {
  o
} from "./chunk.F3GQIC3Z.js";
import {
  SlIcon
} from "./chunk.HAUXDFZJ.js";
import {
  watch
} from "./chunk.VQ3XOPCT.js";
import {
  ShoelaceElement,
  e,
  t
} from "./chunk.OEOITZKB.js";
import {
  x
} from "./chunk.CYORH2MW.js";
import {
  __decorateClass
} from "./chunk.LKA3TPUC.js";

// src/components/radio/radio.component.ts
var SlRadio = class extends ShoelaceElement {
  constructor() {
    super();
    this.checked = false;
    this.hasFocus = false;
    this.size = "medium";
    this.disabled = false;
    this.handleBlur = () => {
      this.hasFocus = false;
      this.emit("sl-blur");
    };
    this.handleClick = () => {
      if (!this.disabled) {
        this.checked = true;
      }
    };
    this.handleFocus = () => {
      this.hasFocus = true;
      this.emit("sl-focus");
    };
    this.addEventListener("blur", this.handleBlur);
    this.addEventListener("click", this.handleClick);
    this.addEventListener("focus", this.handleFocus);
  }
  connectedCallback() {
    super.connectedCallback();
    this.setInitialAttributes();
  }
  setInitialAttributes() {
    this.setAttribute("role", "radio");
    this.setAttribute("tabindex", "-1");
    this.setAttribute("aria-disabled", this.disabled ? "true" : "false");
  }
  handleCheckedChange() {
    this.setAttribute("aria-checked", this.checked ? "true" : "false");
    this.setAttribute("tabindex", this.checked ? "0" : "-1");
  }
  handleDisabledChange() {
    this.setAttribute("aria-disabled", this.disabled ? "true" : "false");
  }
  render() {
    return x`
      <span
        part="base"
        class=${o({
      radio: true,
      "radio--checked": this.checked,
      "radio--disabled": this.disabled,
      "radio--focused": this.hasFocus,
      "radio--small": this.size === "small",
      "radio--medium": this.size === "medium",
      "radio--large": this.size === "large"
    })}
      >
        <span part="${`control${this.checked ? " control--checked" : ""}`}" class="radio__control">
          ${this.checked ? x` <sl-icon part="checked-icon" class="radio__checked-icon" library="system" name="radio"></sl-icon> ` : ""}
        </span>

        <slot part="label" class="radio__label"></slot>
      </span>
    `;
  }
};
SlRadio.styles = radio_styles_default;
SlRadio.dependencies = { "sl-icon": SlIcon };
__decorateClass([
  t()
], SlRadio.prototype, "checked", 2);
__decorateClass([
  t()
], SlRadio.prototype, "hasFocus", 2);
__decorateClass([
  e()
], SlRadio.prototype, "value", 2);
__decorateClass([
  e({ reflect: true })
], SlRadio.prototype, "size", 2);
__decorateClass([
  e({ type: Boolean, reflect: true })
], SlRadio.prototype, "disabled", 2);
__decorateClass([
  watch("checked")
], SlRadio.prototype, "handleCheckedChange", 1);
__decorateClass([
  watch("disabled", { waitUntilFirstUpdate: true })
], SlRadio.prototype, "handleDisabledChange", 1);

export {
  SlRadio
};
