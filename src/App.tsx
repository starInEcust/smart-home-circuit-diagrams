import { useState } from 'react';
import { CircuitCanvas, ControlPanel } from './components';
import type { CircuitConfig, CircuitComponent } from './types';
import './App.css';

// 默认电路配置 - 演示场景
const defaultConfig: CircuitConfig = {
  components: [
    {
      id: 'power1',
      type: 'power',
      x: 60,
      y: 100,
      properties: {
        name: '主电源',
        status: true,
      },
    },
    {
      id: 'switch1',
      type: 'switch',
      x: 220,
      y: 100,
      properties: {
        name: '客厅开关',
        isOn: true,
        type: '零火版',
      },
    },
    {
      id: 'light1',
      type: 'light',
      x: 400,
      y: 100,
      properties: {
        name: '客厅主灯',
        status: true,
        brightness: 85,
        colorTemperature: 4000,
      },
    },
    {
      id: 'switch2',
      type: 'switch',
      x: 220,
      y: 250,
      properties: {
        name: '卧室开关',
        isOn: false,
        type: '单火版',
      },
    },
    {
      id: 'light2',
      type: 'light',
      x: 400,
      y: 250,
      properties: {
        name: '卧室灯',
        status: false,
        brightness: 60,
        colorTemperature: 3000,
      },
    },
    {
      id: 'switch3',
      type: 'switch',
      x: 220,
      y: 400,
      properties: {
        name: '书房开关',
        isOn: true,
        type: '零火版',
      },
    },
    {
      id: 'light3',
      type: 'light',
      x: 400,
      y: 400,
      properties: {
        name: '书房灯',
        status: true,
        brightness: 100,
        colorTemperature: 5500,
      },
    },
  ],
  connections: [
    // 客厅电路
    { id: 'conn1', from: 'power1', to: 'switch1', type: 'live', signalActive: true, signalSpeed: 5 },
    { id: 'conn2', from: 'switch1', to: 'light1', type: 'live', signalActive: true, signalSpeed: 5 },
    { id: 'conn3', from: 'light1', to: 'power1', type: 'neutral', signalActive: false },
    
    // 卧室电路
    { id: 'conn4', from: 'power1', to: 'switch2', type: 'live', signalActive: true, signalSpeed: 5 },
    { id: 'conn5', from: 'switch2', to: 'light2', type: 'live', signalActive: false },
    { id: 'conn6', from: 'light2', to: 'power1', type: 'neutral', signalActive: false },
    
    // 书房电路
    { id: 'conn7', from: 'power1', to: 'switch3', type: 'live', signalActive: true, signalSpeed: 5 },
    { id: 'conn8', from: 'switch3', to: 'light3', type: 'live', signalActive: true, signalSpeed: 5 },
    { id: 'conn9', from: 'light3', to: 'power1', type: 'neutral', signalActive: false },
  ],
};

function App() {
  const [config, setConfig] = useState<CircuitConfig>(defaultConfig);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);

  // 更新组件
  const handleUpdateComponent = (id: string, updates: Partial<CircuitComponent>) => {
    setConfig(prev => ({
      ...prev,
      components: prev.components.map(comp => 
        comp.id === id ? { ...comp, ...updates } as CircuitComponent : comp
      ),
    }));
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#64B5F6" strokeWidth="2" />
              <path d="M12 6v6l4 2" stroke="#64B5F6" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="12" r="2" fill="#64B5F6" />
            </svg>
            <h1>智能家居电路设计器</h1>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={() => setConfig(defaultConfig)}>
              重置
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="canvas-container">
          <CircuitCanvas
            config={config}
            selectedComponentId={selectedComponentId}
            onSelectComponent={setSelectedComponentId}
          />
        </div>
        <aside className="sidebar">
          <ControlPanel
            config={config}
            selectedComponentId={selectedComponentId}
            onUpdateComponent={handleUpdateComponent}
          />
        </aside>
      </main>

      <footer className="app-footer">
        <p>全屋智能电路图设计系统 · 基于 React + SVG</p>
      </footer>
    </div>
  );
}

export default App;
