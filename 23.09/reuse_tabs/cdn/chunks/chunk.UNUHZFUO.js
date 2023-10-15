import {
  SlTextarea
} from "./chunk.COGGKAIW.js";

// src/react/textarea/index.ts
import * as React from "react";
import { createComponent } from "@lit-labs/react";
import "@lit-labs/react";
var tagName = "sl-textarea";
SlTextarea.define("sl-textarea");
var reactWrapper = createComponent({
  tagName,
  elementClass: SlTextarea,
  react: React,
  events: {
    onSlBlur: "sl-blur",
    onSlChange: "sl-change",
    onSlFocus: "sl-focus",
    onSlInput: "sl-input",
    onSlInvalid: "sl-invalid"
  },
  displayName: "SlTextarea"
});
var textarea_default = reactWrapper;

export {
  textarea_default
};
