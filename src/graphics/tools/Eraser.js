import Brush from './Brush.js';

export default class Eraser extends Brush {
    constructor(renderer) {
        super(renderer);
    }

    draw(x, y, toolState) {
        const eraserState = { ...toolState, foregroundColor: toolState.backgroundColor };
        super.draw(x, y, eraserState);
    }
}