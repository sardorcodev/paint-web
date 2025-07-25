import React from 'react';
import './assets/App.css'; 
import Header from './components/Header/Header';
import RibbonToolbar from './components/Toolbar/RibbonToolbar'; // ESKI Toolbar o'rniga YANGI RibbonToolbar
import MainCanvas from './components/Canvas/MainCanvas';
import LayerPanel from './components/Panels/LayerPanel';
import StatusBar from './components/StatusBar/StatusBar';

function App() {
  return (
    <div className="app-container">
      <Header />
      <RibbonToolbar /> {/* YANGI KOMPONENT */}
      <div className="workspace"> {/* Asosiy ish maydoni uchun yangi div */}
        <MainCanvas />
        <LayerPanel />
      </div>
      <StatusBar />
    </div>
  );
}

export default App;