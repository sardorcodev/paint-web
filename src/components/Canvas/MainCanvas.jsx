import React, { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './MainCanvas.css';

import Renderer from '../../graphics/core/Renderer.js';
import HistoryManager from '../../graphics/history/HistoryManager.js';
import Brush from '../../graphics/tools/Brush.js';
import Eraser from '../../graphics/tools/Eraser.js';
import LineTool from '../../graphics/tools/LineTool.js';
import RectangleTool from '../../graphics/tools/RectangleTool.js';
import CircleTool from '../../graphics/tools/CircleTool.js';
import FillTool from '../../graphics/tools/FillTool.js';
import { setHistoryStatus } from '../../app/slices/historySlice';

const MainCanvas = () => {
    const containerRef = useRef(null);
    const engineRef = useRef(null);
    const stateRef = useRef({});

    const dispatch = useDispatch();
    const toolState = useSelector((state) => state.tool);
    const { undoTrigger, redoTrigger } = useSelector((state) => state.history);

    useEffect(() => {
        stateRef.current = toolState;
    }, [toolState]);

    // Asosiy sozlash effekti (FAQAT BIR MARTA ISHLAYDI)
    useEffect(() => {
        const container = containerRef.current;
        if (!container || engineRef.current) return;

        const renderer = new Renderer(container);
        renderer.addLayer('background');
        renderer.addLayer('drawing');

        const historyManager = new HistoryManager(renderer, dispatch, { setHistoryStatus });
        const tools = {
            brush: new Brush(renderer),
            eraser: new Eraser(renderer),
            line: new LineTool(renderer),
            rectangle: new RectangleTool(renderer),
            circle: new CircleTool(renderer),
            fill: new FillTool(renderer),
        };
        
        engineRef.current = { renderer, historyManager, tools, activeTool: null };
        
        // Hodisalarni boshqarish
        const handleMouseDown = (e) => engineRef.current.activeTool?.onMouseDown(e, stateRef.current);
        const handleMouseMove = (e) => engineRef.current.activeTool?.onMouseMove(e, stateRef.current);
        const handleMouseLeave = (e) => engineRef.current.activeTool?.onMouseLeave(e, stateRef.current);
        const handleMouseUp = (e) => {
            const tool = engineRef.current.activeTool;
            const history = engineRef.current.historyManager;

            // Fill asbobi uchun alohida mantiq
            if (tool instanceof FillTool) {
                // FillTool o'zining onMouseDown'ida ishni bajarib bo'ldi, endi faqat tarixga saqlaymiz
                history.pushState();
            } else if (tool?.isDrawing) {
                // Qolgan asboblar uchun
                tool.onMouseUp(e, stateRef.current);
                history.pushState();
            }
        };

        container.addEventListener('mousedown', handleMouseDown);
        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseup', handleMouseUp);
        container.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            engineRef.current?.renderer.destroy();
            container.removeEventListener('mousedown', handleMouseDown);
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseup', handleMouseUp);
            container.removeEventListener('mouseleave', handleMouseLeave);
            engineRef.current = null;
        };
    }, [dispatch]); // XATOLIK SABABI BO'LGAN "toolState.activeToolId" BU YERDAN OLIB TASHLANDI

    // Bu effekt FAQAT aktiv asbobni almashtirish uchun ishlaydi
    useEffect(() => {
        if (engineRef.current?.tools) {
            engineRef.current.activeTool = engineRef.current.tools[toolState.activeToolId];
        }
    }, [toolState.activeToolId]);

    // Undo/Redo trigger'lari
    useEffect(() => {
        if (undoTrigger > 0) engineRef.current?.historyManager.undo();
    }, [undoTrigger]);

    useEffect(() => {
        if (redoTrigger > 0) engineRef.current?.historyManager.redo();
    }, [redoTrigger]);

    return <main ref={containerRef} className="canvas-container"></main>;
};

export default MainCanvas;