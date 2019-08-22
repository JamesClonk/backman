import '../../../stencil.core';
import { Status, StepPosition } from "../types";
export declare class ProgressFullStep {
    private invokeStepClickCallback;
    el: HTMLSdxProgressFullStepElement;
    /**
     * @Private
     */
    value: number;
    /**
     * @Private
     */
    status: Status;
    /**
     * @Private
     */
    position: StepPosition;
    /**
     * Triggered when a user clicks on the button or description of a completed step.
     */
    stepClickCallback: (() => void) | string | undefined;
    stepClickCallbackChanged(): void;
    componentWillLoad(): void;
    /**
     * Trigger click event when completed.
     */
    private clicked;
    private setInvokeStepClickCallback;
    render(): JSX.Element;
}
