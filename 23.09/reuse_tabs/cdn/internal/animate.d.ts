/**
 * Animates an element using keyframes. Returns a promise that resolves after the animation completes or gets canceled.
 */
export declare function animateTo(el: HTMLElement, keyframes: Keyframe[], options?: KeyframeAnimationOptions): Promise<unknown>;
/** Parses a CSS duration and returns the number of milliseconds. */
export declare function parseDuration(delay: number | string): number;
/** Tells if the user has enabled the "reduced motion" setting in their browser or OS. */
export declare function prefersReducedMotion(): boolean;
/**
 * Stops all active animations on the target element. Returns a promise that resolves after all animations are canceled.
 */
export declare function stopAnimations(el: HTMLElement): Promise<unknown[]>;
/**
 * We can't animate `height: auto`, but we can calculate the height and shim keyframes by replacing it with the
 * element's scrollHeight before the animation.
 */
export declare function shimKeyframesHeightAuto(keyframes: Keyframe[], calculatedHeight: number): {
    height: string | number | null | undefined;
    composite?: CompositeOperationOrAuto | undefined;
    easing?: string | undefined;
    offset?: number | null | undefined;
}[];
