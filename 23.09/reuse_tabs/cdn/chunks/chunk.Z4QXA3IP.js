import {
  SlSelect
} from "./chunk.JCVQJTJ2.js";

// src/react/select/index.ts
import * as React from "react";
import { createComponent } from "@lit-labs/react";
import "@lit-labs/react";
var tagName = "sl-select";
SlSelect.define("sl-select");
var reactWrapper = createComponent({
  tagName,
  elementClass: SlSelect,
  react: React,
  events: {
    onSlChange: "sl-change",
    onSlClear: "sl-clear",
    onSlInput: "sl-input",
    onSlFocus: "sl-focus",
    onSlBlur: "sl-blur",
    onSlShow: "sl-show",
    onSlAfterShow: "sl-after-show",
    onSlHide: "sl-hide",
    onSlAfterHide: "sl-after-hide",
    onSlInvalid: "sl-invalid"
  },
  displayName: "SlSelect"
});
var select_default = reactWrapper;

export {
  select_default
};
