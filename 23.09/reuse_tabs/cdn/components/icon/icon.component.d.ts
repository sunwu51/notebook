import ShoelaceElement from '../../internal/shoelace-element.js';
import type { CSSResultGroup, HTMLTemplateResult } from 'lit';
/**
 * @summary Icons are symbols that can be used to represent various options within an application.
 * @documentation https://shoelace.style/components/icon
 * @status stable
 * @since 2.0
 *
 * @event sl-load - Emitted when the icon has loaded. When using `spriteSheet: true` this will not emit.
 * @event sl-error - Emitted when the icon fails to load due to an error. When using `spriteSheet: true` this will not emit.
 *
 * @csspart svg - The internal SVG element.
 * @csspart use - The <use> element generated when using `spriteSheet: true`
 */
export default class SlIcon extends ShoelaceElement {
    static styles: CSSResultGroup;
    private initialRender;
    /** Given a URL, this function returns the resulting SVG element or an appropriate error symbol. */
    private resolveIcon;
    private svg;
    /** The name of the icon to draw. Available names depend on the icon library being used. */
    name?: string;
    /**
     * An external URL of an SVG file. Be sure you trust the content you are including, as it will be executed as code and
     * can result in XSS attacks.
     */
    src?: string;
    /**
     * An alternate description to use for assistive devices. If omitted, the icon will be considered presentational and
     * ignored by assistive devices.
     */
    label: string;
    /** The name of a registered custom icon library. */
    library: string;
    connectedCallback(): void;
    firstUpdated(): void;
    disconnectedCallback(): void;
    private getIconSource;
    handleLabelChange(): void;
    setIcon(): Promise<void>;
    render(): SVGElement | HTMLTemplateResult | null;
}
