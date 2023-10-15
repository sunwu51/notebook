import {
  e,
  i,
  t
} from "./chunk.UP75L23G.js";
import {
  T
} from "./chunk.CYORH2MW.js";

// node_modules/lit-html/directives/style-map.js
var i2 = "important";
var n = " !" + i2;
var o = e(class extends i {
  constructor(t2) {
    var e2;
    if (super(t2), t2.type !== t.ATTRIBUTE || "style" !== t2.name || (null === (e2 = t2.strings) || void 0 === e2 ? void 0 : e2.length) > 2)
      throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.");
  }
  render(t2) {
    return Object.keys(t2).reduce((e2, r) => {
      const s = t2[r];
      return null == s ? e2 : e2 + `${r = r.includes("-") ? r : r.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g, "-$&").toLowerCase()}:${s};`;
    }, "");
  }
  update(e2, [r]) {
    const { style: s } = e2.element;
    if (void 0 === this.ut) {
      this.ut = /* @__PURE__ */ new Set();
      for (const t2 in r)
        this.ut.add(t2);
      return this.render(r);
    }
    this.ut.forEach((t2) => {
      null == r[t2] && (this.ut.delete(t2), t2.includes("-") ? s.removeProperty(t2) : s[t2] = "");
    });
    for (const t2 in r) {
      const e3 = r[t2];
      if (null != e3) {
        this.ut.add(t2);
        const r2 = "string" == typeof e3 && e3.endsWith(n);
        t2.includes("-") || r2 ? s.setProperty(t2, r2 ? e3.slice(0, -11) : e3, r2 ? i2 : "") : s[t2] = e3;
      }
    }
    return T;
  }
});

export {
  o
};
/*! Bundled license information:

lit-html/directives/style-map.js:
  (**
   * @license
   * Copyright 2018 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
