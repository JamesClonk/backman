import '../../../../stencil.core';
import { ArrowPosition } from "../../types";
export declare class Header {
    private arrowEl;
    el: HTMLSdxAccordionItemHeaderElement;
    /**
     * @private
     */
    arrowPosition: ArrowPosition;
    /**
     * @private
     */
    expand: boolean;
    /**
     * Triggers toggle information in accordion
     */
    toggle: () => void;
    arrowPositionChanged(): void;
    activeItemChanged(): void;
    componentDidLoad(): void;
    onClick(): void;
    onMouseOver(): void;
    onMouseOut(): void;
    /**
     * Closes this accordion item.
     */
    closeItem(): void;
    /**
     * Opens this accordion item.
     */
    openItem(): void;
    /**
     * Sets child reference of the arrow.
     */
    setChildElementsReferences(): void;
    /**
     * Sets the arrow position.
     */
    private setArrowPosition;
    /**
     * Sets the arrow direction.
     */
    private setArrowDirection;
    /**
     * Sets the arrow hover.
     */
    private setArrowHover;
    render(): JSX.Element;
}
