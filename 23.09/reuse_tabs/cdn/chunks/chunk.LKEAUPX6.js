import {
  SlAlert
} from "./chunk.KBTQCERC.js";

// src/react/alert/index.ts
import * as React from "react";
import { createComponent } from "@lit-labs/react";
import "@lit-labs/react";
var tagName = "sl-alert";
SlAlert.define("sl-alert");
var reactWrapper = createComponent({
  tagName,
  elementClass: SlAlert,
  react: React,
  events: {
    onSlShow: "sl-show",
    onSlAfterShow: "sl-after-show",
    onSlHide: "sl-hide",
    onSlAfterHide: "sl-after-hide"
  },
  displayName: "SlAlert"
});
var alert_default = reactWrapper;

export {
  alert_default
};
