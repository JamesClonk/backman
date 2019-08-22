/*! Built with http://stenciljs.com */
import { h } from '../webcomponents.core.js';

import { a as anime } from './chunk-55a98941.js';
import { a as menuFlyoutReducer, b as MenuFlyoutActionTypes } from './chunk-bc34555f.js';
import { a as createAndInstallStore, b as mapStateToProps } from './chunk-6a8011c5.js';
import { a as getSlot, b as installSlotObserver, c as isNativeSlot, d as getAllSlotChildNodes, e as parseFunction, f as closest, g as getPreviousFromList, h as getNextFromList } from './chunk-c2033b1f.js';

class MenuFlyout {
    constructor() {
        this.invokeDisplayChangeCallback = () => null;
        this.animationDuration = 300;
        this.isClicking = false;
        this.isHovering = false;
        this.oppositeDirection = {
            x: {
                "top-right": "top-left",
                "top-left": "top-right",
                "bottom-right": "bottom-left",
                "bottom-left": "bottom-right"
            },
            y: {
                "top-right": "bottom-right",
                "top-left": "bottom-left",
                "bottom-right": "top-right",
                "bottom-left": "top-left"
            }
        };
        this.easing = {
            inQuadOutQuint: [0.550, 0.085, 0.320, 1]
        };
        this.arrowUnrotatedWidth = 14;
        this.offset = 16;
        this.display = "closed";
        this.direction = "bottom-right";
        this.closeOnClick = false;
    }
    directionChanged() {
        if (this.display !== "closed") {
            this.close().then(() => {
                this.dispatchDirection(this.direction);
                this.open();
            });
        }
        else {
            this.dispatchDirection(this.direction);
        }
    }
    toggleElChanged() {
        this.toggleElChild = this.toggleEl
            ? this.toggleEl.children[0]
            : undefined;
    }
    displayChangeCallbackChanged() {
        this.setInvokeDisplayChangeCallback();
    }
    componentWillLoad() {
        this.setInvokeDisplayChangeCallback();
        this.store = createAndInstallStore(this, menuFlyoutReducer, this.getInitialState());
        this.unsubscribe = mapStateToProps(this, this.store, [
            "display",
            "directionState",
            "contentEl",
            "toggleEl",
            "arrowEls"
        ]);
        this.dispatchDirection(this.direction);
        this.store.dispatch({ type: MenuFlyoutActionTypes.setToggle, toggle: this.toggle.bind(this) });
    }
    displayChanged() {
        this.invokeDisplayChangeCallback(this.display);
    }
    componentDidLoad() {
        this.close();
    }
    componentDidUnload() {
        this.unsubscribe();
    }
    getInitialState() {
        return {
            display: "closed",
            directionState: "bottom-right",
            toggle: () => Promise.resolve(),
            contentEl: undefined,
            toggleEl: undefined,
            arrowEls: []
        };
    }
    onClick() {
        this.isClicking = true;
    }
    onWindowClick() {
        if (!this.isClicking || (this.display === "open" && this.closeOnClick)) {
            this.close();
        }
        this.isClicking = false;
    }
    onMouseEnter() {
        this.isHovering = true;
        this.open();
    }
    onMouseLeave() {
        setTimeout(() => {
            if (!this.isHovering) {
                this.close();
            }
        }, 400);
        this.isHovering = false;
    }
    toggle() {
        if (this.display === "open") {
            return this.close();
        }
        else if (this.display === "closed") {
            return this.open();
        }
        return Promise.resolve();
    }
    open() {
        return new Promise((resolve) => {
            if (!this.contentEl) {
                return;
            }
            if (!(this.display === "closed" || this.display === "closing")) {
                resolve();
                return;
            }
            const contentEl = this.contentEl;
            let direction = this.directionState;
            this.store.dispatch({ type: MenuFlyoutActionTypes.setDisplay, display: "opening" });
            contentEl.style.display = "block";
            this.positionContentEl(direction);
            const hasEnoughSpaceOnX = this.hasEnoughSpace(direction, "x");
            const hasEnoughSpaceOnY = this.hasEnoughSpace(direction, "y");
            if (!hasEnoughSpaceOnX) {
                const oppositeDirection = this.oppositeDirection.x[direction];
                this.positionContentEl(oppositeDirection, "x");
                if (this.hasEnoughSpace(oppositeDirection, "x")) {
                    direction = oppositeDirection;
                    this.dispatchDirection(direction);
                }
                else {
                    this.positionContentEl(oppositeDirection, "x", true);
                }
            }
            if (!hasEnoughSpaceOnY) {
                const oppositeDirection = this.oppositeDirection.y[direction];
                this.positionContentEl(oppositeDirection, "y");
                if (this.hasEnoughSpace(oppositeDirection, "y")) {
                    this.dispatchDirection(oppositeDirection);
                }
                else {
                    this.positionContentEl(direction, "y");
                }
            }
            const animationOffset = this.directionState === "top-left" || this.directionState === "top-right"
                ? -this.offset
                : this.offset;
            anime.remove(contentEl);
            anime({
                targets: contentEl,
                duration: this.animationDuration,
                translateY: animationOffset,
                opacity: 1,
                easing: this.easing.inQuadOutQuint,
                complete: () => {
                    this.store.dispatch({ type: MenuFlyoutActionTypes.setDisplay, display: "open" });
                    resolve();
                }
            });
        });
    }
    close() {
        return new Promise((resolve) => {
            const contentEl = this.contentEl;
            if (!contentEl) {
                return;
            }
            if (this.display === "closed") {
                contentEl.style.display = "none";
                contentEl.style.opacity = "0";
                resolve();
            }
            else {
                this.store.dispatch({ type: MenuFlyoutActionTypes.setDisplay, display: "closing" });
                anime.remove(contentEl);
                anime({
                    targets: contentEl,
                    duration: this.animationDuration,
                    translateY: 0,
                    opacity: 0,
                    easing: this.easing.inQuadOutQuint,
                    complete: () => {
                        contentEl.style.display = "none";
                        this.dispatchDirection(this.direction);
                        this.store.dispatch({ type: MenuFlyoutActionTypes.setDisplay, display: "closed" });
                        resolve();
                    }
                });
            }
        });
    }
    setInvokeDisplayChangeCallback() {
        this.invokeDisplayChangeCallback = parseFunction(this.displayChangeCallback);
    }
    dispatchDirection(direction) {
        this.store.dispatch({
            type: MenuFlyoutActionTypes.setDirectionState,
            directionState: direction
        });
    }
    hasEnoughSpace(direction, axis) {
        if (!this.contentEl) {
            return false;
        }
        const elRect = this.el.getBoundingClientRect();
        const contentElRect = this.contentEl.getBoundingClientRect();
        switch (axis) {
            case "x": {
                const directionIsLeft = direction === "top-left" || direction === "bottom-left";
                let remainingSpace;
                let totalWidth = contentElRect.width;
                if (directionIsLeft) {
                    remainingSpace = elRect.left;
                }
                else {
                    remainingSpace = innerWidth - elRect.left;
                }
                return totalWidth < remainingSpace;
            }
            case "y":
                const directionIsBottom = direction === "bottom-right" || direction === "bottom-left";
                let remainingSpace;
                let totalHeight;
                if (directionIsBottom) {
                    remainingSpace = innerHeight - elRect.bottom;
                    totalHeight = remainingSpace - (innerHeight - contentElRect.bottom);
                }
                else {
                    remainingSpace = elRect.top;
                    totalHeight = innerHeight - (innerHeight - elRect.top) - contentElRect.top;
                }
                totalHeight = totalHeight + this.offset;
                return totalHeight < remainingSpace;
            default:
                return true;
        }
    }
    positionContentEl(direction, axis, fullWidth) {
        if (!(this.contentEl && this.toggleEl)) {
            return;
        }
        const contentEl = this.contentEl;
        const contentElPosition = this.getContentElPosition(direction);
        this.contentEl.style.opacity = "0";
        this.contentEl.style.transform = "translateY(0)";
        if (!axis || axis === "x") {
            this.contentEl.style.left = contentElPosition[0] + "px";
        }
        if (!axis || axis === "y") {
            this.contentEl.style.top = contentElPosition[1] + "px";
        }
        if (fullWidth) {
            contentEl.style.width = `${innerWidth - (this.offset * 2)}px`;
            const toggleElRect = this.toggleEl.getBoundingClientRect();
            contentEl.style.left = `-${toggleElRect.left - this.offset}px`;
            const contentElPosition = this.getContentElPosition(direction);
            contentEl.style.top = `${contentElPosition[1]}px`;
        }
        const contentElRect = this.contentEl.getBoundingClientRect();
        const toggleElRect = this.toggleEl.getBoundingClientRect();
        this.arrowEls.forEach((arrowEl) => {
            arrowEl.style.left = `${toggleElRect.left - contentElRect.left + (toggleElRect.width / 2) - (this.arrowUnrotatedWidth / 2)}px`;
        });
    }
    getContentElPosition(direction) {
        if (!(this.contentEl && this.toggleElChild)) {
            return [0, 0];
        }
        const contentElRect = this.contentEl.getBoundingClientRect();
        const toggleElChildRect = this.toggleElChild.getBoundingClientRect();
        const top = -contentElRect.height;
        const bottom = toggleElChildRect.height;
        const right = (toggleElChildRect.width / 2) - (this.offset + this.arrowUnrotatedWidth);
        const left = -(contentElRect.width - toggleElChildRect.width) - right;
        switch (direction) {
            case "bottom-right":
                return [right, bottom];
            case "bottom-left":
                return [left, bottom];
            case "top-right":
                return [right, top];
            case "top-left":
                return [left, top];
            default:
                return [0, 0];
        }
    }
    render() {
        return (h("slot", null));
    }
    static get is() { return "sdx-menu-flyout"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "arrowEls": {
            "state": true
        },
        "close": {
            "method": true
        },
        "closeOnClick": {
            "type": Boolean,
            "attr": "close-on-click"
        },
        "contentEl": {
            "state": true
        },
        "direction": {
            "type": String,
            "attr": "direction",
            "watchCallbacks": ["directionChanged"]
        },
        "directionState": {
            "state": true
        },
        "display": {
            "state": true,
            "watchCallbacks": ["displayChanged"]
        },
        "displayChangeCallback": {
            "type": String,
            "attr": "display-change-callback",
            "watchCallbacks": ["displayChangeCallbackChanged"]
        },
        "el": {
            "elementRef": true
        },
        "open": {
            "method": true
        },
        "toggle": {
            "method": true
        },
        "toggleEl": {
            "state": true,
            "watchCallbacks": ["toggleElChanged"]
        }
    }; }
    static get listeners() { return [{
            "name": "click",
            "method": "onClick"
        }, {
            "name": "touchend",
            "method": "onClick",
            "passive": true
        }, {
            "name": "window:click",
            "method": "onWindowClick"
        }, {
            "name": "window:touchend",
            "method": "onWindowClick",
            "passive": true
        }, {
            "name": "mouseenter",
            "method": "onMouseEnter",
            "passive": true
        }, {
            "name": "mouseleave",
            "method": "onMouseLeave",
            "passive": true
        }]; }
    static get style() { return ".sc-sdx-menu-flyout-h{-webkit-box-sizing:border-box;box-sizing:border-box}*.sc-sdx-menu-flyout, .sc-sdx-menu-flyout:after, .sc-sdx-menu-flyout:before{-webkit-box-sizing:inherit;box-sizing:inherit}.sc-sdx-menu-flyout-h{position:relative;display:inline-block}"; }
}

export { MenuFlyout as SdxMenuFlyout };
