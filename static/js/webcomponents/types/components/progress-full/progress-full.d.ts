import '../../stencil.core';
export declare class ProgressFull {
    private lastSentActiveStep;
    private initIndex;
    private stepEls;
    private leftArrowEl;
    private rightArrowEl;
    private resizeTimer?;
    private stepsCount;
    private allowedVisibleSteps;
    private minVisible;
    private maxVisible;
    private minPossibleBars;
    private invokeStepChangeCallback;
    el: HTMLSdxProgressFullElement;
    /**
     * Current active step of the progress bar.
     */
    activeStep: number;
    /**
     * Current active step of the progress bar.
     */
    previousActiveStep?: number;
    /**
     * Current active step of the progress bar.
     */
    step: number;
    /**
     * Label used next to total amount of steps when not all steps are being displayed.
     */
    stepsLabel: string;
    /**
     * @private
     * Disable animations for testing.
     */
    animated: boolean;
    /**
     * Triggered when the active step was changed.
     */
    stepChangeCallback: ((activeStep: number, previousActiveStep?: number) => void) | string | undefined;
    stepChanged(): void;
    stepChangeCallbackChanged(): void;
    componentWillLoad(): void;
    componentDidLoad(): void;
    /**
     * Listen to window resize, so steps can be redrawn based on the width.
     */
    onWindowResizeThrottled(): void;
    /**
     * Fired by the MutationObserver whenever children change.
     */
    onSlotChange(): void;
    /**
     * Move to next step if its available.
     */
    nextStep(): void;
    /**
     * Move to previous step if its available.
     */
    previousStep(): void;
    /**
     * Get the current active step.
     */
    getActiveStep(): number;
    /**
     * Set a step as active based on an index.
     * @param index Index of the new active step.
     * @param animation Allow animations when moving between steps.
     */
    setActiveStep(index: number, animation: boolean): void;
    /**
     * Scroll the visible steps one step to the left.
     * This does not change the activeStep.
     */
    private scrollLeft;
    /**
     * Scroll the visible steps one step to the right.
     * This does not change the activeStep.
     */
    private scrollRight;
    /**
     * Traverse through child components, keep references and pass props to them.
     */
    private setChildElementsReferences;
    /**
     * Set on step element the functionality to change step. For example when user clicks a completed button
     */
    private setEventsOnSteps;
    /**
     * Calculates steps, that should be displayed to the user based on the width of the parent element.
     */
    private calculateVisibleSteps;
    private shiftVisibleStepLeft;
    private shiftVisibleStepRight;
    /**
     * Updates attributes and classes of the step element, which controls what step will be displayed / hidden.
     * @param animation Animate the state change transition.
     */
    private updateStepElements;
    private updateArrows;
    private shouldDisplayArrows;
    private shouldDisplayRightArrow;
    private shouldDisplayLeftArrow;
    private updateStepElement;
    private handleInSightElement;
    private handleOutofSightElement;
    private showElement;
    private fadeInElement;
    private hideElement;
    private fadeOutElement;
    private shouldAnimateElementFadeIn;
    private shouldAnimateElementFadeOut;
    private setStepElementAttributes;
    private getStepStatus;
    private isRightOutOfSight;
    private isLeftOutOfSight;
    /**
     * Updates steps label to be visible.
     */
    private updateInfoElement;
    /**
     * Based on the position and ammount of visible steps a css class name is recalculuated for the step.
     * @param index Position of the step.
     */
    private recalculateStepPosition;
    /**
     * Adjusts the index when we convert from element index to step index
     * @param index Index, that will be updated to reflect true position.
     */
    private indexUpdate;
    /**
     * Retrieves width of every step based on the parent element width.
     */
    private getCorrectWidth;
    /**
     * Calculates the width of the arrow (click-able area of the arrow)
     * The width covers the line for the gradient effect.
     */
    private getArrowWidth;
    /**
     * Calls a function, that is attached to the onSelectChange function when active step has changed.
     */
    private informActiveStepChanged;
    private setPreviousStep;
    private setInvokeStepChangeCallback;
    render(): JSX.Element[];
}
