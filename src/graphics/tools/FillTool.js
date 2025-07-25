import BaseTool from './BaseTool.js';

export default class FillTool extends BaseTool {
    onMouseDown(event, toolState) {
        // Bu asbob `isDrawing` holatini ishlatmaydi, chunki u bir lahzada ishlaydi
        this.ctx = this.renderer.getActiveContext();
        if (!this.ctx) return;

        const startX = event.offsetX;
        const startY = event.offsetY;
        const fillColor = this._hexToRgba(toolState.foregroundColor);

        const imageData = this.ctx.getImageData(0, 0, this.renderer.width, this.renderer.height);
        const targetColor = this._getPixelColor(imageData, startX, startY);

        if (this._colorMatch(targetColor, fillColor)) return;

        this._floodFill(imageData, startX, startY, targetColor, fillColor);

        this.ctx.putImageData(imageData, 0, 0);

        // BU YERDAN historyManager.pushState() OLIB TASHLANDI.
        // Bu qarorni endi MainCanvas qabul qiladi.
    }

    // Qolgan metodlar o'zgarishsiz qoladi...
    _floodFill(imageData, startX, startY, targetColor, fillColor) {
        const width = imageData.width;
        const height = imageData.height;
        const pixelStack = [[startX, startY]];

        while (pixelStack.length) {
            const [x, y] = pixelStack.pop();
            if (x < 0 || x >= width || y < 0 || y >= height) continue;
            const currentColor = this._getPixelColor(imageData, x, y);
            if (this._colorMatch(currentColor, targetColor)) {
                this._setPixelColor(imageData, x, y, fillColor);
                pixelStack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
            }
        }
    }

    _getPixelColor(imageData, x, y) {
        const index = (y * imageData.width + x) * 4;
        return [ imageData.data[index], imageData.data[index + 1], imageData.data[index + 2], imageData.data[index + 3] ];
    }

    _setPixelColor(imageData, x, y, color) {
        const index = (y * imageData.width + x) * 4;
        imageData.data[index] = color[0];
        imageData.data[index + 1] = color[1];
        imageData.data[index + 2] = color[2];
        imageData.data[index + 3] = color[3];
    }

    _colorMatch(c1, c2) {
        return c1[0] === c2[0] && c1[1] === c2[1] && c1[2] === c2[2] && c1[3] === c2[3];
    }

    _hexToRgba(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b, 255];
    }
}