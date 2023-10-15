import Component from '../../components/mutation-observer/mutation-observer.component.js';
import { type EventName } from '@lit-labs/react';
import type { SlMutationEvent } from '../../../src/events/events';
export type { SlMutationEvent } from '../../../src/events/events';
/**
 * @summary The Mutation Observer component offers a thin, declarative interface to the [`MutationObserver API`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver).
 * @documentation https://shoelace.style/components/mutation-observer
 * @status stable
 * @since 2.0
 *
 * @event {{ mutationList: MutationRecord[] }} sl-mutation - Emitted when a mutation occurs.
 *
 * @slot - The content to watch for mutations.
 */
declare const reactWrapper: import("@lit-labs/react").ReactWebComponent<Component, {
    onSlMutation: EventName<SlMutationEvent>;
}>;
export default reactWrapper;
