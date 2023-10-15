import {
  SlRating
} from "./chunk.3SNIH4MP.js";

// src/react/rating/index.ts
import * as React from "react";
import { createComponent } from "@lit-labs/react";
import "@lit-labs/react";
var tagName = "sl-rating";
SlRating.define("sl-rating");
var reactWrapper = createComponent({
  tagName,
  elementClass: SlRating,
  react: React,
  events: {
    onSlChange: "sl-change",
    onSlHover: "sl-hover"
  },
  displayName: "SlRating"
});
var rating_default = reactWrapper;

export {
  rating_default
};
