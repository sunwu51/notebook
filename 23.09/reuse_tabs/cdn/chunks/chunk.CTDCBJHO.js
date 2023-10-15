import {
  SlAnimatedImage
} from "./chunk.N4HXU5HH.js";

// src/react/animated-image/index.ts
import * as React from "react";
import { createComponent } from "@lit-labs/react";
import "@lit-labs/react";
var tagName = "sl-animated-image";
SlAnimatedImage.define("sl-animated-image");
var reactWrapper = createComponent({
  tagName,
  elementClass: SlAnimatedImage,
  react: React,
  events: {
    onSlLoad: "sl-load",
    onSlError: "sl-error"
  },
  displayName: "SlAnimatedImage"
});
var animated_image_default = reactWrapper;

export {
  animated_image_default
};
