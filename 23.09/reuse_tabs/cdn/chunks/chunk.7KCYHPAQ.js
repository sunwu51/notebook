import {
  SlTooltip
} from "./chunk.4PTVBDCO.js";
import {
  copy_button_styles_default
} from "./chunk.33VIDLUC.js";
import {
  getAnimation,
  setDefaultAnimation
} from "./chunk.OAQT3AUQ.js";
import {
  LocalizeController
} from "./chunk.LZA5Z3YQ.js";
import {
  o
} from "./chunk.F3GQIC3Z.js";
import {
  SlIcon
} from "./chunk.HAUXDFZJ.js";
import {
  ShoelaceElement,
  e,
  i,
  t
} from "./chunk.OEOITZKB.js";
import {
  x
} from "./chunk.CYORH2MW.js";
import {
  __decorateClass
} from "./chunk.LKA3TPUC.js";

// src/components/copy-button/copy-button.component.ts
var SlCopyButton = class extends ShoelaceElement {
  constructor() {
    super(...arguments);
    this.localize = new LocalizeController(this);
    this.isCopying = false;
    this.status = "rest";
    this.value = "";
    this.from = "";
    this.disabled = false;
    this.copyLabel = "";
    this.successLabel = "";
    this.errorLabel = "";
    this.feedbackDuration = 1e3;
    this.tooltipPlacement = "top";
    this.hoist = false;
  }
  async handleCopy() {
    if (this.disabled || this.isCopying) {
      return;
    }
    this.isCopying = true;
    let valueToCopy = this.value;
    if (this.from) {
      const root = this.getRootNode();
      const isProperty = this.from.includes(".");
      const isAttribute = this.from.includes("[") && this.from.includes("]");
      let id = this.from;
      let field = "";
      if (isProperty) {
        [id, field] = this.from.trim().split(".");
      } else if (isAttribute) {
        [id, field] = this.from.trim().replace(/\]$/, "").split("[");
      }
      const target = "getElementById" in root ? root.getElementById(id) : null;
      if (target) {
        if (isAttribute) {
          valueToCopy = target.getAttribute(field) || "";
        } else if (isProperty) {
          valueToCopy = target[field] || "";
        } else {
          valueToCopy = target.textContent || "";
        }
      } else {
        this.showStatus("error");
        this.emit("sl-error");
      }
    }
    if (!valueToCopy) {
      this.showStatus("error");
      this.emit("sl-error");
    } else {
      try {
        await navigator.clipboard.writeText(valueToCopy);
        this.showStatus("success");
        this.emit("sl-copy", {
          detail: {
            value: valueToCopy
          }
        });
      } catch (error) {
        this.showStatus("error");
        this.emit("sl-error");
      }
    }
  }
  async showStatus(status) {
    const copyLabel = this.copyLabel || this.localize.term("copy");
    const successLabel = this.successLabel || this.localize.term("copied");
    const errorLabel = this.errorLabel || this.localize.term("error");
    const iconToShow = status === "success" ? this.successIcon : this.errorIcon;
    const showAnimation = getAnimation(this, "copy.in", { dir: "ltr" });
    const hideAnimation = getAnimation(this, "copy.out", { dir: "ltr" });
    this.tooltip.content = status === "success" ? successLabel : errorLabel;
    await this.copyIcon.animate(hideAnimation.keyframes, hideAnimation.options).finished;
    this.copyIcon.hidden = true;
    this.status = status;
    iconToShow.hidden = false;
    await iconToShow.animate(showAnimation.keyframes, showAnimation.options).finished;
    setTimeout(async () => {
      await iconToShow.animate(hideAnimation.keyframes, hideAnimation.options).finished;
      iconToShow.hidden = true;
      this.status = "rest";
      this.copyIcon.hidden = false;
      await this.copyIcon.animate(showAnimation.keyframes, showAnimation.options).finished;
      this.tooltip.content = copyLabel;
      this.isCopying = false;
    }, this.feedbackDuration);
  }
  render() {
    const copyLabel = this.copyLabel || this.localize.term("copy");
    return x`
      <sl-tooltip
        class=${o({
      "copy-button": true,
      "copy-button--success": this.status === "success",
      "copy-button--error": this.status === "error"
    })}
        content=${copyLabel}
        placement=${this.tooltipPlacement}
        ?disabled=${this.disabled}
        ?hoist=${this.hoist}
        exportparts="
          base:tooltip__base
          base__popup:tooltip__base__popup
          base__arrow:tooltip__base__arrow
          body:tooltip__body
        "
      >
        <button
          class="copy-button__button"
          part="button"
          type="button"
          ?disabled=${this.disabled}
          @click=${this.handleCopy}
        >
          <slot part="copy-icon" name="copy-icon">
            <sl-icon library="system" name="copy"></sl-icon>
          </slot>
          <slot part="success-icon" name="success-icon" hidden>
            <sl-icon library="system" name="check"></sl-icon>
          </slot>
          <slot part="error-icon" name="error-icon" hidden>
            <sl-icon library="system" name="x-lg"></sl-icon>
          </slot>
        </button>
      </sl-tooltip>
    `;
  }
};
SlCopyButton.styles = copy_button_styles_default;
SlCopyButton.dependencies = {
  "sl-icon": SlIcon,
  "sl-tooltip": SlTooltip
};
__decorateClass([
  i('slot[name="copy-icon"]')
], SlCopyButton.prototype, "copyIcon", 2);
__decorateClass([
  i('slot[name="success-icon"]')
], SlCopyButton.prototype, "successIcon", 2);
__decorateClass([
  i('slot[name="error-icon"]')
], SlCopyButton.prototype, "errorIcon", 2);
__decorateClass([
  i("sl-tooltip")
], SlCopyButton.prototype, "tooltip", 2);
__decorateClass([
  t()
], SlCopyButton.prototype, "isCopying", 2);
__decorateClass([
  t()
], SlCopyButton.prototype, "status", 2);
__decorateClass([
  e()
], SlCopyButton.prototype, "value", 2);
__decorateClass([
  e()
], SlCopyButton.prototype, "from", 2);
__decorateClass([
  e({ type: Boolean, reflect: true })
], SlCopyButton.prototype, "disabled", 2);
__decorateClass([
  e({ attribute: "copy-label" })
], SlCopyButton.prototype, "copyLabel", 2);
__decorateClass([
  e({ attribute: "success-label" })
], SlCopyButton.prototype, "successLabel", 2);
__decorateClass([
  e({ attribute: "error-label" })
], SlCopyButton.prototype, "errorLabel", 2);
__decorateClass([
  e({ attribute: "feedback-duration", type: Number })
], SlCopyButton.prototype, "feedbackDuration", 2);
__decorateClass([
  e({ attribute: "tooltip-placement" })
], SlCopyButton.prototype, "tooltipPlacement", 2);
__decorateClass([
  e({ type: Boolean })
], SlCopyButton.prototype, "hoist", 2);
setDefaultAnimation("copy.in", {
  keyframes: [
    { scale: ".25", opacity: ".25" },
    { scale: "1", opacity: "1" }
  ],
  options: { duration: 100 }
});
setDefaultAnimation("copy.out", {
  keyframes: [
    { scale: "1", opacity: "1" },
    { scale: ".25", opacity: "0" }
  ],
  options: { duration: 100 }
});

export {
  SlCopyButton
};
