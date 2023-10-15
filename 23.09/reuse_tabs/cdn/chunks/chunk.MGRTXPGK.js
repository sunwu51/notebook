import {
  SlMutationObserver
} from "./chunk.TVIKNRDE.js";

// src/react/mutation-observer/index.ts
import * as React from "react";
import { createComponent } from "@lit-labs/react";
import "@lit-labs/react";
var tagName = "sl-mutation-observer";
SlMutationObserver.define("sl-mutation-observer");
var reactWrapper = createComponent({
  tagName,
  elementClass: SlMutationObserver,
  react: React,
  events: {
    onSlMutation: "sl-mutation"
  },
  displayName: "SlMutationObserver"
});
var mutation_observer_default = reactWrapper;

export {
  mutation_observer_default
};
