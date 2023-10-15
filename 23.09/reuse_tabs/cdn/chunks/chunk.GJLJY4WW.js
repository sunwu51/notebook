import {
  SlCarousel
} from "./chunk.GKH4LBJE.js";

// src/react/carousel/index.ts
import * as React from "react";
import { createComponent } from "@lit-labs/react";
import "@lit-labs/react";
var tagName = "sl-carousel";
SlCarousel.define("sl-carousel");
var reactWrapper = createComponent({
  tagName,
  elementClass: SlCarousel,
  react: React,
  events: {
    onSlSlideChange: "sl-slide-change"
  },
  displayName: "SlCarousel"
});
var carousel_default = reactWrapper;

export {
  carousel_default
};
