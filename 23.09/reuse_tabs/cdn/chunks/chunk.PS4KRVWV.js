import {
  LocalizeController
} from "./chunk.LZA5Z3YQ.js";
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

// src/components/format-date/format-date.component.ts
var SlFormatDate = class extends ShoelaceElement {
  constructor() {
    super(...arguments);
    this.localize = new LocalizeController(this);
    this.date = /* @__PURE__ */ new Date();
    this.hourFormat = "auto";
  }
  render() {
    const date = new Date(this.date);
    const hour12 = this.hourFormat === "auto" ? void 0 : this.hourFormat === "12";
    if (isNaN(date.getMilliseconds())) {
      return void 0;
    }
    return x`
      <time datetime=${date.toISOString()}>
        ${this.localize.date(date, {
      weekday: this.weekday,
      era: this.era,
      year: this.year,
      month: this.month,
      day: this.day,
      hour: this.hour,
      minute: this.minute,
      second: this.second,
      timeZoneName: this.timeZoneName,
      timeZone: this.timeZone,
      hour12
    })}
      </time>
    `;
  }
};
__decorateClass([
  e()
], SlFormatDate.prototype, "date", 2);
__decorateClass([
  e()
], SlFormatDate.prototype, "weekday", 2);
__decorateClass([
  e()
], SlFormatDate.prototype, "era", 2);
__decorateClass([
  e()
], SlFormatDate.prototype, "year", 2);
__decorateClass([
  e()
], SlFormatDate.prototype, "month", 2);
__decorateClass([
  e()
], SlFormatDate.prototype, "day", 2);
__decorateClass([
  e()
], SlFormatDate.prototype, "hour", 2);
__decorateClass([
  e()
], SlFormatDate.prototype, "minute", 2);
__decorateClass([
  e()
], SlFormatDate.prototype, "second", 2);
__decorateClass([
  e({ attribute: "time-zone-name" })
], SlFormatDate.prototype, "timeZoneName", 2);
__decorateClass([
  e({ attribute: "time-zone" })
], SlFormatDate.prototype, "timeZone", 2);
__decorateClass([
  e({ attribute: "hour-format" })
], SlFormatDate.prototype, "hourFormat", 2);

export {
  SlFormatDate
};
