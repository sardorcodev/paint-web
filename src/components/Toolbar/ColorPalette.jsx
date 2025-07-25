import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setForegroundColor, setBackgroundColor } from '../../app/slices/toolSlice';
import './ColorPalette.css';

const PRESET_COLORS = [
    '#000000', '#7f7f7f', '#880015', '#ed1c24', '#ff7f27', '#fff200',
    '#22b14c', '#00a2e8', '#3f48cc', '#a349a4', '#ffffff', '#c3c3c3',
    '#b97a57', '#ffaec9', '#ffc90e', '#efe4b0', '#b5e61d', '#99d9ea',
    '#7092be', '#c8bfe7',
];

const ColorPalette = () => {
    const dispatch = useDispatch();
    const { foregroundColor, backgroundColor } = useSelector((state) => state.tool);

    const handleColorClick = (color, event) => {
        if (event.type === 'contextmenu') { // O'ng tugma bosilsa
            event.preventDefault();
            dispatch(setBackgroundColor(color));
        } else { // Chap tugma bosilsa
            dispatch(setForegroundColor(color));
        }
    };

    return (
        <div className="color-group">
            <div className="selected-colors">
                <div className="color-display-wrapper">
                    <div className="color-display background" style={{ backgroundColor }} title={`Background Color: ${backgroundColor}`}></div>
                    <div className="color-display foreground" style={{ backgroundColor: foregroundColor }} title={`Foreground Color: ${foregroundColor}`}></div>
                </div>
            </div>
            <div className="preset-grid">
                {PRESET_COLORS.map(color => (
                    <button
                        key={color}
                        className="color-swatch"
                        style={{ backgroundColor: color }}
                        onClick={(e) => handleColorClick(color, e)}
                        onContextMenu={(e) => handleColorClick(color, e)}
                    />
                ))}
            </div>
        </div>
    );
};

export default ColorPalette;