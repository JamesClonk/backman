import '../../../../../stencil.core';
import { ArrowDirection, ArrowPosition } from "../../../types";
export declare class Arrow {
    /**
     * @private
     */
    direction: ArrowDirection;
    /**
     * @private
     */
    hover: boolean;
    /**
     * @private
     */
    arrowPosition: ArrowPosition;
    render(): JSX.Element;
}
