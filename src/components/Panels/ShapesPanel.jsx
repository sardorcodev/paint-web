import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTool } from '../../app/slices/toolSlice';
import { Minus, Square, Circle } from 'lucide-react';
import './ShapesPanel.css'; // Yangi CSS faylimiz

const ShapesPanel = () => {
    const dispatch = useDispatch();
    const activeToolId = useSelector((state) => state.tool.activeToolId);

    const getButtonClass = (toolName) => `shape-button ${activeToolId === toolName ? 'active' : ''}`;

    return (
        <aside className="side-panel">
            <div className="panel-header">
                <h4>Shapes</h4>
            </div>
            <div className="shapes-grid">
                <button className={getButtonClass('line')} title="Line" onClick={() => dispatch(setActiveTool('line'))}>
                    <Minus size={24} />
                </button>
                <button className={getButtonClass('rectangle')} title="Rectangle" onClick={() => dispatch(setActiveTool('rectangle'))}>
                    <Square size={24} />
                </button>
                <button className={getButtonClass('circle')} title="Circle" onClick={() => dispatch(setActiveTool('circle'))}>
                    <Circle size={24} />
                </button>
                {/* Kelajakda yangi shakllar shu yerga qo'shiladi */}
            </div>
        </aside>
    );
};

export default ShapesPanel;