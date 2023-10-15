import Component from '../../components/tree-item/tree-item.component.js';
import { type EventName } from '@lit-labs/react';
import type { SlExpandEvent } from '../../../src/events/events';
import type { SlAfterExpandEvent } from '../../../src/events/events';
import type { SlCollapseEvent } from '../../../src/events/events';
import type { SlAfterCollapseEvent } from '../../../src/events/events';
import type { SlLazyChangeEvent } from '../../../src/events/events';
import type { SlLazyLoadEvent } from '../../../src/events/events';
export type { SlExpandEvent } from '../../../src/events/events';
export type { SlAfterExpandEvent } from '../../../src/events/events';
export type { SlCollapseEvent } from '../../../src/events/events';
export type { SlAfterCollapseEvent } from '../../../src/events/events';
export type { SlLazyChangeEvent } from '../../../src/events/events';
export type { SlLazyLoadEvent } from '../../../src/events/events';
/**
 * @summary A tree item serves as a hierarchical node that lives inside a [tree](/components/tree).
 * @documentation https://shoelace.style/components/tree-item
 * @status stable
 * @since 2.0
 *
 * @dependency sl-checkbox
 * @dependency sl-icon
 * @dependency sl-spinner
 *
 * @event sl-expand - Emitted when the tree item expands.
 * @event sl-after-expand - Emitted after the tree item expands and all animations are complete.
 * @event sl-collapse - Emitted when the tree item collapses.
 * @event sl-after-collapse - Emitted after the tree item collapses and all animations are complete.
 * @event sl-lazy-change - Emitted when the tree item's lazy state changes.
 * @event sl-lazy-load - Emitted when a lazy item is selected. Use this event to asynchronously load data and append
 *  items to the tree before expanding. After appending new items, remove the `lazy` attribute to remove the loading
 *  state and update the tree.
 *
 * @slot - The default slot.
 * @slot expand-icon - The icon to show when the tree item is expanded.
 * @slot collapse-icon - The icon to show when the tree item is collapsed.
 *
 * @csspart base - The component's base wrapper.
 * @csspart item - The tree item's container. This element wraps everything except slotted tree item children.
 * @csspart item--disabled - Applied when the tree item is disabled.
 * @csspart item--expanded - Applied when the tree item is expanded.
 * @csspart item--indeterminate - Applied when the selection is indeterminate.
 * @csspart item--selected - Applied when the tree item is selected.
 * @csspart indentation - The tree item's indentation container.
 * @csspart expand-button - The container that wraps the tree item's expand button and spinner.
 * @csspart label - The tree item's label.
 * @csspart children - The container that wraps the tree item's nested children.
 * @csspart checkbox - The checkbox that shows when using multiselect.
 * @csspart checkbox__base - The checkbox's exported `base` part.
 * @csspart checkbox__control - The checkbox's exported `control` part.
 * @csspart checkbox__control--checked - The checkbox's exported `control--checked` part.
 * @csspart checkbox__control--indeterminate - The checkbox's exported `control--indeterminate` part.
 * @csspart checkbox__checked-icon - The checkbox's exported `checked-icon` part.
 * @csspart checkbox__indeterminate-icon - The checkbox's exported `indeterminate-icon` part.
 * @csspart checkbox__label - The checkbox's exported `label` part.
 */
declare const reactWrapper: import("@lit-labs/react").ReactWebComponent<Component, {
    onSlExpand: EventName<SlExpandEvent>;
    onSlAfterExpand: EventName<SlAfterExpandEvent>;
    onSlCollapse: EventName<SlCollapseEvent>;
    onSlAfterCollapse: EventName<SlAfterCollapseEvent>;
    onSlLazyChange: EventName<SlLazyChangeEvent>;
    onSlLazyLoad: EventName<SlLazyLoadEvent>;
}>;
export default reactWrapper;
