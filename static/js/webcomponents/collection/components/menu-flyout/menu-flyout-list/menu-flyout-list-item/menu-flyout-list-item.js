import { MenuFlyoutActionTypes } from "../../menu-flyout-store";
import { mapStateToProps, getStore } from "../../../../core/helpers/store-helpers";
export class MenuFlyoutListItem {
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
    static get style() { return "/**style-placeholder:sdx-menu-flyout-list-item:**/"; }
}
