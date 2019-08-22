/*! Built with http://stenciljs.com */
import { h } from '../webcomponents.core.js';

import { b as MenuFlyoutActionTypes } from './chunk-bc34555f.js';
import { b as mapStateToProps, c as getStore } from './chunk-6a8011c5.js';

class MenuFlyoutToggle {
    onClick() {
        this.toggle();
    }
    componentWillLoad() {
        this.store = getStore(this);
        this.unsubscribe = mapStateToProps(this, this.store, [
            "display",
            "toggle"
        ]);
        this.dispatch({ type: MenuFlyoutActionTypes.setToggleEl, toggleEl: this.el });
    }
    componentDidUnload() {
        this.dispatch({ type: MenuFlyoutActionTypes.setToggleEl, toggleEl: undefined });
        this.unsubscribe();
    }
    dispatch(action) {
        if (this.store) {
            this.store.dispatch(action);
        }
    }
    render() {
        return (h("sdx-button", { theme: "transparent" },
            h("slot", null)));
    }
    static get is() { return "sdx-menu-flyout-toggle"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "display": {
            "state": true
        },
        "el": {
            "elementRef": true
        },
        "toggle": {
            "state": true
        }
    }; }
    static get listeners() { return [{
            "name": "click",
            "method": "onClick"
        }]; }
    static get style() { return ".sc-sdx-menu-flyout-toggle-h{-webkit-box-sizing:border-box;box-sizing:border-box}*.sc-sdx-menu-flyout-toggle, .sc-sdx-menu-flyout-toggle:after, .sc-sdx-menu-flyout-toggle:before{-webkit-box-sizing:inherit;box-sizing:inherit}.sc-sdx-menu-flyout-toggle-h   button.sc-sdx-menu-flyout-toggle{cursor:pointer;padding:0;margin:0;border:0;background-color:transparent}.sc-sdx-menu-flyout-toggle-h   button.sc-sdx-menu-flyout-toggle:focus, .sc-sdx-menu-flyout-toggle-h   button.sc-sdx-menu-flyout-toggle:hover{color:#0851da}"; }
}

export { MenuFlyoutToggle as SdxMenuFlyoutToggle };
