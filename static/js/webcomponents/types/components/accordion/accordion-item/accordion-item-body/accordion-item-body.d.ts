import '../../../../stencil.core';
import { ArrowPosition } from "../../types";
export declare class Body {
    private initialLoad;
    private animation;
    private easing;
    el: HTMLSdxAccordionItemBodyElement;
    /**
     * @private
     */
    arrowPosition: ArrowPosition;
    /**
     * Toggles body directly when initial load or with an animation.
     * @param isOpen Open state of the accordion item.
     */
    toggle(isOpen: boolean): void;
    /**
     * Sets class to handle immediately the open/close state.
     * @param newState Open State of the accordion item.
     */
    private initiateOpenState;
    /**
     * Opens section with an animation.
     */
    private openCollapseSection;
    /**
     * Closes section with an animation.
     */
    private closeCollapseSection;
    private stopAnimations;
    render(): JSX.Element;
}
