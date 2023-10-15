import {
  SlTreeItem
} from "./chunk.6U7YXO2I.js";

// src/react/tree-item/index.ts
import * as React from "react";
import { createComponent } from "@lit-labs/react";
import "@lit-labs/react";
var tagName = "sl-tree-item";
SlTreeItem.define("sl-tree-item");
var reactWrapper = createComponent({
  tagName,
  elementClass: SlTreeItem,
  react: React,
  events: {
    onSlExpand: "sl-expand",
    onSlAfterExpand: "sl-after-expand",
    onSlCollapse: "sl-collapse",
    onSlAfterCollapse: "sl-after-collapse",
    onSlLazyChange: "sl-lazy-change",
    onSlLazyLoad: "sl-lazy-load"
  },
  displayName: "SlTreeItem"
});
var tree_item_default = reactWrapper;

export {
  tree_item_default
};
