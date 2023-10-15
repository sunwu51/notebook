import {
  SlDialog
} from "./chunk.SIUQ4VWC.js";

// src/react/dialog/index.ts
import * as React from "react";
import { createComponent } from "@lit-labs/react";
import "@lit-labs/react";
var tagName = "sl-dialog";
SlDialog.define("sl-dialog");
var reactWrapper = createComponent({
  tagName,
  elementClass: SlDialog,
  react: React,
  events: {
    onSlShow: "sl-show",
    onSlAfterShow: "sl-after-show",
    onSlHide: "sl-hide",
    onSlAfterHide: "sl-after-hide",
    onSlInitialFocus: "sl-initial-focus",
    onSlRequestClose: "sl-request-close"
  },
  displayName: "SlDialog"
});
var dialog_default = reactWrapper;

export {
  dialog_default
};
