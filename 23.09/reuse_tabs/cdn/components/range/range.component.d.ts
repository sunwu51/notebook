import ShoelaceElement from '../../internal/shoelace-element.js';
import type { CSSResultGroup } from 'lit';
import type { ShoelaceFormControl } from '../../internal/shoelace-element.js';
/**
 * @summary Ranges allow the user to select a single value within a given range using a slider.
 * @documentation https://shoelace.style/components/range
 * @status stable
 * @since 2.0
 *
 * @slot label - The range's label. Alternatively, you can use the `label` attribute.
 * @slot help-text - Text that describes how to use the input. Alternatively, you can use the `help-text` attribute.
 *
 * @event sl-blur - Emitted when the control loses focus.
 * @event sl-change - Emitted when an alteration to the control's value is committed by the user.
 * @event sl-focus - Emitted when the control gains focus.
 * @event sl-input - Emitted when the control receives input.
 * @event sl-invalid - Emitted when the form control has been checked for validity and its constraints aren't satisfied.
 *
 * @csspart form-control - The form control that wraps the label, input, and help text.
 * @csspart form-control-label - The label's wrapper.
 * @csspart form-control-input - The range's wrapper.
 * @csspart form-control-help-text - The help text's wrapper.
 * @csspart base - The component's base wrapper.
 * @csspart input - The internal `<input>` element.
 * @csspart tooltip - The range's tooltip.
 *
 * @cssproperty --thumb-size - The size of the thumb.
 * @cssproperty --tooltip-offset - The vertical distance the tooltip is offset from the track.
 * @cssproperty --track-color-active - The color of the portion of the track that represents the current value.
 * @cssproperty --track-color-inactive - The of the portion of the track that represents the remaining value.
 * @cssproperty --track-height - The height of the track.
 * @cssproperty --track-active-offset - The point of origin of the active track.
 */
export default class SlRange extends ShoelaceElement implements ShoelaceFormControl {
    static styles: CSSResultGroup;
    private readonly formControlController;
    private readonly hasSlotController;
    private readonly localize;
    private resizeObserver;
    input: HTMLInputElement;
    output: HTMLOutputElement | null;
    private hasFocus;
    private hasTooltip;
    title: string;
    /** The name of the range, submitted as a name/value pair with form data. */
    name: string;
    /** The current value of the range, submitted as a name/value pair with form data. */
    value: number;
    /** The range's label. If you need to display HTML, use the `label` slot instead. */
    label: string;
    /** The range's help text. If you need to display HTML, use the help-text slot instead. */
    helpText: string;
    /** Disables the range. */
    disabled: boolean;
    /** The minimum acceptable value of the range. */
    min: number;
    /** The maximum acceptable value of the range. */
    max: number;
    /** The interval at which the range will increase and decrease. */
    step: number;
    /** The preferred placement of the range's tooltip. */
    tooltip: 'top' | 'bottom' | 'none';
    /**
     * A function used to format the tooltip's value. The range's value is passed as the first and only argument. The
     * function should return a string to display in the tooltip.
     */
    tooltipFormatter: (value: number) => string;
    /**
     * By default, form controls are associated with the nearest containing `<form>` element. This attribute allows you
     * to place the form control outside of a form and associate it with the form that has this `id`. The form must be in
     * the same document or shadow root for this to work.
     */
    form: string;
    /** The default value of the form control. Primarily used for resetting the form control. */
    defaultValue: number;
    /** Gets the validity state object */
    get validity(): ValidityState;
    /** Gets the validation message */
    get validationMessage(): string;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private handleChange;
    private handleInput;
    private handleBlur;
    private handleFocus;
    private handleThumbDragStart;
    private handleThumbDragEnd;
    private syncProgress;
    private syncTooltip;
    handleValueChange(): void;
    handleDisabledChange(): void;
    syncRange(): void;
    private handleInvalid;
    /** Sets focus on the range. */
    focus(options?: FocusOptions): void;
    /** Removes focus from the range. */
    blur(): void;
    /** Increments the value of the range by the value of the step attribute. */
    stepUp(): void;
    /** Decrements the value of the range by the value of the step attribute. */
    stepDown(): void;
    /** Checks for validity but does not show a validation message. Returns `true` when valid and `false` when invalid. */
    checkValidity(): boolean;
    /** Gets the associated form, if one exists. */
    getForm(): HTMLFormElement | null;
    /** Checks for validity and shows the browser's validation message if the control is invalid. */
    reportValidity(): boolean;
    /** Sets a custom validation message. Pass an empty string to restore validity. */
    setCustomValidity(message: string): void;
    render(): import("lit-html").TemplateResult<1>;
}
