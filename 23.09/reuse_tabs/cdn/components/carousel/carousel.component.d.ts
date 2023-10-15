import ShoelaceElement from '../../internal/shoelace-element.js';
import SlIcon from '../icon/icon.component.js';
import type { CSSResultGroup } from 'lit';
/**
 * @summary Carousels display an arbitrary number of content slides along a horizontal or vertical axis.
 *
 * @since 2.2
 * @status experimental
 *
 * @dependency sl-icon
 *
 * @event {{ index: number, slide: SlCarouselItem }} sl-slide-change - Emitted when the active slide changes.
 *
 * @slot - The carousel's main content, one or more `<sl-carousel-item>` elements.
 * @slot next-icon - Optional next icon to use instead of the default. Works best with `<sl-icon>`.
 * @slot previous-icon - Optional previous icon to use instead of the default. Works best with `<sl-icon>`.
 *
 * @csspart base - The carousel's internal wrapper.
 * @csspart scroll-container - The scroll container that wraps the slides.
 * @csspart pagination - The pagination indicators wrapper.
 * @csspart pagination-item - The pagination indicator.
 * @csspart pagination-item--active - Applied when the item is active.
 * @csspart navigation - The navigation wrapper.
 * @csspart navigation-button - The navigation button.
 * @csspart navigation-button--previous - Applied to the previous button.
 * @csspart navigation-button--next - Applied to the next button.
 *
 * @cssproperty --slide-gap - The space between each slide.
 * @cssproperty --aspect-ratio - The aspect ratio of each slide.
 * @cssproperty --scroll-hint - The amount of padding to apply to the scroll area, allowing adjacent slides to become
 *  partially visible as a scroll hint.
 */
export default class SlCarousel extends ShoelaceElement {
    static styles: CSSResultGroup;
    static dependencies: {
        'sl-icon': typeof SlIcon;
    };
    /** When set, allows the user to navigate the carousel in the same direction indefinitely. */
    loop: boolean;
    /** When set, show the carousel's navigation. */
    navigation: boolean;
    /** When set, show the carousel's pagination indicators. */
    pagination: boolean;
    /** When set, the slides will scroll automatically when the user is not interacting with them.  */
    autoplay: boolean;
    /** Specifies the amount of time, in milliseconds, between each automatic scroll.  */
    autoplayInterval: number;
    /** Specifies how many slides should be shown at a given time.  */
    slidesPerPage: number;
    /**
     * Specifies the number of slides the carousel will advance when scrolling, useful when specifying a `slides-per-page`
     * greater than one.
     */
    slidesPerMove: number;
    /** Specifies the orientation in which the carousel will lay out.  */
    orientation: 'horizontal' | 'vertical';
    /** When set, it is possible to scroll through the slides by dragging them with the mouse. */
    mouseDragging: boolean;
    defaultSlot: HTMLSlotElement;
    scrollContainer: HTMLElement;
    paginationContainer: HTMLElement;
    activeSlide: number;
    private autoplayController;
    private scrollController;
    private readonly slides;
    private intersectionObserver;
    private readonly intersectionObserverEntries;
    private readonly localize;
    private mutationObserver;
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected firstUpdated(): void;
    private getPageCount;
    private getCurrentPage;
    private getSlides;
    private handleKeyDown;
    private handleScrollEnd;
    private handleSlotChange;
    initializeSlides(): void;
    handelSlideChange(): void;
    handleSlidesPerMoveChange(): void;
    handleAutoplayChange(): void;
    handleMouseDraggingChange(): void;
    /**
     * Move the carousel backward by `slides-per-move` slides.
     *
     * @param behavior - The behavior used for scrolling.
     */
    previous(behavior?: ScrollBehavior): void;
    /**
     * Move the carousel forward by `slides-per-move` slides.
     *
     * @param behavior - The behavior used for scrolling.
     */
    next(behavior?: ScrollBehavior): void;
    /**
     * Scrolls the carousel to the slide specified by `index`.
     *
     * @param index - The slide index.
     * @param behavior - The behavior used for scrolling.
     */
    goToSlide(index: number, behavior?: ScrollBehavior): void;
    render(): import("lit-html").TemplateResult<1>;
}
