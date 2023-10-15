/**
 * Serializes a form and returns a plain object. If a form control with the same name appears more than once, the
 * property will be converted to an array.
 */
export declare function serialize(form: HTMLFormElement): Record<string, unknown>;
/**
 * Returns all form controls that are associated with the specified form. Includes both native and Shoelace form
 * controls. Use this function in lieu of the `HTMLFormElement.elements` property, which doesn't recognize Shoelace
 * form controls.
 */
export declare function getFormControls(form: HTMLFormElement): Element[];
