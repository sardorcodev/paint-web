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

        let activePointerId = null;
        let fillPendingHistory = false;

        const isTrackedPointer = (e) =>
            activePointerId === null || e.pointerId === activePointerId;

        const updateCursorFromPointer = (e) => {
            const rect = container.getBoundingClientRect();
            const isInside =
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom;

            dispatch(setCursorPos(
                isInside
                    ? { x: Math.round(e.offsetX), y: Math.round(e.offsetY) }
                    : { x: null, y: null }
            ));
        };

        const capturePointer = (e) => {
            if (container.setPointerCapture) {
                container.setPointerCapture(e.pointerId);
            }
        };

        const releasePointer = (e) => {
            if (container.releasePointerCapture && container.hasPointerCapture?.(e.pointerId)) {
                container.releasePointerCapture(e.pointerId);
            }
        };

        const handlePointerDown = (e) => {
            if (activePointerId !== null) return;

            const tool = engineRef.current.activeTool;
            if (!tool) return;

            activePointerId = e.pointerId;
            fillPendingHistory = false;
            capturePointer(e);
            e.preventDefault();

            if (tool instanceof ColorPickerTool) {
                const result = tool.onMouseDown(e);
                if (result) {
                    if (result.clickType === 'right') {
                        dispatch(setBackgroundColor(result.color));
                    } else {
                        dispatch(setForegroundColor(result.color));
                    }
                    dispatch(setActiveTool('brush'));
                }
            } else {
                const didChange = tool.onMouseDown(e, stateRef.current);
                fillPendingHistory = tool instanceof FillTool && didChange === true;
            }
        };

        const handlePointerMove = (e) => {
            if (!isTrackedPointer(e)) return;

            updateCursorFromPointer(e);

            if (activePointerId !== null) {
                e.preventDefault();
                engineRef.current.activeTool?.onMouseMove(e, stateRef.current);
            }
        };

        const handlePointerLeave = () => {
            if (activePointerId !== null) return;
            dispatch(setCursorPos({ x: null, y: null }));
        };

        const handlePointerEnd = (e) => {
            if (activePointerId !== e.pointerId) return;

            e.preventDefault();
            const tool = engineRef.current.activeTool;
            const history = engineRef.current.historyManager;

            if (fillPendingHistory) {
                history.pushState();
            } else if (tool?.isDrawing) {
                tool.onMouseUp(e, stateRef.current);
                history.pushState();
            }

            updateCursorFromPointer(e);
            releasePointer(e);
            activePointerId = null;
            fillPendingHistory = false;
        };

        const handlePointerCancel = (e) => {
            if (activePointerId !== e.pointerId) return;

            const tool = engineRef.current.activeTool;
            const wasDrawing = Boolean(tool?.isDrawing);

            tool?.onMouseLeave(e, stateRef.current);
            if (fillPendingHistory || wasDrawing) {
                engineRef.current.historyManager.pushState();
            }

            dispatch(setCursorPos({ x: null, y: null }));
            releasePointer(e);
            activePointerId = null;
            fillPendingHistory = false;
        };

        const handleContextMenu = (e) => {
            e.preventDefault();
        };

        container.addEventListener('pointerdown', handlePointerDown);
        container.addEventListener('pointermove', handlePointerMove);
        container.addEventListener('pointerup', handlePointerEnd);
        container.addEventListener('pointercancel', handlePointerCancel);
        container.addEventListener('pointerleave', handlePointerLeave);
        container.addEventListener('contextmenu', handleContextMenu);

        return () => {
            engineRef.current?.renderer.destroy();
            container.removeEventListener('pointerdown', handlePointerDown);
            container.removeEventListener('pointermove', handlePointerMove);
            container.removeEventListener('pointerup', handlePointerEnd);
            container.removeEventListener('pointercancel', handlePointerCancel);
            container.removeEventListener('pointerleave', handlePointerLeave);
            container.removeEventListener('contextmenu', handleContextMenu);
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

    return (
        <main
            ref={containerRef}
            className="canvas-container"
            aria-label="Drawing canvas workspace"
        ></main>
    );
};

export default MainCanvas;
