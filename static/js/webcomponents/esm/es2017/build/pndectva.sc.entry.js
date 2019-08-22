/*! Built with http://stenciljs.com */
import { h } from '../webcomponents.core.js';

import { b as MenuFlyoutActionTypes } from './chunk-bc34555f.js';
import { b as mapStateToProps, c as getStore } from './chunk-6a8011c5.js';

class MenuFlyoutList {
    componentWillLoad() {
        this.store = getStore(this);
        this.unsubscribe = mapStateToProps(this, this.store, []);
        this.dispatch({ type: MenuFlyoutActionTypes.setContentEl, contentEl: this.el });
    }
    componentDidUnload() {
        this.dispatch({ type: MenuFlyoutActionTypes.setContentEl, contentEl: undefined });
        this.unsubscribe();
    }
    dispatch(action) {
        if (this.store) {
            this.store.dispatch(action);
        }
    }
    render() {
        return (h("slot", null));
    }
    static get is() { return "sdx-menu-flyout-list"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "el": {
            "elementRef": true
        }
    }; }
    static get style() { return ".sc-sdx-menu-flyout-list-h{-webkit-box-sizing:border-box;box-sizing:border-box}*.sc-sdx-menu-flyout-list, .sc-sdx-menu-flyout-list:after, .sc-sdx-menu-flyout-list:before{-webkit-box-sizing:inherit;box-sizing:inherit}.sc-sdx-menu-flyout-list-h{display:block;position:absolute;top:0;left:0;z-index:60000;-webkit-box-shadow:0 0 4px 0 rgba(0,0,0,.2);box-shadow:0 0 4px 0 rgba(0,0,0,.2);width:254px}"; }
}

export { MenuFlyoutList as SdxMenuFlyoutList };
