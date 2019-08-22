/*! Built with http://stenciljs.com */
import { h } from '../webcomponents.core.js';

import { b as MenuFlyoutActionTypes } from './chunk-bc34555f.js';
import { b as mapStateToProps, c as getStore } from './chunk-6a8011c5.js';

class MenuFlyoutListItem {
    constructor() {
        this.selectable = true;
        this.href = "javascript:void(0);";
        this.disabled = false;
    }
    componentWillLoad() {
        this.store = getStore(this);
        this.unsubscribe = mapStateToProps(this, this.store, [
            "directionState"
        ]);
    }
    componentDidLoad() {
        this.dispatch({ type: MenuFlyoutActionTypes.toggleArrowEl, arrowEl: this.arrowEl });
    }
    componentDidUnload() {
        this.dispatch({ type: MenuFlyoutActionTypes.toggleArrowEl, arrowEl: this.arrowEl });
        this.unsubscribe();
    }
    dispatch(action) {
        if (this.store) {
            this.store.dispatch(action);
        }
    }
    hostData() {
        return {
            class: {
                selectable: this.selectable && !this.disabled,
                disabled: this.disabled,
                [this.directionState]: true
            }
        };
    }
    render() {
        return (h("div", { class: "item" },
            h("div", { class: "arrow", ref: (el) => this.arrowEl = el }),
            h("a", { href: this.href, class: "body" },
                h("slot", null))));
    }
    static get is() { return "sdx-menu-flyout-list-item"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "directionState": {
            "state": true
        },
        "disabled": {
            "type": Boolean,
            "attr": "disabled"
        },
        "el": {
            "elementRef": true
        },
        "href": {
            "type": String,
            "attr": "href"
        },
        "selectable": {
            "type": Boolean,
            "attr": "selectable"
        }
    }; }
    static get style() { return ":host{-webkit-box-sizing:border-box;box-sizing:border-box}*,:after,:before{-webkit-box-sizing:inherit;box-sizing:inherit}:host>.item>.arrow{display:none;position:absolute;background-color:#fff;width:14px;height:14px;-webkit-transform:rotate(45deg);transform:rotate(45deg)}:host{display:block}:host>.item>.body{position:relative;background-color:#fff;color:#1781e3;display:block;padding:12px 24px;text-align:center;text-decoration:none;-webkit-transition:border-bottom .2s cubic-bezier(.4,0,.6,1),color .2s cubic-bezier(.4,0,.6,1);transition:border-bottom .2s cubic-bezier(.4,0,.6,1),color .2s cubic-bezier(.4,0,.6,1)}:host(.selectable)>.item>.body{cursor:pointer}:host(:not(.selectable))>.item>.body{cursor:not-allowed}:host(.selectable:hover)>.item>.arrow,:host(.selectable:hover)>.item>.body{color:#fff;background-color:#1781e3!important}:host(.disabled)>.item>.body{color:#d6d6d6}:host(:not(:last-of-type))>.item>.body{border-bottom:1px solid #e4e9ec}:host(.bottom-left:first-of-type)>.item>.arrow,:host(.bottom-right:first-of-type)>.item>.arrow{display:block;top:-7px;-webkit-box-shadow:-1px -1px 2px 0 rgba(0,0,0,.15);box-shadow:-1px -1px 2px 0 rgba(0,0,0,.15)}:host(.top-left:last-of-type)>.item>.arrow,:host(.top-right:last-of-type)>.item>.arrow{display:block;bottom:-7px;-webkit-box-shadow:1px 1px 2px 0 rgba(0,0,0,.15);box-shadow:1px 1px 2px 0 rgba(0,0,0,.15)}"; }
}

export { MenuFlyoutListItem as SdxMenuFlyoutListItem };
