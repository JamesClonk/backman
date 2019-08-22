import anime from "animejs";
import * as wcHelpers from "../../core/helpers/webcomponent-helpers";
const OPEN_CLASSNAME = "open";
const CLOSE_CLASSNAME = "hide-content";
const ARROW_HIDDEN_CLASSNAME = "arrow--hidden";
const HIDE_ARROWS_CLASSNAME = "hide-arrows";
const STEP_CHANGE_ANIMATION = 400;
export class ProgressFull {
    constructor() {
        this.lastSentActiveStep = -1;
        this.initIndex = 1;
        this.stepsCount = 0;
        this.allowedVisibleSteps = 1;
        this.minVisible = 0;
        this.maxVisible = 0;
        this.minPossibleBars = 3;
        this.invokeStepChangeCallback = () => null;
        this.activeStep = -1;
        this.previousActiveStep = undefined;
        this.step = 1;
        this.stepsLabel = "";
        this.animated = true;
    }
    stepChanged() {
        this.setActiveStep(this.step, this.animated);
    }
    stepChangeCallbackChanged() {
        this.setInvokeStepChangeCallback();
    }
    componentWillLoad() {
        this.setInvokeStepChangeCallback();
        if (this.activeStep < 0) {
            this.activeStep = this.activeStep && this.activeStep !== -1 ? this.activeStep : this.step;
        }
    }
    componentDidLoad() {
        this.setChildElementsReferences();
        this.setEventsOnSteps();
        this.setActiveStep(this.activeStep, this.animated);
        wcHelpers.installSlotObserver(this.el, () => this.onSlotChange());
    }
    onWindowResizeThrottled() {
        if (this.resizeTimer) {
            clearTimeout(this.resizeTimer);
        }
        this.resizeTimer = setTimeout(() => {
            this.setActiveStep(this.activeStep, false);
        }, 10);
    }
    onSlotChange() {
        this.setChildElementsReferences();
        this.setEventsOnSteps();
    }
    nextStep() {
        if (this.stepEls) {
            if (this.activeStep < this.stepsCount) {
                this.setActiveStep(++this.activeStep, this.animated);
            }
        }
    }
    previousStep() {
        if (this.stepEls) {
            if (this.activeStep > this.indexUpdate(0)) {
                this.setActiveStep(--this.activeStep, this.animated);
            }
        }
    }
    getActiveStep() {
        return this.activeStep;
    }
    setActiveStep(index, animation) {
        if (!this.stepEls) {
            return;
        }
        if (isNaN(index) || index < 1) {
            this.activeStep = this.initIndex;
        }
        else if (index > this.stepsCount) {
            this.activeStep = this.stepsCount + this.initIndex - 1;
        }
        else {
            this.activeStep = index;
        }
        this.calculateVisibleSteps();
        this.updateStepElements(animation);
        this.setPreviousStep(this.activeStep);
    }
    scrollLeft() {
        if (!this.stepEls || !this.shouldDisplayLeftArrow()) {
            return;
        }
        this.shiftVisibleStepLeft();
        this.updateStepElements(this.animated);
    }
    scrollRight() {
        if (!this.stepEls || !this.shouldDisplayRightArrow()) {
            return;
        }
        this.shiftVisibleStepRight();
        this.updateStepElements(this.animated);
    }
    setChildElementsReferences() {
        this.stepEls = this.el.querySelectorAll("sdx-progress-full-step");
        if (this.stepEls) {
            this.stepsCount = this.stepEls.length;
        }
        if (!this.el.shadowRoot) {
            return;
        }
        const leftArrowEls = this.el.shadowRoot.querySelectorAll(".left-arrow");
        if (leftArrowEls && leftArrowEls.length > 0) {
            this.leftArrowEl = leftArrowEls[0];
        }
        const rightArrowEls = this.el.shadowRoot.querySelectorAll(".right-arrow");
        if (rightArrowEls && rightArrowEls.length > 0) {
            this.rightArrowEl = rightArrowEls[0];
        }
    }
    setEventsOnSteps() {
        for (let i = 0; i < this.stepsCount; i++) {
            this.stepEls[i].stepClickCallback = this.setActiveStep.bind(this, this.indexUpdate(i), this.animated);
        }
    }
    calculateVisibleSteps() {
        this.allowedVisibleSteps = Math.floor(this.el.offsetWidth / 100);
        if (this.stepsCount <= this.minPossibleBars) {
            this.allowedVisibleSteps = this.stepsCount;
        }
        else if (this.allowedVisibleSteps < this.minPossibleBars) {
            this.allowedVisibleSteps = this.minPossibleBars;
        }
        else if (this.stepsCount < this.allowedVisibleSteps) {
            this.allowedVisibleSteps = this.stepsCount;
        }
        if (this.activeStep < this.allowedVisibleSteps) {
            this.minVisible = 1;
            this.maxVisible = this.allowedVisibleSteps;
        }
        else if (this.activeStep < this.stepsCount - 1) {
            this.minVisible = this.activeStep - this.allowedVisibleSteps + 2;
            this.maxVisible = this.activeStep + 1;
        }
        else {
            this.minVisible = this.stepsCount - this.allowedVisibleSteps + 1;
            this.maxVisible = this.stepsCount;
        }
    }
    shiftVisibleStepLeft() {
        if (this.minVisible > 1) {
            this.minVisible--;
            this.maxVisible--;
        }
    }
    shiftVisibleStepRight() {
        if (this.maxVisible < this.stepsCount) {
            this.minVisible++;
            this.maxVisible++;
        }
    }
    updateStepElements(animation) {
        if (!this.stepEls) {
            return;
        }
        this.updateInfoElement();
        this.updateArrows();
        for (let i = 0; i < this.stepsCount; i++) {
            this.updateStepElement(i, animation);
        }
        this.informActiveStepChanged();
    }
    updateArrows() {
        if (!this.leftArrowEl || !this.rightArrowEl) {
            return;
        }
        const arrowWidth = this.getArrowWidth();
        this.leftArrowEl.style.width = arrowWidth;
        this.rightArrowEl.style.width = arrowWidth;
        if (this.shouldDisplayLeftArrow()) {
            this.leftArrowEl.classList.remove(ARROW_HIDDEN_CLASSNAME);
        }
        else {
            this.leftArrowEl.classList.add(ARROW_HIDDEN_CLASSNAME);
        }
        if (this.shouldDisplayRightArrow()) {
            this.rightArrowEl.classList.remove(ARROW_HIDDEN_CLASSNAME);
        }
        else {
            this.rightArrowEl.classList.add(ARROW_HIDDEN_CLASSNAME);
        }
        if (this.shouldDisplayArrows()) {
            this.el.classList.remove(HIDE_ARROWS_CLASSNAME);
        }
        else {
            this.el.classList.add(HIDE_ARROWS_CLASSNAME);
        }
    }
    shouldDisplayArrows() {
        return this.allowedVisibleSteps !== this.stepsCount;
    }
    shouldDisplayRightArrow() {
        return this.maxVisible < this.stepsCount && this.activeStep >= this.maxVisible;
    }
    shouldDisplayLeftArrow() {
        return this.minVisible > 1;
    }
    updateStepElement(elIndex, animation) {
        const stepIndex = this.indexUpdate(elIndex);
        this.setStepElementAttributes(elIndex, stepIndex);
        anime.remove(this.stepEls[elIndex]);
        if (this.isLeftOutOfSight(stepIndex) || this.isRightOutOfSight(stepIndex)) {
            this.handleOutofSightElement(animation, elIndex, stepIndex);
        }
        else {
            this.handleInSightElement(animation, elIndex);
        }
    }
    handleInSightElement(animation, elIndex) {
        const stepElement = this.stepEls[elIndex];
        stepElement.style.display = "inline-block";
        stepElement.style.width = this.getCorrectWidth();
        if (this.shouldAnimateElementFadeIn(animation, elIndex)) {
            this.fadeInElement(elIndex);
        }
        else {
            this.showElement(elIndex);
        }
    }
    handleOutofSightElement(animation, elIndex, stepIndex) {
        const marginOutOfSight = "-" + this.getCorrectWidth();
        if (this.shouldAnimateElementFadeOut(animation, elIndex)) {
            this.fadeOutElement(elIndex, stepIndex, marginOutOfSight);
        }
        else {
            this.hideElement(elIndex, stepIndex, marginOutOfSight);
        }
    }
    showElement(elIndex) {
        const stepElement = this.stepEls[elIndex];
        stepElement.style.marginLeft = "0";
        stepElement.style.marginRight = "0";
        stepElement.style.opacity = null;
        stepElement.classList.add(OPEN_CLASSNAME);
        stepElement.classList.remove(CLOSE_CLASSNAME);
    }
    fadeInElement(elIndex) {
        const stepElement = this.stepEls[elIndex];
        anime({
            targets: stepElement,
            duration: STEP_CHANGE_ANIMATION,
            marginLeft: "0",
            marginRight: "0",
            opacity: 1,
            easing: "easeOutQuad",
            complete: () => {
                stepElement.classList.add(OPEN_CLASSNAME);
                stepElement.classList.remove(CLOSE_CLASSNAME);
            }
        });
    }
    hideElement(elIndex, stepIndex, marginOutOfSight) {
        const stepElement = this.stepEls[elIndex];
        stepElement.style.display = "none";
        stepElement.style.marginLeft = this.isLeftOutOfSight(stepIndex) ? marginOutOfSight : "0";
        stepElement.style.marginRight = this.isRightOutOfSight(stepIndex) ? marginOutOfSight : "0";
        stepElement.classList.add(CLOSE_CLASSNAME);
        stepElement.classList.remove(OPEN_CLASSNAME);
    }
    fadeOutElement(elIndex, stepIndex, marginOutOfSight) {
        const stepElement = this.stepEls[elIndex];
        anime({
            targets: stepElement,
            duration: STEP_CHANGE_ANIMATION,
            marginLeft: this.isLeftOutOfSight(stepIndex) ? marginOutOfSight : "0",
            marginRight: this.isRightOutOfSight(stepIndex) ? marginOutOfSight : "0",
            opacity: 0,
            easing: "easeOutQuad",
            complete: () => {
                stepElement.style.display = "none";
                stepElement.classList.add(CLOSE_CLASSNAME);
                stepElement.classList.remove(OPEN_CLASSNAME);
            }
        });
    }
    shouldAnimateElementFadeIn(animation, elIndex) {
        return animation && this.stepEls[elIndex].classList.contains(CLOSE_CLASSNAME);
    }
    shouldAnimateElementFadeOut(animation, elIndex) {
        return animation && this.stepEls[elIndex].classList.contains(OPEN_CLASSNAME);
    }
    setStepElementAttributes(elIndex, stepIndex) {
        const stepElement = this.stepEls[elIndex];
        stepElement.setAttribute("status", this.getStepStatus(stepIndex));
        stepElement.setAttribute("value", stepIndex.toString());
        stepElement.setAttribute("total", (this.allowedVisibleSteps).toString());
        stepElement.setAttribute("position", this.recalculateStepPosition(stepIndex));
    }
    getStepStatus(index) {
        if (index > this.activeStep) {
            return "none";
        }
        else if (index === this.activeStep) {
            return "active";
        }
        return "completed";
    }
    isRightOutOfSight(index) {
        return index > this.maxVisible;
    }
    isLeftOutOfSight(index) {
        return index < this.minVisible;
    }
    updateInfoElement() {
        if (this.allowedVisibleSteps !== this.stepsCount && this.stepsLabel) {
            this.el.classList.remove("hide-steps-label");
        }
        else {
            this.el.classList.add("hide-steps-label");
        }
    }
    recalculateStepPosition(index) {
        if (index === 1) {
            return "first";
        }
        else if (index === this.stepsCount) {
            return "last";
        }
        else if (index === this.minVisible) {
            return "middle-left";
        }
        else if (index === this.maxVisible) {
            return "middle-right";
        }
        else if (index > 1 && index < this.stepsCount) {
            return "middle";
        }
        return "none";
    }
    indexUpdate(index) {
        return index + this.initIndex;
    }
    getCorrectWidth() {
        return this.el.clientWidth / this.allowedVisibleSteps + "px";
    }
    getArrowWidth() {
        const width = Math.floor(100 / this.allowedVisibleSteps) + 100 % this.allowedVisibleSteps - 1;
        return `calc((${width}% - 24px) / 2)`;
    }
    informActiveStepChanged() {
        if (this.lastSentActiveStep !== this.activeStep) {
            this.lastSentActiveStep = this.activeStep;
            this.invokeStepChangeCallback(this.activeStep, this.previousActiveStep);
        }
    }
    setPreviousStep(previousStep) {
        this.previousActiveStep = previousStep;
    }
    setInvokeStepChangeCallback() {
        this.invokeStepChangeCallback = wcHelpers.parseFunction(this.stepChangeCallback);
    }
    render() {
        return [
            h("div", { class: "info-content" },
                this.stepsCount,
                " ",
                this.stepsLabel),
            h("slot", null),
            h("div", { class: "left-arrow", onClick: () => this.scrollLeft() },
                h("div", { class: "arrow" })),
            h("div", { class: "right-arrow", onClick: () => this.scrollRight() },
                h("div", { class: "arrow" }))
        ];
    }
    static get is() { return "sdx-progress-full"; }
    static get encapsulation() { return "shadow"; }
    static get properties() { return {
        "activeStep": {
            "state": true
        },
        "animated": {
            "type": Boolean,
            "attr": "animated"
        },
        "el": {
            "elementRef": true
        },
        "getActiveStep": {
            "method": true
        },
        "nextStep": {
            "method": true
        },
        "previousActiveStep": {
            "state": true
        },
        "previousStep": {
            "method": true
        },
        "setActiveStep": {
            "method": true
        },
        "step": {
            "type": Number,
            "attr": "step",
            "watchCallbacks": ["stepChanged"]
        },
        "stepChangeCallback": {
            "type": String,
            "attr": "step-change-callback",
            "watchCallbacks": ["stepChangeCallbackChanged"]
        },
        "stepsLabel": {
            "type": String,
            "attr": "steps-label",
            "watchCallbacks": ["stepChanged"]
        }
    }; }
    static get listeners() { return [{
            "name": "window:resize",
            "method": "onWindowResizeThrottled",
            "passive": true
        }]; }
    static get style() { return "/**style-placeholder:sdx-progress-full:**/"; }
}
