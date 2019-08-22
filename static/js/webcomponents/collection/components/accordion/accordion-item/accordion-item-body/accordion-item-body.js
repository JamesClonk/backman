import anime from "animejs";
const CLASS_OPEN = "open";
const ANIMATION_OPEN = 300;
const ANIMATION_DELAY_OPEN = 50;
const ANIMATION_VISIBLE = 150;
export class Body {
    constructor() {
        this.initialLoad = true;
        this.easing = {
            inQuadOutQuint: [0.550, 0.085, 0.320, 1]
        };
        this.arrowPosition = "none";
    }
    toggle(isOpen) {
        if (this.initialLoad) {
            this.initiateOpenState(isOpen);
        }
        else if (isOpen) {
            this.openCollapseSection();
        }
        else {
            this.closeCollapseSection();
        }
    }
    initiateOpenState(newState) {
        if (newState) {
            this.el.classList.add(CLASS_OPEN);
        }
        this.initialLoad = false;
    }
    openCollapseSection() {
        this.stopAnimations();
        this.el.style.display = "block";
        this.animation = anime.timeline()
            .add({
            targets: this.el,
            duration: ANIMATION_OPEN,
            height: this.el.scrollHeight + "px",
            easing: this.easing.inQuadOutQuint,
            complete: () => {
                this.el.style.height = "auto";
                this.el.setAttribute("aria-expanded", "true");
                this.el.classList.add(CLASS_OPEN);
            }
        })
            .add({
            targets: this.el,
            duration: ANIMATION_VISIBLE,
            opacity: 1,
            easing: "linear",
            offset: ANIMATION_DELAY_OPEN
        });
    }
    closeCollapseSection() {
        this.stopAnimations();
        this.animation = anime.timeline()
            .add({
            targets: this.el,
            duration: ANIMATION_OPEN,
            height: "0px",
            easing: this.easing.inQuadOutQuint,
            complete: () => {
                this.el.style.display = "none";
                this.el.setAttribute("aria-expanded", "false");
                this.el.classList.remove(CLASS_OPEN);
            }
        })
            .add({
            targets: this.el,
            duration: ANIMATION_VISIBLE,
            opacity: 0,
            easing: "linear",
            offset: 0
        });
    }
    stopAnimations() {
        if (this.animation) {
            this.animation.pause();
        }
        anime.remove(this.el);
    }
    render() {
        return (h("slot", null));
    }
    static get is() { return "sdx-accordion-item-body"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "arrowPosition": {
            "type": String,
            "attr": "arrow-position"
        },
        "el": {
            "elementRef": true
        },
        "toggle": {
            "method": true
        }
    }; }
    static get style() { return "/**style-placeholder:sdx-accordion-item-body:**/"; }
}
