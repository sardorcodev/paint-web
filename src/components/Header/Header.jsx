import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { triggerSave } from '../../app/slices/uiSlice';
import './Header.css';

const Header = () => {
    const dispatch = useDispatch();
    const [openMenu, setOpenMenu] = useState(null); // Qaysi menyu ochiqligini saqlaydi
    const menuRef = useRef(null);

    // Menyudan tashqariga bosilganda uni yopish uchun
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenu(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    const handleMenuClick = (menuName) => {
        setOpenMenu(openMenu === menuName ? null : menuName);
    };

    const handleSave = () => {
        dispatch(triggerSave());
        setOpenMenu(null); // Menyuni yopish
    };

    return (
        <header className="app-header" ref={menuRef}>
            <div className="app-logo">ProPaints</div>
            <nav className="main-menu">
                <div className="menu-item">
                    <button
                        aria-haspopup="true"
                        aria-expanded={openMenu === 'file'}
                        onClick={() => handleMenuClick('file')}
                    >
                        File
                    </button>
                    {openMenu === 'file' && (
                        <div className="dropdown-menu">
                            <button className="dropdown-item" onClick={handleSave}>Save as Image...</button>
                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;
