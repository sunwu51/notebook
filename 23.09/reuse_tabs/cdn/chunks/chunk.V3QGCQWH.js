import {
  SlDetails
} from "./chunk.WB6PZ3X4.js";

// src/react/details/index.ts
import * as React from "react";
import { createComponent } from "@lit-labs/react";
import "@lit-labs/react";
var tagName = "sl-details";
SlDetails.define("sl-details");
var reactWrapper = createComponent({
  tagName,
  elementClass: SlDetails,
  react: React,
  events: {
    onSlShow: "sl-show",
    onSlAfterShow: "sl-after-show",
    onSlHide: "sl-hide",
    onSlAfterHide: "sl-after-hide"
  },
  displayName: "SlDetails"
});
var details_default = reactWrapper;

export {
  details_default
};
