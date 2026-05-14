import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { triggerRedo, triggerUndo } from '../../app/slices/historySlice';
import { setActiveTool, setLineWidth, setShapeFillMode } from '../../app/slices/toolSlice';
import { Brush, Eraser, Undo, Redo, Spline, Square, Circle, PaintBucket, Pipette } from 'lucide-react';
import ColorPalette from './ColorPalette';
import './RibbonToolbar.css';

const RibbonToolbar = () => {
    const dispatch = useDispatch();
    const { activeToolId, lineWidth, shapeFillMode } = useSelector(
        state => state.tool
    );
    const { canUndo, canRedo } = useSelector(state => state.history);

    const getButtonClass = toolName =>
        `tool-button ${activeToolId === toolName ? 'active' : ''}`;

    return (
        <div className='ribbon-toolbar'>
            <div className='tool-group'>
                <div className='tool-group-content'>
                    <button
                        className='tool-button'
                        title='Undo'
                        aria-label='Undo'
                        onClick={() => dispatch(triggerUndo())}
                        disabled={!canUndo}
                    >
                        <Undo size={20} />
                    </button>
                    <button
                        className='tool-button'
                        title='Redo'
                        aria-label='Redo'
                        onClick={() => dispatch(triggerRedo())}
                        disabled={!canRedo}
                    >
                        <Redo size={20} />
                    </button>
                </div>
                <span className='tool-group-label'>History</span>
            </div>

            <div className='tool-group'>
                <div className='tool-group-content'>
                    <button
                        className={getButtonClass('brush')}
                        title='Brush'
                        aria-label='Brush tool'
                        aria-pressed={activeToolId === 'brush'}
                        onClick={() => dispatch(setActiveTool('brush'))}
                    >
                        <Brush size={20} />
                    </button>
                    <button
                        className={getButtonClass('eraser')}
                        title='Eraser'
                        aria-label='Eraser tool'
                        aria-pressed={activeToolId === 'eraser'}
                        onClick={() => dispatch(setActiveTool('eraser'))}
                    >
                        <Eraser size={20} />
                    </button>
                    <button
                        className={getButtonClass('fill')}
                        title='Fill'
                        aria-label='Fill tool'
                        aria-pressed={activeToolId === 'fill'}
                        onClick={() => dispatch(setActiveTool('fill'))}
                    >
                        <PaintBucket size={20} />
                    </button>
                    <button
                        className={getButtonClass('color_picker')}
                        title='Color Picker'
                        aria-label='Color picker tool'
                        aria-pressed={activeToolId === 'color_picker'}
                        onClick={() => dispatch(setActiveTool('color_picker'))}
                    >
                        <Pipette size={20} />
                    </button>
                </div>
                <span className='tool-group-label'>Tools</span>
            </div>
            
            {/* SHAPES GURUHI BU YERDAN OLIB TASHALANDI */}

            <div className='tool-group'>
                <div className='tool-group-content'>
                    <button
                        className={`tool-button ${shapeFillMode === 'outline' ? 'active' : ''}`}
                        title='Outline'
                        aria-label='Outline fill mode'
                        aria-pressed={shapeFillMode === 'outline'}
                        onClick={() => dispatch(setShapeFillMode('outline'))}
                    >
                        <Spline size={20} />
                    </button>
                    <button
                        className={`tool-button ${shapeFillMode === 'fill' ? 'active' : ''}`}
                        title='Fill'
                        aria-label='Solid fill mode'
                        aria-pressed={shapeFillMode === 'fill'}
                        onClick={() => dispatch(setShapeFillMode('fill'))}
                    >
                        <Square size={20} fill='currentColor' />
                    </button>
                    <button
                        className={`tool-button ${shapeFillMode === 'outline_and_fill' ? 'active' : ''}`}
                        title='Outline & Fill'
                        aria-label='Outline and fill mode'
                        aria-pressed={shapeFillMode === 'outline_and_fill'}
                        onClick={() => dispatch(setShapeFillMode('outline_and_fill'))}
                    >
                        <Circle size={20} fill='currentColor' strokeWidth={1.5} />
                    </button>
                </div>
                <span className='tool-group-label'>Fill Mode</span>
            </div>

            <div className='tool-group'>
                <div className='tool-group-content'>
                    <input
                        type='range'
                        id='line-width'
                        min='1'
                        max='100'
                        value={lineWidth}
                        aria-label='Brush and shape thickness'
                        onChange={e => dispatch(setLineWidth(parseInt(e.target.value, 10)))}
                    />
                    <span className='thickness-label'>{lineWidth}px</span>
                </div>
                <span className='tool-group-label'>Thickness</span>
            </div>

            <ColorPalette />
        </div>
    );
};

export default RibbonToolbar;
