import anime from "animejs";
export class Icon {
    constructor() {
        this.animationDuration = 200;
        this.easing = {
            inQuadOutQuint: [0.550, 0.085, 0.320, 1]
        };
        this.iconName = "";
        this.colorClass = "";
        this.size = 1;
        this.flip = "none";
        this.hidden = false;
        this.srHint = "";
    }
    hiddenChanged() {
        anime({
            targets: this.iconEl,
            opacity: this.hidden ? 0 : 1,
            scaleX: this.hidden ? 0 : this.getFlipTransformStyle("x"),
            scaleY: this.hidden ? 0 : this.getFlipTransformStyle("y"),
            duration: this.animationDuration,
            easing: this.easing.inQuadOutQuint,
            begin: () => {
                this.iconEl.style.display = "inline-block";
            },
            complete: () => {
                this.iconEl.style.display = this.hidden ? "none" : "inline-block";
            }
        });
    }
    componentDidLoad() {
        this.setInitialStyles();
    }
    setInitialStyles() {
        if (this.hidden) {
            this.iconEl.style.opacity = "0";
            this.iconEl.style.transform = `scaleX(0) scaleY(0)`;
            this.iconEl.style.display = "none";
        }
        else {
            this.iconEl.style.opacity = "1";
            this.iconEl.style.transform = `scaleX(${this.getFlipTransformStyle("x")}) scaleY(${this.getFlipTransformStyle("y")})`;
            this.iconEl.style.display = "inline-block";
        }
    }
    getFlipTransformStyle(axis) {
        const map = {
            none: {
                x: 1,
                y: 1
            },
            horizontal: {
                x: -1,
                y: 1
            },
            vertical: {
                x: 1,
                y: -1
            },
            both: {
                x: -1,
                y: -1
            }
        };
        return map[this.flip][axis];
    }
    getClassNames() {
        return {
            icon: true,
            [this.iconName]: true,
            [this.colorClass]: true,
            [`s${this.size}`]: true
        };
    }
    render() {
        return [
            h("span", { ref: (el) => this.iconEl = el, class: this.getClassNames(), "aria-hidden": "true" }),
            h("span", { class: "sr-only" }, this.srHint)
        ];
    }
    static get is() { return "sdx-icon"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "colorClass": {
            "type": String,
            "attr": "color-class"
        },
        "flip": {
            "type": String,
            "attr": "flip"
        },
        "hidden": {
            "type": Boolean,
            "attr": "hidden",
            "watchCallbacks": ["hiddenChanged"]
        },
        "iconName": {
            "type": String,
            "attr": "icon-name"
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
    static get style() { return "/**style-placeholder:sdx-icon:**/"; }
}
