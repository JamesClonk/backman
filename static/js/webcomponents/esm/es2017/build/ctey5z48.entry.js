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
    static get style() { return ":host{-webkit-box-sizing:border-box;box-sizing:border-box}*,:after,:before{-webkit-box-sizing:inherit;box-sizing:inherit}:host button{cursor:pointer;padding:0;margin:0;border:0;background-color:transparent}:host button:focus,:host button:hover{color:#0851da}"; }
}

export { MenuFlyoutToggle as SdxMenuFlyoutToggle };
