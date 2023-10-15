import {
  SlRange
} from "./chunk.ZARPEYIV.js";

// src/react/range/index.ts
import * as React from "react";
import { createComponent } from "@lit-labs/react";
import "@lit-labs/react";
var tagName = "sl-range";
SlRange.define("sl-range");
var reactWrapper = createComponent({
  tagName,
  elementClass: SlRange,
  react: React,
  events: {
    onSlBlur: "sl-blur",
    onSlChange: "sl-change",
    onSlFocus: "sl-focus",
    onSlInput: "sl-input",
    onSlInvalid: "sl-invalid"
  },
  displayName: "SlRange"
});
var range_default = reactWrapper;

export {
  range_default
};
