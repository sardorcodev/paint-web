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
import ColorPickerTool from '../../graphics/tools/ColorPickerTool.js';
import { setForegroundColor, setBackgroundColor, setActiveTool } from '../../app/slices/toolSlice';
import { setHistoryStatus } from '../../app/slices/historySlice';
import { setCursorPos, setCanvasSize } from '../../app/slices/uiSlice';

const MainCanvas = () => {
    const containerRef = useRef(null);
    const engineRef = useRef(null);
    const stateRef = useRef({});

    const dispatch = useDispatch();
    const toolState = useSelector((state) => state.tool);
    const { undoTrigger, redoTrigger } = useSelector((state) => state.history);
    // 1. Yangi "saqlash" triggerini Redux'dan olamiz
    const { saveTrigger } = useSelector((state) => state.ui);

    useEffect(() => {
        stateRef.current = toolState;
    }, [toolState]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || engineRef.current) return;

        const renderer = new Renderer(container, dispatch, { setCanvasSize });
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
            color_picker: new ColorPickerTool(renderer),
        };
        
        engineRef.current = { renderer, historyManager, tools, activeTool: null };
        
        const handleMouseDown = (e) => {
            const tool = engineRef.current.activeTool;
            if (!tool) return;
            if (tool instanceof ColorPickerTool) {
                const result = tool.onMouseDown(e);
                if (result) {
                    if (result.clickType === 'right') {
                        e.preventDefault(); 
                        dispatch(setBackgroundColor(result.color));
                    } else {
                        dispatch(setForegroundColor(result.color));
                    }
                    dispatch(setActiveTool('brush'));
                }
            } else {
                tool.onMouseDown(e, stateRef.current);
            }
        };

        const handleMouseMove = (e) => {
            dispatch(setCursorPos({ x: e.offsetX, y: e.offsetY }));
            engineRef.current.activeTool?.onMouseMove(e, stateRef.current);
        };
        const handleMouseLeave = (e) => {
            dispatch(setCursorPos({ x: null, y: null }));
            engineRef.current.activeTool?.onMouseLeave(e, stateRef.current);
        };
        const handleMouseUp = (e) => {
            const tool = engineRef.current.activeTool;
            const history = engineRef.current.historyManager;
            if (tool instanceof FillTool) {
                history.pushState();
            } else if (tool?.isDrawing) {
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
    }, [dispatch]);

    useEffect(() => {
        if (engineRef.current?.tools) {
            engineRef.current.activeTool = engineRef.current.tools[toolState.activeToolId];
        }
    }, [toolState.activeToolId]);

    useEffect(() => {
        if (undoTrigger > 0) engineRef.current?.historyManager.undo();
    }, [undoTrigger]);

    useEffect(() => {
        if (redoTrigger > 0) engineRef.current?.historyManager.redo();
    }, [redoTrigger]);

    // 2. Saqlash triggerini kuzatuvchi yangi useEffect
    useEffect(() => {
        // trigger 0 dan katta bo'lgandagina ishga tushadi (dastlabki renderda ishlamaydi)
        if (saveTrigger > 0) {
            engineRef.current?.renderer.exportImage();
        }
    }, [saveTrigger]);

    return <main ref={containerRef} className="canvas-container"></main>;
};

export default MainCanvas;