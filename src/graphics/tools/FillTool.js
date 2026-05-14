import BaseTool from './BaseTool.js';

export default class FillTool extends BaseTool {
    static MAX_PROCESSED_PIXELS = 4_000_000;

    onMouseDown(event, toolState) {
        this.ctx = this.renderer.getActiveContext();
        if (!this.ctx) return false;

        const width = this.renderer.width;
        const height = this.renderer.height;
        const startX = Math.floor(event.offsetX);
        const startY = Math.floor(event.offsetY);

        if (!this._isInsideCanvas(startX, startY, width, height)) return false;

        const replacementColor = this._hexToRgba(toolState.foregroundColor);
        const imageData = this.ctx.getImageData(0, 0, width, height);
        const targetPixelIndex = this._getPixelIndex(startX, startY, width);
        const targetColor = this._getPixelColor(imageData.data, targetPixelIndex);

        if (this._colorsMatch(targetColor, replacementColor)) return false;

        const result = this._scanlineFloodFill(
            imageData,
            startX,
            startY,
            targetColor,
            replacementColor
        );

        if (!result.changed || result.aborted) return false;

        this.ctx.putImageData(imageData, 0, 0);
        return true;
    }

    _scanlineFloodFill(imageData, startX, startY, targetColor, replacementColor) {
        const width = imageData.width;
        const height = imageData.height;
        const data = imageData.data;
        const totalPixels = width * height;
        const maxProcessedPixels = Math.min(totalPixels, FillTool.MAX_PROCESSED_PIXELS);
        const visited = new Uint8Array(totalPixels);
        const stack = [startX, startY];
        let processedPixels = 0;
        let changed = false;

        while (stack.length > 0) {
            const y = stack.pop();
            const x = stack.pop();

            if (!this._isInsideCanvas(x, y, width, height)) continue;

            const seedIndex = this._getPixelIndex(x, y, width);
            if (visited[seedIndex] || !this._pixelMatches(data, seedIndex, targetColor)) {
                continue;
            }

            let left = x;
            while (left > 0) {
                const nextIndex = this._getPixelIndex(left - 1, y, width);
                if (visited[nextIndex] || !this._pixelMatches(data, nextIndex, targetColor)) break;
                left -= 1;
            }

            let spanUp = false;
            let spanDown = false;

            for (let currentX = left; currentX < width; currentX += 1) {
                const pixelIndex = this._getPixelIndex(currentX, y, width);
                if (visited[pixelIndex] || !this._pixelMatches(data, pixelIndex, targetColor)) break;

                visited[pixelIndex] = 1;
                processedPixels += 1;

                if (processedPixels > maxProcessedPixels) {
                    console.warn('Fill aborted: processed pixel safety cap reached.');
                    return { changed: false, aborted: true };
                }

                this._setPixel(data, pixelIndex, replacementColor);
                changed = true;

                if (y > 0) {
                    const upIndex = this._getPixelIndex(currentX, y - 1, width);
                    const shouldQueueUp = !visited[upIndex] && this._pixelMatches(data, upIndex, targetColor);
                    if (shouldQueueUp && !spanUp) {
                        stack.push(currentX, y - 1);
                        spanUp = true;
                    } else if (!shouldQueueUp) {
                        spanUp = false;
                    }
                }

                if (y < height - 1) {
                    const downIndex = this._getPixelIndex(currentX, y + 1, width);
                    const shouldQueueDown = !visited[downIndex] && this._pixelMatches(data, downIndex, targetColor);
                    if (shouldQueueDown && !spanDown) {
                        stack.push(currentX, y + 1);
                        spanDown = true;
                    } else if (!shouldQueueDown) {
                        spanDown = false;
                    }
                }
            }
        }

        return { changed, aborted: false };
    }

    _isInsideCanvas(x, y, width, height) {
        return Number.isInteger(x) && Number.isInteger(y) && x >= 0 && x < width && y >= 0 && y < height;
    }

    _getPixelIndex(x, y, width) {
        return y * width + x;
    }

    _getPixelColor(data, pixelIndex) {
        const dataIndex = pixelIndex * 4;
        return [data[dataIndex], data[dataIndex + 1], data[dataIndex + 2], data[dataIndex + 3]];
    }

    _pixelMatches(data, pixelIndex, color) {
        const dataIndex = pixelIndex * 4;
        return (
            data[dataIndex] === color[0] &&
            data[dataIndex + 1] === color[1] &&
            data[dataIndex + 2] === color[2] &&
            data[dataIndex + 3] === color[3]
        );
    }

    _setPixel(data, pixelIndex, color) {
        const dataIndex = pixelIndex * 4;
        data[dataIndex] = color[0];
        data[dataIndex + 1] = color[1];
        data[dataIndex + 2] = color[2];
        data[dataIndex + 3] = color[3];
    }

    _colorsMatch(c1, c2) {
        return c1[0] === c2[0] && c1[1] === c2[1] && c1[2] === c2[2] && c1[3] === c2[3];
    }

    _hexToRgba(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b, 255];
    }
}
