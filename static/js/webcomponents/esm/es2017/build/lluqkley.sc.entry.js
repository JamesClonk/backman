/*! Built with http://stenciljs.com */
import { h } from '../webcomponents.core.js';

import { b as MenuFlyoutActionTypes } from './chunk-bc34555f.js';
import { b as mapStateToProps, c as getStore } from './chunk-6a8011c5.js';

class MenuFlyoutCta {
    constructor() {
        this.size = "auto";
    }
    componentWillLoad() {
        this.store = getStore(this);
        this.unsubscribe = mapStateToProps(this, this.store, [
            "directionState"
        ]);
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
    hostData() {
        return {
            class: {
                [this.size]: true,
                [this.directionState]: true
            }
        };
    }
    render() {
        return (h("div", { class: "item" },
            h("div", { class: "arrow" }),
            h("div", { class: "body" },
                h("slot", null))));
    }
    static get is() { return "sdx-menu-flyout-cta"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "directionState": {
            "state": true
        },
        "el": {
            "elementRef": true
        },
        "size": {
            "type": String,
            "attr": "size"
        }
    }; }
    static get style() { return ".sc-sdx-menu-flyout-cta-h{-webkit-box-sizing:border-box;box-sizing:border-box}*.sc-sdx-menu-flyout-cta, .sc-sdx-menu-flyout-cta:after, .sc-sdx-menu-flyout-cta:before{-webkit-box-sizing:inherit;box-sizing:inherit}.sc-sdx-menu-flyout-cta-h > .item.sc-sdx-menu-flyout-cta > .arrow.sc-sdx-menu-flyout-cta{display:none;position:absolute;background-color:#fff;width:14px;height:14px;-webkit-transform:rotate(45deg);transform:rotate(45deg)}.sc-sdx-menu-flyout-cta-h{display:block;position:absolute;top:0;left:0;z-index:60000;-webkit-box-shadow:0 0 4px 0 rgba(0,0,0,.2);box-shadow:0 0 4px 0 rgba(0,0,0,.2);min-width:254px;max-width:850px}.sc-sdx-menu-flyout-cta-h > .item.sc-sdx-menu-flyout-cta > .body.sc-sdx-menu-flyout-cta{position:relative;background-color:#fff;padding:12px 24px;-webkit-transition:border-bottom .2s cubic-bezier(.4,0,.6,1),color .2s cubic-bezier(.4,0,.6,1);transition:border-bottom .2s cubic-bezier(.4,0,.6,1),color .2s cubic-bezier(.4,0,.6,1)}.sc-sdx-menu-flyout-cta-h:not(:last-of-type) > .item.sc-sdx-menu-flyout-cta > .body.sc-sdx-menu-flyout-cta{border-bottom:1px solid #e4e9ec}.bottom-left.sc-sdx-menu-flyout-cta-h > .item.sc-sdx-menu-flyout-cta > .arrow.sc-sdx-menu-flyout-cta, .bottom-right.sc-sdx-menu-flyout-cta-h > .item.sc-sdx-menu-flyout-cta > .arrow.sc-sdx-menu-flyout-cta{display:block;top:-7px;-webkit-box-shadow:-1px -1px 2px 0 rgba(0,0,0,.15);box-shadow:-1px -1px 2px 0 rgba(0,0,0,.15)}.top-left.sc-sdx-menu-flyout-cta-h > .item.sc-sdx-menu-flyout-cta > .arrow.sc-sdx-menu-flyout-cta, .top-right.sc-sdx-menu-flyout-cta-h > .item.sc-sdx-menu-flyout-cta > .arrow.sc-sdx-menu-flyout-cta{display:block;bottom:-7px;-webkit-box-shadow:1px 1px 2px 0 rgba(0,0,0,.15);box-shadow:1px 1px 2px 0 rgba(0,0,0,.15)}.bottom-left.sc-sdx-menu-flyout-cta-h > .item.sc-sdx-menu-flyout-cta > .arrow.sc-sdx-menu-flyout-cta, .top-left.sc-sdx-menu-flyout-cta-h > .item.sc-sdx-menu-flyout-cta > .arrow.sc-sdx-menu-flyout-cta{right:24px}.bottom-right.sc-sdx-menu-flyout-cta-h > .item.sc-sdx-menu-flyout-cta > .arrow.sc-sdx-menu-flyout-cta, .top-right.sc-sdx-menu-flyout-cta-h > .item.sc-sdx-menu-flyout-cta > .arrow.sc-sdx-menu-flyout-cta{left:24px}.small.sc-sdx-menu-flyout-cta-h > .item.sc-sdx-menu-flyout-cta > .body.sc-sdx-menu-flyout-cta{width:254px}.medium.sc-sdx-menu-flyout-cta-h > .item.sc-sdx-menu-flyout-cta > .body.sc-sdx-menu-flyout-cta{width:480px}.large.sc-sdx-menu-flyout-cta-h > .item.sc-sdx-menu-flyout-cta > .body.sc-sdx-menu-flyout-cta{width:850px}"; }
}

export { MenuFlyoutCta as SdxMenuFlyoutCta };
