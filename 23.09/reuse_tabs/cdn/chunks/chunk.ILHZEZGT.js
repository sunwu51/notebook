import {
  e,
  i,
  t
} from "./chunk.UP75L23G.js";
import {
  e as e2
} from "./chunk.4IWHTOGY.js";
import {
  A,
  x
} from "./chunk.CYORH2MW.js";

// node_modules/lit-html/async-directive.js
var s = (i2, t2) => {
  var e4, o3;
  const r2 = i2._$AN;
  if (void 0 === r2)
    return false;
  for (const i3 of r2)
    null === (o3 = (e4 = i3)._$AO) || void 0 === o3 || o3.call(e4, t2, false), s(i3, t2);
  return true;
};
var o = (i2) => {
  let t2, e4;
  do {
    if (void 0 === (t2 = i2._$AM))
      break;
    e4 = t2._$AN, e4.delete(i2), i2 = t2;
  } while (0 === (null == e4 ? void 0 : e4.size));
};
var r = (i2) => {
  for (let t2; t2 = i2._$AM; i2 = t2) {
    let e4 = t2._$AN;
    if (void 0 === e4)
      t2._$AN = e4 = /* @__PURE__ */ new Set();
    else if (e4.has(i2))
      break;
    e4.add(i2), l(t2);
  }
};
function n(i2) {
  void 0 !== this._$AN ? (o(this), this._$AM = i2, r(this)) : this._$AM = i2;
}
function h(i2, t2 = false, e4 = 0) {
  const r2 = this._$AH, n3 = this._$AN;
  if (void 0 !== n3 && 0 !== n3.size)
    if (t2)
      if (Array.isArray(r2))
        for (let i3 = e4; i3 < r2.length; i3++)
          s(r2[i3], false), o(r2[i3]);
      else
        null != r2 && (s(r2, false), o(r2));
    else
      s(this, i2);
}
var l = (i2) => {
  var t2, s2, o3, r2;
  i2.type == t.CHILD && (null !== (t2 = (o3 = i2)._$AP) && void 0 !== t2 || (o3._$AP = h), null !== (s2 = (r2 = i2)._$AQ) && void 0 !== s2 || (r2._$AQ = n));
};
var c = class extends i {
  constructor() {
    super(...arguments), this._$AN = void 0;
  }
  _$AT(i2, t2, e4) {
    super._$AT(i2, t2, e4), r(this), this.isConnected = i2._$AU;
  }
  _$AO(i2, t2 = true) {
    var e4, r2;
    i2 !== this.isConnected && (this.isConnected = i2, i2 ? null === (e4 = this.reconnected) || void 0 === e4 || e4.call(this) : null === (r2 = this.disconnected) || void 0 === r2 || r2.call(this)), t2 && (s(this, i2), o(this));
  }
  setValue(t2) {
    if (e2(this._$Ct))
      this._$Ct._$AI(t2, this);
    else {
      const i2 = [...this._$Ct._$AH];
      i2[this._$Ci] = t2, this._$Ct._$AI(i2, this, 0);
    }
  }
  disconnected() {
  }
  reconnected() {
  }
};

// node_modules/lit-html/directives/ref.js
var e3 = () => new o2();
var o2 = class {
};
var h2 = /* @__PURE__ */ new WeakMap();
var n2 = e(class extends c {
  render(t2) {
    return A;
  }
  update(t2, [s2]) {
    var e4;
    const o3 = s2 !== this.G;
    return o3 && void 0 !== this.G && this.ot(void 0), (o3 || this.rt !== this.lt) && (this.G = s2, this.ct = null === (e4 = t2.options) || void 0 === e4 ? void 0 : e4.host, this.ot(this.lt = t2.element)), A;
  }
  ot(i2) {
    var t2;
    if ("function" == typeof this.G) {
      const s2 = null !== (t2 = this.ct) && void 0 !== t2 ? t2 : globalThis;
      let e4 = h2.get(s2);
      void 0 === e4 && (e4 = /* @__PURE__ */ new WeakMap(), h2.set(s2, e4)), void 0 !== e4.get(this.G) && this.G.call(this.ct, void 0), e4.set(this.G, i2), void 0 !== i2 && this.G.call(this.ct, i2);
    } else
      this.G.value = i2;
  }
  get rt() {
    var i2, t2, s2;
    return "function" == typeof this.G ? null === (t2 = h2.get(null !== (i2 = this.ct) && void 0 !== i2 ? i2 : globalThis)) || void 0 === t2 ? void 0 : t2.get(this.G) : null === (s2 = this.G) || void 0 === s2 ? void 0 : s2.value;
  }
  disconnected() {
    this.rt === this.lt && this.ot(void 0);
  }
  reconnected() {
    this.ot(this.lt);
  }
});

// src/components/menu-item/submenu-controller.ts
var SubmenuController = class {
  constructor(host, hasSlotController, localize) {
    this.popupRef = e3();
    this.enableSubmenuTimer = -1;
    this.isConnected = false;
    this.isPopupConnected = false;
    this.skidding = 0;
    this.submenuOpenDelay = 100;
    this.handleMouseOver = () => {
      if (this.hasSlotController.test("submenu")) {
        this.enableSubmenu();
      }
    };
    // Focus on the first menu-item of a submenu.
    this.handleKeyDown = (event) => {
      switch (event.key) {
        case "Escape":
        case "Tab":
          this.disableSubmenu();
          break;
        case "ArrowLeft":
          if (event.target !== this.host) {
            event.preventDefault();
            event.stopPropagation();
            this.host.focus();
            this.disableSubmenu();
          }
          break;
        case "ArrowRight":
        case "Enter":
        case " ":
          this.handleSubmenuEntry(event);
          break;
        default:
          break;
      }
    };
    this.handleClick = (event) => {
      var _a;
      if (event.target === this.host) {
        event.preventDefault();
        event.stopPropagation();
      } else if (event.target instanceof Element && (event.target.tagName === "sl-menu-item" || ((_a = event.target.role) == null ? void 0 : _a.startsWith("menuitem")))) {
        this.disableSubmenu();
      }
    };
    // Close this submenu on focus outside of the parent or any descendants.
    this.handleFocusOut = (event) => {
      if (event.relatedTarget && event.relatedTarget instanceof Element && this.host.contains(event.relatedTarget)) {
        return;
      }
      this.disableSubmenu();
    };
    // Prevent the parent menu-item from getting focus on mouse movement on the submenu
    this.handlePopupMouseover = (event) => {
      event.stopPropagation();
    };
    (this.host = host).addController(this);
    this.hasSlotController = hasSlotController;
    this.localize = localize;
  }
  hostConnected() {
    if (this.hasSlotController.test("submenu") && !this.host.disabled) {
      this.addListeners();
    }
  }
  hostDisconnected() {
    this.removeListeners();
  }
  hostUpdated() {
    if (this.hasSlotController.test("submenu") && !this.host.disabled) {
      this.addListeners();
      this.updateSkidding();
    } else {
      this.removeListeners();
    }
  }
  addListeners() {
    if (!this.isConnected) {
      this.host.addEventListener("mouseover", this.handleMouseOver);
      this.host.addEventListener("keydown", this.handleKeyDown);
      this.host.addEventListener("click", this.handleClick);
      this.host.addEventListener("focusout", this.handleFocusOut);
      this.isConnected = true;
    }
    if (!this.isPopupConnected) {
      if (this.popupRef.value) {
        this.popupRef.value.addEventListener("mouseover", this.handlePopupMouseover);
        this.isPopupConnected = true;
      }
    }
  }
  removeListeners() {
    if (this.isConnected) {
      this.host.removeEventListener("mouseover", this.handleMouseOver);
      this.host.removeEventListener("keydown", this.handleKeyDown);
      this.host.removeEventListener("click", this.handleClick);
      this.host.removeEventListener("focusout", this.handleFocusOut);
      this.isConnected = false;
    }
    if (this.isPopupConnected) {
      if (this.popupRef.value) {
        this.popupRef.value.removeEventListener("mouseover", this.handlePopupMouseover);
        this.isPopupConnected = false;
      }
    }
  }
  handleSubmenuEntry(event) {
    const submenuSlot = this.host.renderRoot.querySelector("slot[name='submenu']");
    if (!submenuSlot) {
      console.error("Cannot activate a submenu if no corresponding menuitem can be found.", this);
      return;
    }
    let menuItems = null;
    for (const elt of submenuSlot.assignedElements()) {
      menuItems = elt.querySelectorAll("sl-menu-item, [role^='menuitem']");
      if (menuItems.length !== 0) {
        break;
      }
    }
    if (!menuItems || menuItems.length === 0) {
      return;
    }
    menuItems[0].setAttribute("tabindex", "0");
    for (let i2 = 1; i2 !== menuItems.length; ++i2) {
      menuItems[i2].setAttribute("tabindex", "-1");
    }
    if (this.popupRef.value) {
      event.preventDefault();
      event.stopPropagation();
      if (this.popupRef.value.active) {
        if (menuItems[0] instanceof HTMLElement) {
          menuItems[0].focus();
        }
      } else {
        this.enableSubmenu(false);
        this.host.updateComplete.then(() => {
          if (menuItems[0] instanceof HTMLElement) {
            menuItems[0].focus();
          }
        });
        this.host.requestUpdate();
      }
    }
  }
  setSubmenuState(state) {
    if (this.popupRef.value) {
      if (this.popupRef.value.active !== state) {
        this.popupRef.value.active = state;
        this.host.requestUpdate();
      }
    }
  }
  // Shows the submenu. Supports disabling the opening delay, e.g. for keyboard events that want to set the focus to the
  // newly opened menu.
  enableSubmenu(delay = true) {
    if (delay) {
      this.enableSubmenuTimer = window.setTimeout(() => {
        this.setSubmenuState(true);
      }, this.submenuOpenDelay);
    } else {
      this.setSubmenuState(true);
    }
  }
  disableSubmenu() {
    clearTimeout(this.enableSubmenuTimer);
    this.setSubmenuState(false);
  }
  // Calculate the space the top of a menu takes-up, for aligning the popup menu-item with the activating element.
  updateSkidding() {
    var _a;
    if (!((_a = this.host.parentElement) == null ? void 0 : _a.computedStyleMap)) {
      return;
    }
    const styleMap = this.host.parentElement.computedStyleMap();
    const attrs = ["padding-top", "border-top-width", "margin-top"];
    const skidding = attrs.reduce((accumulator, attr) => {
      var _a2;
      const styleValue = (_a2 = styleMap.get(attr)) != null ? _a2 : new CSSUnitValue(0, "px");
      const unitValue = styleValue instanceof CSSUnitValue ? styleValue : new CSSUnitValue(0, "px");
      const pxValue = unitValue.to("px");
      return accumulator - pxValue.value;
    }, 0);
    this.skidding = skidding;
  }
  isExpanded() {
    return this.popupRef.value ? this.popupRef.value.active : false;
  }
  renderSubmenu() {
    const isLtr = this.localize.dir() === "ltr";
    if (!this.isConnected) {
      return x` <slot name="submenu" hidden></slot> `;
    }
    return x`
      <sl-popup
        ${n2(this.popupRef)}
        placement=${isLtr ? "right-start" : "left-start"}
        anchor="anchor"
        flip
        flip-fallback-strategy="best-fit"
        skidding="${this.skidding}"
        strategy="fixed"
      >
        <slot name="submenu"></slot>
      </sl-popup>
    `;
  }
};

export {
  SubmenuController
};
/*! Bundled license information:

lit-html/async-directive.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/directives/ref.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
