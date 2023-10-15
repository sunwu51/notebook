import Component from '../../components/color-picker/color-picker.component.js';
import { type EventName } from '@lit-labs/react';
import type { SlBlurEvent } from '../../../src/events/events';
import type { SlChangeEvent } from '../../../src/events/events';
import type { SlFocusEvent } from '../../../src/events/events';
import type { SlInputEvent } from '../../../src/events/events';
import type { SlInvalidEvent } from '../../../src/events/events';
export type { SlBlurEvent } from '../../../src/events/events';
export type { SlChangeEvent } from '../../../src/events/events';
export type { SlFocusEvent } from '../../../src/events/events';
export type { SlInputEvent } from '../../../src/events/events';
export type { SlInvalidEvent } from '../../../src/events/events';
/**
 * @summary Color pickers allow the user to select a color.
 * @documentation https://shoelace.style/components/color-picker
 * @status stable
 * @since 2.0
 *
 * @dependency sl-button
 * @dependency sl-button-group
 * @dependency sl-dropdown
 * @dependency sl-input
 * @dependency sl-visually-hidden
 *
 * @slot label - The color picker's form label. Alternatively, you can use the `label` attribute.
 *
 * @event sl-blur - Emitted when the color picker loses focus.
 * @event sl-change - Emitted when the color picker's value changes.
 * @event sl-focus - Emitted when the color picker receives focus.
 * @event sl-input - Emitted when the color picker receives input.
 * @event sl-invalid - Emitted when the form control has been checked for validity and its constraints aren't satisfied.
 *
 * @csspart base - The component's base wrapper.
 * @csspart trigger - The color picker's dropdown trigger.
 * @csspart swatches - The container that holds the swatches.
 * @csspart swatch - Each individual swatch.
 * @csspart grid - The color grid.
 * @csspart grid-handle - The color grid's handle.
 * @csspart slider - Hue and opacity sliders.
 * @csspart slider-handle - Hue and opacity slider handles.
 * @csspart hue-slider - The hue slider.
 * @csspart hue-slider-handle - The hue slider's handle.
 * @csspart opacity-slider - The opacity slider.
 * @csspart opacity-slider-handle - The opacity slider's handle.
 * @csspart preview - The preview color.
 * @csspart input - The text input.
 * @csspart eye-dropper-button - The eye dropper button.
 * @csspart eye-dropper-button__base - The eye dropper button's exported `button` part.
 * @csspart eye-dropper-button__prefix - The eye dropper button's exported `prefix` part.
 * @csspart eye-dropper-button__label - The eye dropper button's exported `label` part.
 * @csspart eye-dropper-button__suffix - The eye dropper button's exported `suffix` part.
 * @csspart eye-dropper-button__caret - The eye dropper button's exported `caret` part.
 * @csspart format-button - The format button.
 * @csspart format-button__base - The format button's exported `button` part.
 * @csspart format-button__prefix - The format button's exported `prefix` part.
 * @csspart format-button__label - The format button's exported `label` part.
 * @csspart format-button__suffix - The format button's exported `suffix` part.
 * @csspart format-button__caret - The format button's exported `caret` part.
 *
 * @cssproperty --grid-width - The width of the color grid.
 * @cssproperty --grid-height - The height of the color grid.
 * @cssproperty --grid-handle-size - The size of the color grid's handle.
 * @cssproperty --slider-height - The height of the hue and alpha sliders.
 * @cssproperty --slider-handle-size - The diameter of the slider's handle.
 * @cssproperty --swatch-size - The size of each predefined color swatch.
 */
declare const reactWrapper: import("@lit-labs/react").ReactWebComponent<Component, {
    onSlBlur: EventName<SlBlurEvent>;
    onSlChange: EventName<SlChangeEvent>;
    onSlFocus: EventName<SlFocusEvent>;
    onSlInput: EventName<SlInputEvent>;
    onSlInvalid: EventName<SlInvalidEvent>;
}>;
export default reactWrapper;
