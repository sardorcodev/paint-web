import BaseTool from './BaseTool.js';

export default class ColorPickerTool extends BaseTool {
    // Bu asbobda chizish holati yo'q, shuning uchun faqat onMouseDown'ni qayta yozamiz
    onMouseDown(event) {
        this.ctx = this.renderer.getActiveContext();
        if (!this.ctx) return null;

        const x = event.offsetX;
        const y = event.offsetY;

        // Bosilgan nuqtadagi 1x1 piksellarning ma'lumotini olamiz
        const pixelData = this.ctx.getImageData(x, y, 1, 1).data;
        
        // RGB qiymatlarini HEX formatiga o'tkazamiz
        const hexColor = this._rgbToHex(pixelData[0], pixelData[1], pixelData[2]);
        
        // Olingan rangni MainCanvas'ga qaytaramiz
        return {
            color: hexColor,
            clickType: event.button === 2 ? 'right' : 'left' // Sichqonchaning qaysi tugmasi bosilganini aniqlaymiz
        };
    }

    _rgbToHex(r, g, b) {
        // Har bir rang komponentini 16 lik sanoq sistemasiga o'tkazib, birlashtiramiz
        const toHex = (c) => ('0' + c.toString(16)).slice(-2);
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
}