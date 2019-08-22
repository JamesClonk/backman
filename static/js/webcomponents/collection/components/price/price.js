export class Price {
    constructor() {
        this.amount = 0;
        this.period = "";
        this.size = 2;
        this.srHint = "";
    }
    getFormattedAmount() {
        return String(Math.round(this.amount * 100))
            .replace(/^0$/, "000")
            .replace(/^(.)$/, "0$1")
            .replace(/(..)$/, ".$1")
            .replace(/00$|^(?=[.])/, "–");
    }
    isInteger() {
        return this.amount === Math.floor(this.amount);
    }
    getClassNames() {
        return {
            integer: this.isInteger(),
            [`text-${this.size > 6 ? "d" : "h"}${(this.size > 6 ? 9 : 6) - this.size + 1}`]: true
        };
    }
    render() {
        return [
            h("span", { class: this.getClassNames(), "aria-hidden": "true" },
                this.getFormattedAmount(),
                h("span", { class: "period" }, this.period)),
            h("span", { class: "sr-only" }, this.srHint)
        ];
    }
    static get is() { return "sdx-price"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "amount": {
            "type": Number,
            "attr": "amount"
        },
        "period": {
            "type": String,
            "attr": "period"
        },
        "size": {
            "type": Number,
            "attr": "size"
        },
        "srHint": {
            "type": String,
            "attr": "sr-hint"
        }
    }; }
    static get style() { return "/**style-placeholder:sdx-price:**/"; }
}
