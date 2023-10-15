import {
  SlMenu
} from "./chunk.345GMLJC.js";

// src/react/menu/index.ts
import * as React from "react";
import { createComponent } from "@lit-labs/react";
import "@lit-labs/react";
var tagName = "sl-menu";
SlMenu.define("sl-menu");
var reactWrapper = createComponent({
  tagName,
  elementClass: SlMenu,
  react: React,
  events: {
    onSlSelect: "sl-select"
  },
  displayName: "SlMenu"
});
var menu_default = reactWrapper;

export {
  menu_default
};
