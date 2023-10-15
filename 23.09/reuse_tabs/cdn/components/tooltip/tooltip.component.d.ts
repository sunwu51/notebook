import ShoelaceElement from '../../internal/shoelace-element.js';
import SlPopup from '../popup/popup.component.js';
import type { CSSResultGroup } from 'lit';
/**
 * @summary Tooltips display additional information based on a specific action.
 * @documentation https://shoelace.style/components/tooltip
 * @status stable
 * @since 2.0
 *
 * @dependency sl-popup
 *
 * @slot - The tooltip's target element. Avoid slotting in more than one element, as subsequent ones will be ignored.
 * @slot content - The content to render in the tooltip. Alternatively, you can use the `content` attribute.
 *
 * @event sl-show - Emitted when the tooltip begins to show.
 * @event sl-after-show - Emitted after the tooltip has shown and all animations are complete.
 * @event sl-hide - Emitted when the tooltip begins to hide.
 * @event sl-after-hide - Emitted after the tooltip has hidden and all animations are complete.
 *
 * @csspart base - The component's base wrapper, an `<sl-popup>` element.
 * @csspart base__popup - The popup's exported `popup` part. Use this to target the tooltip's popup container.
 * @csspart base__arrow - The popup's exported `arrow` part. Use this to target the tooltip's arrow.
 * @csspart body - The tooltip's body where its content is rendered.
 *
 * @cssproperty --max-width - The maximum width of the tooltip before its content will wrap.
 * @cssproperty --hide-delay - The amount of time to wait before hiding the tooltip when hovering.
 * @cssproperty --show-delay - The amount of time to wait before showing the tooltip when hovering.
 *
 * @animation tooltip.show - The animation to use when showing the tooltip.
 * @animation tooltip.hide - The animation to use when hiding the tooltip.
 */
export default class SlTooltip extends ShoelaceElement {
    static styles: CSSResultGroup;
    static dependencies: {
        'sl-popup': typeof SlPopup;
    };
    private hoverTimeout;
    private readonly localize;
    defaultSlot: HTMLSlotElement;
    body: HTMLElement;
    popup: SlPopup;
    /** The tooltip's content. If you need to display HTML, use the `content` slot instead. */
    content: string;
    /**
     * The preferred placement of the tooltip. Note that the actual placement may vary as needed to keep the tooltip
     * inside of the viewport.
     */
    placement: 'top' | 'top-start' | 'top-end' | 'right' | 'right-start' | 'right-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end';
    /** Disables the tooltip so it won't show when triggered. */
    disabled: boolean;
    /** The distance in pixels from which to offset the tooltip away from its target. */
    distance: number;
    /** Indicates whether or not the tooltip is open. You can use this in lieu of the show/hide methods. */
    open: boolean;
    /** The distance in pixels from which to offset the tooltip along its target. */
    skidding: number;
    /**
     * Controls how the tooltip is activated. Possible options include `click`, `hover`, `focus`, and `manual`. Multiple
     * options can be passed by separating them with a space. When manual is used, the tooltip must be activated
     * programmatically.
     */
    trigger: string;
    /**
     * Enable this option to prevent the tooltip from being clipped when the component is placed inside a container with
     * `overflow: auto|hidden|scroll`. Hoisting uses a fixed positioning strategy that works in many, but not all,
     * scenarios.
     */
    hoist: boolean;
    constructor();
    connectedCallback(): void;
    firstUpdated(): void;
    private handleBlur;
    private handleClick;
    private handleFocus;
    private handleKeyDown;
    private handleMouseOver;
    private handleMouseOut;
    private hasTrigger;
    handleOpenChange(): Promise<void>;
    handleOptionsChange(): Promise<void>;
    handleDisabledChange(): void;
    /** Shows the tooltip. */
    show(): Promise<void>;
    /** Hides the tooltip */
    hide(): Promise<void>;
    render(): import("lit-html").TemplateResult<1>;
}
