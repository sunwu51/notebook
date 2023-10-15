import {
  SlInput
} from "./chunk.PG2YQQKG.js";

// src/react/input/index.ts
import * as React from "react";
import { createComponent } from "@lit-labs/react";
import "@lit-labs/react";
var tagName = "sl-input";
SlInput.define("sl-input");
var reactWrapper = createComponent({
  tagName,
  elementClass: SlInput,
  react: React,
  events: {
    onSlBlur: "sl-blur",
    onSlChange: "sl-change",
    onSlClear: "sl-clear",
    onSlFocus: "sl-focus",
    onSlInput: "sl-input",
    onSlInvalid: "sl-invalid"
  },
  displayName: "SlInput"
});
var input_default = reactWrapper;

export {
  input_default
};
