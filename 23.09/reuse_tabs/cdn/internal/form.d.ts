import type { ReactiveController, ReactiveControllerHost } from 'lit';
import type { ShoelaceFormControl } from '../internal/shoelace-element.js';
import type SlButton from '../components/button/button.js';
export declare const formCollections: WeakMap<HTMLFormElement, Set<ShoelaceFormControl>>;
export interface FormControlControllerOptions {
    /** A function that returns the form containing the form control. */
    form: (input: ShoelaceFormControl) => HTMLFormElement | null;
    /** A function that returns the form control's name, which will be submitted with the form data. */
    name: (input: ShoelaceFormControl) => string;
    /** A function that returns the form control's current value. */
    value: (input: ShoelaceFormControl) => unknown | unknown[];
    /** A function that returns the form control's default value. */
    defaultValue: (input: ShoelaceFormControl) => unknown | unknown[];
    /** A function that returns the form control's current disabled state. If disabled, the value won't be submitted. */
    disabled: (input: ShoelaceFormControl) => boolean;
    /**
     * A function that maps to the form control's reportValidity() function. When the control is invalid, this will
     * prevent submission and trigger the browser's constraint violation warning.
     */
    reportValidity: (input: ShoelaceFormControl) => boolean;
    /** A function that sets the form control's value */
    setValue: (input: ShoelaceFormControl, value: unknown) => void;
    /**
     * An array of event names to listen to. When all events in the list are emitted, the control will receive validity
     * states such as user-valid and user-invalid.user interacted validity states. */
    assumeInteractionOn: string[];
}
/** A reactive controller to allow form controls to participate in form submission, validation, etc. */
export declare class FormControlController implements ReactiveController {
    host: ShoelaceFormControl & ReactiveControllerHost;
    form?: HTMLFormElement | null;
    options: FormControlControllerOptions;
    constructor(host: ReactiveControllerHost & ShoelaceFormControl, options?: Partial<FormControlControllerOptions>);
    hostConnected(): void;
    hostDisconnected(): void;
    hostUpdated(): void;
    private attachForm;
    private detachForm;
    private handleFormData;
    private handleFormSubmit;
    private handleFormReset;
    private handleInteraction;
    private reportFormValidity;
    private setUserInteracted;
    private doAction;
    /** Returns the associated `<form>` element, if one exists. */
    getForm(): HTMLFormElement | null;
    /** Resets the form, restoring all the control to their default value */
    reset(submitter?: HTMLInputElement | SlButton): void;
    /** Submits the form, triggering validation and form data injection. */
    submit(submitter?: HTMLInputElement | SlButton): void;
    /**
     * Synchronously sets the form control's validity. Call this when you know the future validity but need to update
     * the host element immediately, i.e. before Lit updates the component in the next update.
     */
    setValidity(isValid: boolean): void;
    /**
     * Updates the form control's validity based on the current value of `host.validity.valid`. Call this when anything
     * that affects constraint validation changes so the component receives the correct validity states.
     */
    updateValidity(): void;
    /**
     * Dispatches a non-bubbling, cancelable custom event of type `sl-invalid`.
     * If the `sl-invalid` event will be cancelled then the original `invalid`
     * event (which may have been passed as argument) will also be cancelled.
     * If no original `invalid` event has been passed then the `sl-invalid`
     * event will be cancelled before being dispatched.
     */
    emitInvalidEvent(originalInvalidEvent?: Event): void;
}
export declare const validValidityState: ValidityState;
export declare const valueMissingValidityState: ValidityState;
export declare const customErrorValidityState: ValidityState;
