const padding = 16;
export class StickerCircle {
    constructor() {
        this.size = 112;
        this.colorClass = "sc-white";
        this.bgColorClass = "orchid";
        this.srHint = "";
    }
    onWindowResizeThrottled() {
        if (this.resizeTimer) {
            clearTimeout(this.resizeTimer);
        }
        this.resizeTimer = setTimeout(() => {
            this.resize();
        }, 10);
    }
    componentDidLoad() {
        this.resize();
    }
    resize() {
        if (this.wrapperEl && this.stickerEl && this.contentWidth) {
            this.stickerEl.style.transform = `scale(${this.wrapperEl.clientWidth / this.contentWidth})`;
        }
    }
    getClasses() {
        return {
            sticker: true,
            [this.colorClass]: true,
            [`bg-${this.bgColorClass}`]: true
        };
    }
    getStyles() {
        const isScalingEnabled = this.contentWidth !== undefined;
        return {
            sticker: {
                width: `${this.size}px`,
                height: `${this.size}px`,
                top: `${this.top}%`,
                bottom: `${this.bottom}%`,
                left: `${this.left}%`,
                right: `${this.right}%`,
                transformOrigin: `${this.top !== undefined ? "top" : "bottom"} ${this.left !== undefined ? "left" : "right"}`
            },
            inner: {
                maxWidth: `${this.size - 2 * padding}px`,
                maxHeight: `${this.size - 2 * padding}px`
            },
            slot: {
                minWidth: `${isScalingEnabled ? 0 : this.size}px`,
                minHeight: `${isScalingEnabled ? 0 : this.size}px`
            }
        };
    }
    render() {
        return [
            h("div", { class: "wrapper", ref: (el) => this.wrapperEl = el },
                h("div", { class: this.getClasses(), style: this.getStyles().sticker, ref: (el) => this.stickerEl = el },
                    h("div", { class: "inner", style: this.getStyles().inner, "aria-hidden": "true" },
                        h("slot", { name: "text" },
                            h("p", null, "TEXT")))),
                h("div", { class: "slot", style: this.getStyles().slot },
                    h("slot", null))),
            h("span", { class: "sr-only" }, this.srHint)
        ];
    }
    static get is() { return "sdx-sticker-circle"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "bgColorClass": {
            "type": String,
            "attr": "bg-color-class"
        },
        "bottom": {
            "type": Number,
            "attr": "bottom"
        },
        "colorClass": {
            "type": String,
            "attr": "color-class"
        },
        "contentWidth": {
            "type": Number,
            "attr": "content-width"
        },
        "left": {
            "type": Number,
            "attr": "left"
        },
        "right": {
            "type": Number,
            "attr": "right"
        },
        "size": {
            "type": Number,
            "attr": "size"
        },
        "srHint": {
            "type": String,
            "attr": "sr-hint"
        },
        "top": {
            "type": Number,
            "attr": "top"
        }
    }; }
    static get listeners() { return [{
            "name": "window:resize",
            "method": "onWindowResizeThrottled",
            "passive": true
        }]; }
    static get style() { return "/**style-placeholder:sdx-sticker-circle:**/"; }
}
