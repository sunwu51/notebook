import {
  SlIconButton
} from "./chunk.3RKKOOOS.js";

// src/react/icon-button/index.ts
import * as React from "react";
import { createComponent } from "@lit-labs/react";
import "@lit-labs/react";
var tagName = "sl-icon-button";
SlIconButton.define("sl-icon-button");
var reactWrapper = createComponent({
  tagName,
  elementClass: SlIconButton,
  react: React,
  events: {
    onSlBlur: "sl-blur",
    onSlFocus: "sl-focus"
  },
  displayName: "SlIconButton"
});
var icon_button_default = reactWrapper;

export {
  icon_button_default
};
