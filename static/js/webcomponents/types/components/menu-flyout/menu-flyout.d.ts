import '../../stencil.core';
import { MenuFlyoutState } from "./menu-flyout-store";
import { Display } from "../../core/types/types";
import { Direction } from "./types";
export declare class MenuFlyout {
    private store;
    private unsubscribe;
    private invokeDisplayChangeCallback;
    private toggleElChild?;
    private animationDuration;
    private isClicking;
    private isHovering;
    private oppositeDirection;
    /**
     * Equivalent to gsap's [ Power1.easeIn, Power4.easeOut ].
     */
    private easing;
    /**
     * The arrow is a 14px square (rotated by 45°).
     */
    private arrowUnrotatedWidth;
    /**
     * Distance from the toggle to the arrow (and, on mobiles, to the screen).
     */
    private offset;
    el: HTMLSdxMenuFlyoutElement;
    display: MenuFlyoutState["display"];
    directionState: MenuFlyoutState["directionState"];
    contentEl: MenuFlyoutState["contentEl"];
    toggleEl: MenuFlyoutState["toggleEl"];
    arrowEls: MenuFlyoutState["arrowEls"];
    /**
     * In which direction the flyout opens.
     */
    direction: Direction;
    /**
     * Close if the user clicks on the flyout.
     */
    closeOnClick: boolean;
    /**
     * Callback that will fire after the flyouts display status has changed.
     */
    displayChangeCallback?: ((display: Display) => void) | string;
    directionChanged(): void;
    toggleElChanged(): void;
    displayChangeCallbackChanged(): void;
    componentWillLoad(): void;
    displayChanged(): void;
    componentDidLoad(): void;
    componentDidUnload(): void;
    private getInitialState;
    onClick(): void;
    onWindowClick(): void;
    onMouseEnter(): void;
    onMouseLeave(): void;
    /**
     * Toggles the flyout.
     */
    toggle(): Promise<void>;
    /**
     * Opens the flyout.
     */
    open(): Promise<void>;
    /**
     * Closes the flyout.
     */
    close(): Promise<void>;
    private setInvokeDisplayChangeCallback;
    private dispatchDirection;
    /**
     * Checks if there's enough space to open the flyout (above or below the toggle)
     * @param direction Desired direction to check
     * @param axis Whether to check vertically or horizontally
     */
    private hasEnoughSpace;
    private positionContentEl;
    /**
     * Return the position where the flyout will appear (depending on the direction).
     * @param direction Desired direction to check
     */
    private getContentElPosition;
    render(): JSX.Element;
}
