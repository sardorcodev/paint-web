import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTool, setLineWidth, setShapeFillMode } from '../../app/slices/toolSlice';
import { triggerUndo, triggerRedo } from '../../app/slices/historySlice';
import { Brush, Eraser, Undo, Redo, Minus, Square, Circle, Spline, PaintBucket } from 'lucide-react';
import ColorPalette from './ColorPalette';
import './RibbonToolbar.css';

const RibbonToolbar = () => {
    const dispatch = useDispatch();
    const { activeToolId, lineWidth, shapeFillMode } = useSelector((state) => state.tool);
    const { canUndo, canRedo } = useSelector((state) => state.history);

    const getButtonClass = (toolName) => `tool-button ${activeToolId === toolName ? 'active' : ''}`;

    return (
        <div className="ribbon-toolbar">
            <div className="tool-group">
                <div className="tool-group-content">
                    <button className="tool-button" title="Undo" onClick={() => dispatch(triggerUndo())} disabled={!canUndo}>
                        <Undo size={20} />
                    </button>
                    <button className="tool-button" title="Redo" onClick={() => dispatch(triggerRedo())} disabled={!canRedo}>
                        <Redo size={20} />
                    </button>
                </div>
                <span className="tool-group-label">History</span>
            </div>

            <div className="tool-group">
                <div className="tool-group-content">
                    <button className={getButtonClass('brush')} title="Brush" onClick={() => dispatch(setActiveTool('brush'))}>
                        <Brush size={20} />
                    </button>
                    <button className={getButtonClass('eraser')} title="Eraser" onClick={() => dispatch(setActiveTool('eraser'))}>
                        <Eraser size={20} />
                    </button>
                    <button className={getButtonClass('fill')} title="Fill" onClick={() => {
                        console.log("--- 1. FILL tugmasi bosildi. 'fill' action jo'natilyapti.");
                        dispatch(setActiveTool('fill'));
                    }}>
    <PaintBucket size={20} />
</button>
                </div>
                <span className="tool-group-label">Tools</span>
            </div>

            <div className="tool-group">
                <div className="tool-group-content">
                    <button className={getButtonClass('line')} title="Line" onClick={() => {
                        console.log("--- 1. LINE tugmasi bosildi. 'line' action jo'natilyapti.");
                        dispatch(setActiveTool('line'));
                    }}>
    <Minus size={20} />
</button>
                    <button className={getButtonClass('rectangle')} title="Rectangle" onClick={() => dispatch(setActiveTool('rectangle'))}>
                        <Square size={20} />
                    </button>
                     <button className={getButtonClass('circle')} title="Circle" onClick={() => dispatch(setActiveTool('circle'))}>
                        <Circle size={20} />
                    </button>
                </div>
                <span className="tool-group-label">Shapes</span>
            </div>

            <div className="tool-group">
                <div className="tool-group-content">
                    <button 
                        className={`tool-button ${shapeFillMode === 'outline' ? 'active' : ''}`} 
                        title="Outline"
                        onClick={() => dispatch(setShapeFillMode('outline'))}
                    >
                        <Spline size={20} />
                    </button>
                    <button 
                        className={`tool-button ${shapeFillMode === 'fill' ? 'active' : ''}`}
                        title="Fill"
                        onClick={() => dispatch(setShapeFillMode('fill'))}
                    >
                        <Square size={20} fill="currentColor" /> 
                    </button>
                     <button 
                        className={`tool-button ${shapeFillMode === 'outline_and_fill' ? 'active' : ''}`}
                        title="Outline & Fill"
                        onClick={() => dispatch(setShapeFillMode('outline_and_fill'))}
                     >
                        <Circle size={20} fill="currentColor" strokeWidth={1.5} />
                    </button>
                </div>
                <span className="tool-group-label">Fill Mode</span>
            </div>

            <div className="tool-group">
                <div className="tool-group-content">
                     <input
                        type="range"
                        id="line-width"
                        min="1"
                        max="100"
                        value={lineWidth}
                        onChange={(e) => dispatch(setLineWidth(parseInt(e.target.value)))}
                     />
                     <span className="thickness-label">{lineWidth}px</span>
                </div>
                <span className="tool-group-label">Thickness</span>
            </div>
            
            <ColorPalette />
        </div>
    );
};

export default RibbonToolbar;