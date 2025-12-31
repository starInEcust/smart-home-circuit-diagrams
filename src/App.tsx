import { useState, useCallback, useEffect, useRef } from 'react';
import { CircuitCanvas, ControlPanel, Toolbar } from './components';
import type { 
  CircuitConfig, 
  CircuitComponent, 
  Connection, 
  ConnectionMode,
  CanvasViewState,
  PortInfo,
  VoiceCommand,
  WireType,
  LightComponent,
  SwitchComponent,
} from './types';
import { COMPONENT_TEMPLATES } from './types';
import './App.css';

// 生成唯一ID
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 默认电路配置
const defaultConfig: CircuitConfig = {
  components: [
    {
      id: 'power1',
      type: 'power',
      x: 40,
      y: 120,
      properties: {
        name: '主电源',
        status: true,
        liveOutputs: 3,
        neutralOutputs: 3,
      },
    },
    {
      id: 'gateway1',
      type: 'gateway',
      x: 600,
      y: 200,
      properties: {
        name: '中枢网关',
        status: true,
        connectedDevices: [],
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
        wirelessMode: false,
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
        wirelessMode: false,
      },
    },
    {
      id: 'switch2',
      type: 'switch',
      x: 220,
      y: 220,
      properties: {
        name: '卧室开关',
        isOn: false,
        type: '单火版',
        wirelessMode: true,
        gatewayId: 'gateway1',
        controlledLights: ['light2'],
      },
    },
    {
      id: 'light2',
      type: 'light',
      x: 400,
      y: 220,
      properties: {
        name: '卧室灯',
        status: false,
        brightness: 60,
        colorTemperature: 3000,
        wirelessMode: true,
        gatewayId: 'gateway1',
      },
    },
    {
      id: 'switch3',
      type: 'switch',
      x: 220,
      y: 340,
      properties: {
        name: '书房开关',
        isOn: true,
        type: '零火版',
        wirelessMode: false,
      },
    },
    {
      id: 'light3',
      type: 'light',
      x: 400,
      y: 340,
      properties: {
        name: '书房灯',
        status: true,
        brightness: 100,
        colorTemperature: 5500,
        wirelessMode: false,
      },
    },
  ],
  connections: [
    // 客厅电路 - 物理连线
    { id: 'conn1', from: 'power1', to: 'switch1', type: 'live', fromPort: 'L1', toPort: 'left', signalActive: true },
    { id: 'conn2', from: 'switch1', to: 'light1', type: 'live', fromPort: 'right', toPort: 'left', signalActive: true },
    { id: 'conn3', from: 'power1', to: 'switch1', type: 'neutral', fromPort: 'N1', toPort: 'left' },
    { id: 'conn3b', from: 'switch1', to: 'light1', type: 'neutral', fromPort: 'right', toPort: 'left' },

    // 书房电路 - 物理连线
    { id: 'conn7', from: 'power1', to: 'switch3', type: 'live', fromPort: 'L3', toPort: 'left', signalActive: true },
    { id: 'conn8', from: 'switch3', to: 'light3', type: 'live', fromPort: 'right', toPort: 'left', signalActive: true },
    { id: 'conn9', from: 'power1', to: 'switch3', type: 'neutral', fromPort: 'N3', toPort: 'left' },
    { id: 'conn9b', from: 'switch3', to: 'light3', type: 'neutral', fromPort: 'right', toPort: 'left' },
  ],
};

function App() {
  const [config, setConfig] = useState<CircuitConfig>(defaultConfig);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>({
    isConnecting: false,
    fromComponent: null,
    fromPort: null,
    wireType: null,
  });
  const [viewState, setViewState] = useState<CanvasViewState>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  });
  const [activeSignals, setActiveSignals] = useState<Map<string, boolean>>(new Map());
  const signalTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // 处理无线信号传输
  const sendWirelessSignal = useCallback((fromId: string, toId: string, duration: number = 2000) => {
    const signalKey = `${fromId}-${toId}`;
    
    // 激活信号
    setActiveSignals(prev => {
      const next = new Map(prev);
      next.set(signalKey, true);
      return next;
    });

    // 清除之前的超时
    const existingTimeout = signalTimeoutRef.current.get(signalKey);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // 设置新的超时来关闭信号
    const timeout = setTimeout(() => {
      setActiveSignals(prev => {
        const next = new Map(prev);
        next.delete(signalKey);
        return next;
      });
      signalTimeoutRef.current.delete(signalKey);
    }, duration);

    signalTimeoutRef.current.set(signalKey, timeout);
  }, []);

  // 更新组件并处理信号逻辑
  const handleUpdateComponent = useCallback((id: string, updates: Partial<CircuitComponent>) => {
    setConfig(prev => {
      const newComponents = prev.components.map(comp =>
        comp.id === id ? { ...comp, ...updates } as CircuitComponent : comp
      );

      const updatedComp = newComponents.find(c => c.id === id);
      
      // 处理无线开关信号
      if (updatedComp?.type === 'switch') {
        const switchComp = updatedComp as SwitchComponent;
        if (switchComp.properties.wirelessMode && switchComp.properties.gatewayId) {
          const gatewayId = switchComp.properties.gatewayId;
          const gateway = newComponents.find(c => c.id === gatewayId);
          
          if (gateway?.type === 'gateway' && gateway.properties.status) {
            // 开关状态改变时，发送信号到网关
            if (switchComp.properties.isOn !== (prev.components.find(c => c.id === id) as SwitchComponent)?.properties.isOn) {
              // 信号: 开关 -> 网关
              sendWirelessSignal(id, gatewayId, 1500);
              
              // 信号: 网关 -> 控制的灯具
              const controlledLights = switchComp.properties.controlledLights || [];
              controlledLights.forEach((lightId, index) => {
                setTimeout(() => {
                  sendWirelessSignal(gatewayId, lightId, 1500);
                  
                  // 更新灯具状态
                  setConfig(current => ({
                    ...current,
                    components: current.components.map(c => {
                      if (c.id === lightId && c.type === 'light') {
                        return {
                          ...c,
                          properties: { ...c.properties, status: switchComp.properties.isOn }
                        };
                      }
                      return c;
                    }),
                  }));
                }, 500 + index * 200);
              });
            }
          }
        }
      }

      // 更新物理连线的信号状态
      const newConnections = prev.connections.map(conn => {
        if (conn.type === 'live') {
          const fromComp = newComponents.find(c => c.id === conn.from);
          if (fromComp?.type === 'switch' && !fromComp.properties.wirelessMode) {
            return { ...conn, signalActive: fromComp.properties.isOn };
          }
        }
        return conn;
      });

      return { components: newComponents, connections: newConnections };
    });
  }, [sendWirelessSignal]);

  // 添加组件
  const handleAddComponent = useCallback((type: 'power' | 'light' | 'switch' | 'gateway') => {
    const template = COMPONENT_TEMPLATES[type];
    const id = generateId(type);
    
    const existingCount = config.components.filter(c => c.type === type).length;
    const x = 150 + (existingCount % 4) * 120;
    const y = 100 + Math.floor(existingCount / 4) * 100;

    const newComponent: CircuitComponent = {
      id,
      type: template.type,
      x,
      y,
      properties: {
        ...template.properties,
        name: `${template.properties.name}${existingCount + 1}`,
      },
    } as CircuitComponent;

    setConfig(prev => ({
      ...prev,
      components: [...prev.components, newComponent],
    }));

    setSelectedComponentId(id);
  }, [config.components]);

  // 删除组件
  const handleDeleteComponent = useCallback((id: string) => {
    setConfig(prev => ({
      components: prev.components.filter(c => c.id !== id),
      connections: prev.connections.filter(c => c.from !== id && c.to !== id),
    }));

    if (selectedComponentId === id) {
      setSelectedComponentId(null);
    }
  }, [selectedComponentId]);

  // 开始连线
  const handleStartConnection = useCallback((wireType: WireType) => {
    setConnectionMode({
      isConnecting: true,
      fromComponent: null,
      fromPort: null,
      wireType,
    });
  }, []);

  // 取消连线
  const handleCancelConnection = useCallback(() => {
    setConnectionMode({
      isConnecting: false,
      fromComponent: null,
      fromPort: null,
      wireType: null,
    });
  }, []);

  // 处理端口点击
  const handlePortClick = useCallback((portInfo: PortInfo) => {
    if (!connectionMode.isConnecting || !connectionMode.wireType) return;

    // 检查端口类型是否匹配
    if (portInfo.portType !== connectionMode.wireType) return;

    if (!connectionMode.fromComponent) {
      // 设置起点
      setConnectionMode(prev => ({
        ...prev,
        fromComponent: portInfo.componentId,
        fromPort: portInfo.portId,
      }));
    } else if (connectionMode.fromComponent !== portInfo.componentId) {
      // 创建连接
      const newConnection: Connection = {
        id: generateId('conn'),
        from: connectionMode.fromComponent,
        to: portInfo.componentId,
        type: connectionMode.wireType,
        fromPort: connectionMode.fromPort || undefined,
        toPort: portInfo.portId,
        signalActive: false,
      };

      setConfig(prev => ({
        ...prev,
        connections: [...prev.connections, newConnection],
      }));

      // 重置连线模式
      handleCancelConnection();
    }
  }, [connectionMode, handleCancelConnection]);

  // 添加连接
  const handleAddConnection = useCallback((connection: Connection) => {
    setConfig(prev => ({
      ...prev,
      connections: [...prev.connections, connection],
    }));
  }, []);

  // 语音命令处理
  const handleVoiceCommand = useCallback((command: VoiceCommand) => {
    // 找到目标设备
    const targetComponent = config.components.find(
      c => c.properties.name.includes(command.target) || c.id === command.target
    );

    if (!targetComponent) {
      console.log('未找到设备:', command.target);
      return;
    }

    // 找到网关
    const gateway = config.components.find(c => c.type === 'gateway' && c.properties.status);
    
    if (gateway) {
      // 发送信号: 网关 -> 目标设备
      sendWirelessSignal(gateway.id, targetComponent.id, 2000);
    }

    // 执行命令
    setTimeout(() => {
      if (targetComponent.type === 'light') {
        const lightComp = targetComponent as LightComponent;
        let updates: Partial<LightComponent['properties']> = {};

        switch (command.action) {
          case 'on':
            updates = { status: true };
            break;
          case 'off':
            updates = { status: false };
            break;
          case 'toggle':
            updates = { status: !lightComp.properties.status };
            break;
          case 'setBrightness':
            updates = { brightness: Math.min(100, Math.max(0, command.value || 0)) };
            break;
          case 'setColorTemp':
            updates = { colorTemperature: Math.min(6500, Math.max(2000, command.value || 4000)) };
            break;
        }

        handleUpdateComponent(targetComponent.id, {
          ...targetComponent,
          properties: { ...lightComp.properties, ...updates }
        });
      } else if (targetComponent.type === 'switch') {
        const switchComp = targetComponent as SwitchComponent;
        let isOn = switchComp.properties.isOn;

        switch (command.action) {
          case 'on':
            isOn = true;
            break;
          case 'off':
            isOn = false;
            break;
          case 'toggle':
            isOn = !isOn;
            break;
        }

        handleUpdateComponent(targetComponent.id, {
          ...targetComponent,
          properties: { ...switchComp.properties, isOn }
        });
      }
    }, gateway ? 800 : 0);
  }, [config.components, handleUpdateComponent, sendWirelessSignal]);

  // 缩放控制
  const handleZoomIn = useCallback(() => {
    setViewState(prev => ({
      ...prev,
      scale: Math.min(3, prev.scale * 1.2),
    }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setViewState(prev => ({
      ...prev,
      scale: Math.max(0.3, prev.scale / 1.2),
    }));
  }, []);

  const handleResetView = useCallback(() => {
    setViewState({ scale: 1, offsetX: 0, offsetY: 0 });
  }, []);

  // 清理超时
  useEffect(() => {
    return () => {
      signalTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

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
            <button className="btn-secondary" onClick={() => {
              setConfig(defaultConfig);
              setSelectedComponentId(null);
              handleResetView();
            }}>
              重置
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* 左侧工具栏 */}
        <aside className="toolbar-container">
          <Toolbar
            onAddComponent={handleAddComponent}
            onStartConnection={handleStartConnection}
            onCancelConnection={handleCancelConnection}
            isConnecting={connectionMode.isConnecting}
            connectionWireType={connectionMode.wireType}
            onVoiceCommand={handleVoiceCommand}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetView={handleResetView}
            scale={viewState.scale}
          />
        </aside>

        {/* 中间画布 */}
        <div className="canvas-container">
          <CircuitCanvas
            config={config}
            selectedComponentId={selectedComponentId}
            onSelectComponent={setSelectedComponentId}
            onUpdateComponent={handleUpdateComponent}
            onDeleteComponent={handleDeleteComponent}
            onAddConnection={handleAddConnection}
            connectionMode={connectionMode}
            onPortClick={handlePortClick}
            viewState={viewState}
            onViewStateChange={setViewState}
            activeSignals={activeSignals}
          />
        </div>

        {/* 右侧属性面板 */}
        <aside className="sidebar">
          <ControlPanel
            config={config}
            selectedComponentId={selectedComponentId}
            onUpdateComponent={handleUpdateComponent}
            onDeleteComponent={handleDeleteComponent}
            onSelectComponent={setSelectedComponentId}
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
