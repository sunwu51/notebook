import Component from '../../components/carousel/carousel.component.js';
import { type EventName } from '@lit-labs/react';
import type { SlSlideChangeEvent } from '../../../src/events/events';
export type { SlSlideChangeEvent } from '../../../src/events/events';
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
declare const reactWrapper: import("@lit-labs/react").ReactWebComponent<Component, {
    onSlSlideChange: EventName<SlSlideChangeEvent>;
}>;
export default reactWrapper;
