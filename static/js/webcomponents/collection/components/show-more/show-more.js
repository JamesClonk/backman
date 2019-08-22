import * as wcHelpers from "../../core/helpers/webcomponent-helpers";
export class ShowMore {
    constructor() {
        this.start = 1;
        this.invokeIncrementCallback = () => null;
        this.currentlyDisplayedItems = 0;
        this.incrementBy = 10;
        this.initialItems = 0;
        this.totalItems = 0;
        this.fromLabel = "from";
        this.moreLabel = "Show more";
        this.buttonTheme = "primary";
    }
    totalItemsChanged() {
        this.reset();
    }
    incrementCallbackChanged() {
        this.setInvokeIncrementCallback();
    }
    componentWillLoad() {
        this.setInvokeIncrementCallback();
        this.reset();
    }
    reset() {
        this.currentlyDisplayedItems = this.initialItems || this.incrementBy;
    }
    showMore() {
        const deltaToMax = this.totalItems - this.currentlyDisplayedItems;
        if (deltaToMax <= 0) {
            return;
        }
        if (deltaToMax > this.incrementBy) {
            this.currentlyDisplayedItems += this.incrementBy;
        }
        else {
            this.currentlyDisplayedItems += deltaToMax;
        }
        this.invokeIncrementCallback(this.currentlyDisplayedItems);
    }
    setInvokeIncrementCallback() {
        this.invokeIncrementCallback = wcHelpers.parseFunction(this.incrementCallback);
    }
    render() {
        return (h("div", null,
            h("span", { class: "count" },
                this.start,
                " \u2013 ",
                this.currentlyDisplayedItems,
                " ",
                this.fromLabel,
                " ",
                this.totalItems),
            h("sdx-button", { onClick: () => this.showMore(), theme: this.buttonTheme }, this.moreLabel)));
    }
    static get is() { return "sdx-show-more"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "buttonTheme": {
            "type": String,
            "attr": "button-theme"
        },
        "currentlyDisplayedItems": {
            "state": true
        },
        "fromLabel": {
            "type": String,
            "attr": "from-label"
        },
        "incrementBy": {
            "type": Number,
            "attr": "increment-by"
        },
        "incrementCallback": {
            "type": String,
            "attr": "increment-callback",
            "watchCallbacks": ["incrementCallbackChanged"]
        },
        "initialItems": {
            "type": Number,
            "attr": "initial-items"
        },
        "moreLabel": {
            "type": String,
            "attr": "more-label"
        },
        "totalItems": {
            "type": Number,
            "attr": "total-items",
            "watchCallbacks": ["totalItemsChanged"]
        }
    }; }
    static get style() { return "/**style-placeholder:sdx-show-more:**/"; }
}
