import Component from '../../components/radio-group/radio-group.component.js';
import { type EventName } from '@lit-labs/react';
import type { SlChangeEvent } from '../../../src/events/events';
import type { SlInputEvent } from '../../../src/events/events';
import type { SlInvalidEvent } from '../../../src/events/events';
export type { SlChangeEvent } from '../../../src/events/events';
export type { SlInputEvent } from '../../../src/events/events';
export type { SlInvalidEvent } from '../../../src/events/events';
/**
 * @summary Radio groups are used to group multiple [radios](/components/radio) or [radio buttons](/components/radio-button) so they function as a single form control.
 * @documentation https://shoelace.style/components/radio-group
 * @status stable
 * @since 2.0
 *
 * @dependency sl-button-group
 *
 * @slot - The default slot where `<sl-radio>` or `<sl-radio-button>` elements are placed.
 * @slot label - The radio group's label. Required for proper accessibility. Alternatively, you can use the `label`
 *  attribute.
 *
 * @event sl-change - Emitted when the radio group's selected value changes.
 * @event sl-input - Emitted when the radio group receives user input.
 * @event sl-invalid - Emitted when the form control has been checked for validity and its constraints aren't satisfied.
 *
 * @csspart form-control - The form control that wraps the label, input, and help text.
 * @csspart form-control-label - The label's wrapper.
 * @csspart form-control-input - The input's wrapper.
 * @csspart form-control-help-text - The help text's wrapper.
 * @csspart button-group - The button group that wraps radio buttons.
 * @csspart button-group__base - The button group's `base` part.
 */
declare const reactWrapper: import("@lit-labs/react").ReactWebComponent<Component, {
    onSlChange: EventName<SlChangeEvent>;
    onSlInput: EventName<SlInputEvent>;
    onSlInvalid: EventName<SlInvalidEvent>;
}>;
export default reactWrapper;
