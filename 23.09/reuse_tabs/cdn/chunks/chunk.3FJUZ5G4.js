import {
  SlSplitPanel
} from "./chunk.G74GH4Z7.js";

// src/react/split-panel/index.ts
import * as React from "react";
import { createComponent } from "@lit-labs/react";
import "@lit-labs/react";
var tagName = "sl-split-panel";
SlSplitPanel.define("sl-split-panel");
var reactWrapper = createComponent({
  tagName,
  elementClass: SlSplitPanel,
  react: React,
  events: {
    onSlReposition: "sl-reposition"
  },
  displayName: "SlSplitPanel"
});
var split_panel_default = reactWrapper;

export {
  split_panel_default
};
