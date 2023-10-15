import { FormControlController } from '../../internal/form.js';
import ShoelaceElement from '../../internal/shoelace-element.js';
import SlButtonGroup from '../button-group/button-group.component.js';
import type { CSSResultGroup } from 'lit';
import type { ShoelaceFormControl } from '../../internal/shoelace-element.js';
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
export default class SlRadioGroup extends ShoelaceElement implements ShoelaceFormControl {
    static styles: CSSResultGroup;
    static dependencies: {
        'sl-button-group': typeof SlButtonGroup;
    };
    protected readonly formControlController: FormControlController;
    private readonly hasSlotController;
    private customValidityMessage;
    private validationTimeout;
    defaultSlot: HTMLSlotElement;
    validationInput: HTMLInputElement;
    private hasButtonGroup;
    private errorMessage;
    defaultValue: string;
    /**
     * The radio group's label. Required for proper accessibility. If you need to display HTML, use the `label` slot
     * instead.
     */
    label: string;
    /** The radio groups's help text. If you need to display HTML, use the `help-text` slot instead. */
    helpText: string;
    /** The name of the radio group, submitted as a name/value pair with form data. */
    name: string;
    /** The current value of the radio group, submitted as a name/value pair with form data. */
    value: string;
    /** The radio group's size. This size will be applied to all child radios and radio buttons. */
    size: 'small' | 'medium' | 'large';
    /**
     * By default, form controls are associated with the nearest containing `<form>` element. This attribute allows you
     * to place the form control outside of a form and associate it with the form that has this `id`. The form must be in
     * the same document or shadow root for this to work.
     */
    form: string;
    /** Ensures a child radio is checked before allowing the containing form to submit. */
    required: boolean;
    /** Gets the validity state object */
    get validity(): ValidityState;
    /** Gets the validation message */
    get validationMessage(): string;
    connectedCallback(): void;
    firstUpdated(): void;
    private getAllRadios;
    private handleRadioClick;
    private handleKeyDown;
    private handleLabelClick;
    private handleInvalid;
    private syncRadioElements;
    private syncRadios;
    private updateCheckedRadio;
    handleSizeChange(): void;
    handleValueChange(): void;
    /** Checks for validity but does not show a validation message. Returns `true` when valid and `false` when invalid. */
    checkValidity(): boolean;
    /** Gets the associated form, if one exists. */
    getForm(): HTMLFormElement | null;
    /** Checks for validity and shows the browser's validation message if the control is invalid. */
    reportValidity(): boolean;
    /** Sets a custom validation message. Pass an empty string to restore validity. */
    setCustomValidity(message?: string): void;
    render(): import("lit-html").TemplateResult<1>;
}
