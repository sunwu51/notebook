import {
  SlDropdown
} from "./chunk.XW6MQ4IO.js";

// src/react/dropdown/index.ts
import * as React from "react";
import { createComponent } from "@lit-labs/react";
import "@lit-labs/react";
var tagName = "sl-dropdown";
SlDropdown.define("sl-dropdown");
var reactWrapper = createComponent({
  tagName,
  elementClass: SlDropdown,
  react: React,
  events: {
    onSlShow: "sl-show",
    onSlAfterShow: "sl-after-show",
    onSlHide: "sl-hide",
    onSlAfterHide: "sl-after-hide"
  },
  displayName: "SlDropdown"
});
var dropdown_default = reactWrapper;

export {
  dropdown_default
};
