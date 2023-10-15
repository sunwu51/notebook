import {
  SlTag
} from "./chunk.5OHOXFON.js";

// src/react/tag/index.ts
import * as React from "react";
import { createComponent } from "@lit-labs/react";
import "@lit-labs/react";
var tagName = "sl-tag";
SlTag.define("sl-tag");
var reactWrapper = createComponent({
  tagName,
  elementClass: SlTag,
  react: React,
  events: {
    onSlRemove: "sl-remove"
  },
  displayName: "SlTag"
});
var tag_default = reactWrapper;

export {
  tag_default
};
