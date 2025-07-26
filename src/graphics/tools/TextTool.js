import BaseTool from './BaseTool.js';

/**
 * Matn kiritish uchun asbob.
 */
export default class TextTool extends BaseTool {
    constructor(renderer) {
        super(renderer);
        this.textarea = null;
        this.state = null; // Joriy holatni saqlab turish uchun
    }

    onMouseDown(event, state) {
        if (this.textarea) {
            this._finalizeText();
        }

        this.ctx = this.renderer.getActiveContext(state.layers.activeLayerId);
        if (!this.ctx) return;

        // Joriy holatni saqlab qo'yamiz
        this.state = state; 
        this._createTextArea(event.offsetX, event.offsetY, state.tool);
    }

    _createTextArea(x, y, toolState) {
        this.textarea = document.createElement('textarea');
        const ta = this.textarea;

        ta.style.position = 'absolute';
        ta.style.left = `${x}px`;
        ta.style.top = `${y}px`;
        ta.style.border = '1px dashed #777';
        ta.style.padding = '2px';
        ta.style.margin = '0';
        ta.style.overflow = 'hidden';
        ta.style.resize = 'none';
        ta.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'; // Orqa fonni biroz ko'rinadigan qilamiz
        ta.style.outline = 'none';
        ta.style.whiteSpace = 'pre';
        
        // --- XATOLIK TO'G'RILANDI ---
        // Endi to'g'ridan-to'g'ri toolState'dan foydalanamiz
        ta.style.fontFamily = toolState.fontFamily;
        ta.style.fontSize = `${toolState.fontSize}px`;
        ta.style.color = toolState.foregroundColor;
        ta.style.lineHeight = `${toolState.fontSize * 1.2}px`;

        ta.addEventListener('input', this._handleInput.bind(this));
        ta.addEventListener('blur', this._finalizeText.bind(this));
        ta.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this._finalizeText();
            }
        });

        this.renderer.container.appendChild(ta);
        ta.focus();
    }
    
    _handleInput() {
        if (!this.textarea) return;
        this.textarea.style.width = 'auto';
        this.textarea.style.height = 'auto';
        this.textarea.style.width = `${this.textarea.scrollWidth}px`;
        this.textarea.style.height = `${this.textarea.scrollHeight}px`;
    }

    _finalizeText() {
        if (!this.textarea) return;
        const text = this.textarea.value;

        if (text.trim() !== '') {
            const { fontSize, fontFamily, foregroundColor } = this.state.tool;
            const x = parseInt(this.textarea.style.left, 10);
            const y = parseInt(this.textarea.style.top, 10);
            const lineHeight = fontSize * 1.2;

            this.ctx.font = `${fontSize}px ${fontFamily}`;
            this.ctx.fillStyle = foregroundColor;
            
            const lines = text.split('\n');
            lines.forEach((line, index) => {
                this.ctx.fillText(line, x + 2, y + (index * lineHeight) + fontSize);
            });

            this.historyManager.pushState();
        }
        
        this._cleanupTextArea();
    }

    _cleanupTextArea() {
        if (this.textarea) {
            this.textarea.remove();
            this.textarea = null;
            this.state = null;
        }
    }
}