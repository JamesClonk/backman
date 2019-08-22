/*! Built with http://stenciljs.com */
import { h } from '../webcomponents.core.js';

import { b as MenuFlyoutActionTypes } from './chunk-bc34555f.js';
import { b as mapStateToProps, c as getStore } from './chunk-6a8011c5.js';

class MenuFlyoutContent {
    componentWillLoad() {
        this.store = getStore(this);
        this.unsubscribe = mapStateToProps(this, this.store, [
            "directionState"
        ]);
        this.dispatch({ type: MenuFlyoutActionTypes.setContentEl, contentEl: this.el });
    }
    componentDidLoad() {
        this.dispatch({ type: MenuFlyoutActionTypes.toggleArrowEl, arrowEl: this.arrowEl });
    }
    componentDidUnload() {
        this.dispatch({ type: MenuFlyoutActionTypes.toggleArrowEl, arrowEl: this.arrowEl });
        this.dispatch({ type: MenuFlyoutActionTypes.setContentEl, contentEl: undefined });
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
                [this.directionState]: true
            }
        };
    }
    render() {
        return (h("div", { class: "item" },
            h("div", { class: "arrow", ref: (el) => this.arrowEl = el }),
            h("div", { class: "body" },
                h("slot", null))));
    }
    static get is() { return "sdx-menu-flyout-content"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "directionState": {
            "state": true
        },
        "el": {
            "elementRef": true
        }
    }; }
    static get style() { return ".sc-sdx-menu-flyout-content-h{-webkit-box-sizing:border-box;box-sizing:border-box}*.sc-sdx-menu-flyout-content, .sc-sdx-menu-flyout-content:after, .sc-sdx-menu-flyout-content:before{-webkit-box-sizing:inherit;box-sizing:inherit}.sc-sdx-menu-flyout-content-h > .item.sc-sdx-menu-flyout-content > .arrow.sc-sdx-menu-flyout-content{display:none;position:absolute;background-color:#fff;width:14px;height:14px;-webkit-transform:rotate(45deg);transform:rotate(45deg)}.sc-sdx-menu-flyout-content-h{display:block;position:absolute;top:0;left:0;z-index:60000;-webkit-box-shadow:0 0 4px 0 rgba(0,0,0,.2);box-shadow:0 0 4px 0 rgba(0,0,0,.2)}.sc-sdx-menu-flyout-content-h > .item.sc-sdx-menu-flyout-content > .body.sc-sdx-menu-flyout-content{position:relative;background-color:#fff;padding:24px;-webkit-transition:border-bottom .2s cubic-bezier(.4,0,.6,1),color .2s cubic-bezier(.4,0,.6,1);transition:border-bottom .2s cubic-bezier(.4,0,.6,1),color .2s cubic-bezier(.4,0,.6,1)}.sc-sdx-menu-flyout-content-h:not(:last-of-type) > .item.sc-sdx-menu-flyout-content > .body.sc-sdx-menu-flyout-content{border-bottom:1px solid #e4e9ec}.bottom-left.sc-sdx-menu-flyout-content-h > .item.sc-sdx-menu-flyout-content > .arrow.sc-sdx-menu-flyout-content, .bottom-right.sc-sdx-menu-flyout-content-h > .item.sc-sdx-menu-flyout-content > .arrow.sc-sdx-menu-flyout-content{display:block;top:-7px;-webkit-box-shadow:-1px -1px 2px 0 rgba(0,0,0,.15);box-shadow:-1px -1px 2px 0 rgba(0,0,0,.15)}.top-left.sc-sdx-menu-flyout-content-h > .item.sc-sdx-menu-flyout-content > .arrow.sc-sdx-menu-flyout-content, .top-right.sc-sdx-menu-flyout-content-h > .item.sc-sdx-menu-flyout-content > .arrow.sc-sdx-menu-flyout-content{display:block;bottom:-7px;-webkit-box-shadow:1px 1px 2px 0 rgba(0,0,0,.15);box-shadow:1px 1px 2px 0 rgba(0,0,0,.15)}"; }
}

export { MenuFlyoutContent as SdxMenuFlyoutContent };
