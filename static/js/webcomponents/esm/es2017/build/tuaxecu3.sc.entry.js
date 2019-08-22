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
    static get style() { return ".sc-sdx-menu-flyout-list-item-h{-webkit-box-sizing:border-box;box-sizing:border-box}*.sc-sdx-menu-flyout-list-item, .sc-sdx-menu-flyout-list-item:after, .sc-sdx-menu-flyout-list-item:before{-webkit-box-sizing:inherit;box-sizing:inherit}.sc-sdx-menu-flyout-list-item-h > .item.sc-sdx-menu-flyout-list-item > .arrow.sc-sdx-menu-flyout-list-item{display:none;position:absolute;background-color:#fff;width:14px;height:14px;-webkit-transform:rotate(45deg);transform:rotate(45deg)}.sc-sdx-menu-flyout-list-item-h{display:block}.sc-sdx-menu-flyout-list-item-h > .item.sc-sdx-menu-flyout-list-item > .body.sc-sdx-menu-flyout-list-item{position:relative;background-color:#fff;color:#1781e3;display:block;padding:12px 24px;text-align:center;text-decoration:none;-webkit-transition:border-bottom .2s cubic-bezier(.4,0,.6,1),color .2s cubic-bezier(.4,0,.6,1);transition:border-bottom .2s cubic-bezier(.4,0,.6,1),color .2s cubic-bezier(.4,0,.6,1)}.selectable.sc-sdx-menu-flyout-list-item-h > .item.sc-sdx-menu-flyout-list-item > .body.sc-sdx-menu-flyout-list-item{cursor:pointer}.sc-sdx-menu-flyout-list-item-h:not(.selectable) > .item.sc-sdx-menu-flyout-list-item > .body.sc-sdx-menu-flyout-list-item{cursor:not-allowed}.selectable.sc-sdx-menu-flyout-list-item-h:hover > .item.sc-sdx-menu-flyout-list-item > .arrow.sc-sdx-menu-flyout-list-item, .selectable.sc-sdx-menu-flyout-list-item-h:hover > .item.sc-sdx-menu-flyout-list-item > .body.sc-sdx-menu-flyout-list-item{color:#fff;background-color:#1781e3!important}.disabled.sc-sdx-menu-flyout-list-item-h > .item.sc-sdx-menu-flyout-list-item > .body.sc-sdx-menu-flyout-list-item{color:#d6d6d6}.sc-sdx-menu-flyout-list-item-h:not(:last-of-type) > .item.sc-sdx-menu-flyout-list-item > .body.sc-sdx-menu-flyout-list-item{border-bottom:1px solid #e4e9ec}.bottom-left.sc-sdx-menu-flyout-list-item-h:first-of-type > .item.sc-sdx-menu-flyout-list-item > .arrow.sc-sdx-menu-flyout-list-item, .bottom-right.sc-sdx-menu-flyout-list-item-h:first-of-type > .item.sc-sdx-menu-flyout-list-item > .arrow.sc-sdx-menu-flyout-list-item{display:block;top:-7px;-webkit-box-shadow:-1px -1px 2px 0 rgba(0,0,0,.15);box-shadow:-1px -1px 2px 0 rgba(0,0,0,.15)}.top-left.sc-sdx-menu-flyout-list-item-h:last-of-type > .item.sc-sdx-menu-flyout-list-item > .arrow.sc-sdx-menu-flyout-list-item, .top-right.sc-sdx-menu-flyout-list-item-h:last-of-type > .item.sc-sdx-menu-flyout-list-item > .arrow.sc-sdx-menu-flyout-list-item{display:block;bottom:-7px;-webkit-box-shadow:1px 1px 2px 0 rgba(0,0,0,.15);box-shadow:1px 1px 2px 0 rgba(0,0,0,.15)}"; }
}

export { MenuFlyoutListItem as SdxMenuFlyoutListItem };
