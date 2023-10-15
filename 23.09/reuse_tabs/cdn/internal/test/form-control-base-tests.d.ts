import type { ShoelaceFormControl } from '../shoelace-element.js';
/** Runs a set of generic tests for Shoelace form controls */
export declare function runFormControlBaseTests<T extends ShoelaceFormControl = ShoelaceFormControl>(tagNameOrConfig: string | {
    tagName: string;
    init?: (control: T) => void;
    variantName: string;
}): void;
