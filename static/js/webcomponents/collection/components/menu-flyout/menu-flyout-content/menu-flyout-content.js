import { MenuFlyoutActionTypes } from "../menu-flyout-store";
import { mapStateToProps, getStore } from "../../../core/helpers/store-helpers";
export class MenuFlyoutContent {
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
    static get style() { return "/**style-placeholder:sdx-menu-flyout-content:**/"; }
}
