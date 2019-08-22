import { MenuFlyoutActionTypes } from "../menu-flyout-store";
import { mapStateToProps, getStore } from "../../../core/helpers/store-helpers";
export class MenuFlyoutCta {
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
    static get style() { return "/**style-placeholder:sdx-menu-flyout-cta:**/"; }
}
