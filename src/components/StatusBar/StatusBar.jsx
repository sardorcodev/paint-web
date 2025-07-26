import React from 'react';
import { useSelector } from 'react-redux';
import './StatusBar.css';

const StatusBar = () => {
    // Redux'ning ui slice'idan kerakli ma'lumotlarni olamiz
    const { cursorPos, canvasSize } = useSelector((state) => state.ui);

    return (
        <footer className="app-statusbar">
            <div className="status-section">
                {/* Agar koordinatalar mavjud bo'lsa, ularni ko'rsatamiz */}
                {cursorPos.x !== null && cursorPos.y !== null && (
                    <span>{`${cursorPos.x}px, ${cursorPos.y}px`}</span>
                )}
            </div>
            <div className="status-section">
                {/* Canvas o'lchamini ko'rsatamiz */}
                <span>{`${canvasSize.width} x ${canvasSize.height}px`}</span>
            </div>
            <div className="status-section">
                {/* Kelajakda bu yerga Zoom funksiyasi qo'shiladi */}
                <span>100%</span>
            </div>
        </footer>
    );
};

export default StatusBar;