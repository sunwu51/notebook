import {
  e,
  i,
  t
} from "./chunk.UP75L23G.js";
import {
  T
} from "./chunk.CYORH2MW.js";

// node_modules/lit-html/directives/class-map.js
var o = e(class extends i {
  constructor(t2) {
    var i2;
    if (super(t2), t2.type !== t.ATTRIBUTE || "class" !== t2.name || (null === (i2 = t2.strings) || void 0 === i2 ? void 0 : i2.length) > 2)
      throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
  }
  render(t2) {
    return " " + Object.keys(t2).filter((i2) => t2[i2]).join(" ") + " ";
  }
  update(i2, [s]) {
    var r, o2;
    if (void 0 === this.it) {
      this.it = /* @__PURE__ */ new Set(), void 0 !== i2.strings && (this.nt = new Set(i2.strings.join(" ").split(/\s/).filter((t2) => "" !== t2)));
      for (const t2 in s)
        s[t2] && !(null === (r = this.nt) || void 0 === r ? void 0 : r.has(t2)) && this.it.add(t2);
      return this.render(s);
    }
    const e2 = i2.element.classList;
    this.it.forEach((t2) => {
      t2 in s || (e2.remove(t2), this.it.delete(t2));
    });
    for (const t2 in s) {
      const i3 = !!s[t2];
      i3 === this.it.has(t2) || (null === (o2 = this.nt) || void 0 === o2 ? void 0 : o2.has(t2)) || (i3 ? (e2.add(t2), this.it.add(t2)) : (e2.remove(t2), this.it.delete(t2)));
    }
    return T;
  }
});

export {
  o
};
/*! Bundled license information:

lit-html/directives/class-map.js:
  (**
   * @license
   * Copyright 2018 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
