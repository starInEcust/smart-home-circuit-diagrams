import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { 
  CircuitConfig, 
  CircuitComponent, 
  Connection, 
  DragState, 
  ConnectionMode,
  CanvasViewState,
  PortInfo,
  WireType,
  PortPosition
} from '../types';
import { COMPONENT_SIZE } from '../types';
import { PowerComponent } from './PowerComponent';
import { LightComponent } from './LightComponent';
import { SwitchComponent } from './SwitchComponent';
import { GatewayComponent } from './GatewayComponent';
import { WireComponent } from './WireComponent';

interface Props {
  config: CircuitConfig;
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
  onUpdateComponent: (id: string, updates: Partial<CircuitComponent>) => void;
  onDeleteComponent?: (id: string) => void;
  onAddConnection: (connection: Connection) => void;
  connectionMode: ConnectionMode;
  onPortClick: (portInfo: PortInfo) => void;
  viewState: CanvasViewState;
  onViewStateChange: (state: CanvasViewState) => void;
  activeSignals: Map<string, boolean>; // 活跃的信号状态
}

// 计算组件的连接点位置
function getConnectionPoints(
  component: CircuitComponent,
  wireType: WireType,
  port?: PortPosition
): { x: number; y: number } {
  const { x, y, type } = component;
  const { width, height } = COMPONENT_SIZE;

  // 网关组件的连接点
  if (type === 'gateway') {
    switch (port) {
      case 'top':
        return { x: x + width / 2, y: y };
      case 'bottom':
        return { x: x + width / 2, y: y + height };
      case 'left':
        return { x: x, y: y + height / 2 };
      case 'right':
      default:
        return { x: x + width, y: y + height / 2 };
    }
  }

  // 开关组件需要根据类型判断零线端口
  if (type === 'switch') {
    const hasNeutral = component.properties.type === '零火版';
    
    if (wireType === 'network') {
      return { x: x + width / 2, y: y }; // 网络端口在顶部
    }
    
    if (wireType === 'live') {
      const yPos = hasNeutral ? y + height / 2 - 8 : y + height / 2;
      return port === 'left' 
        ? { x: x, y: yPos }
        : { x: x + width, y: yPos };
    }
    
    if (wireType === 'neutral' && hasNeutral) {
      return port === 'left'
        ? { x: x, y: y + height / 2 + 8 }
        : { x: x + width, y: y + height / 2 + 8 };
    }
    
    return port === 'left' 
      ? { x: x, y: y + height / 2 }
      : { x: x + width, y: y + height / 2 };
  }

  // 电源组件 - 动态端口位置
  if (type === 'power') {
    const liveOutputs = component.properties.liveOutputs || 3;
    const neutralOutputs = component.properties.neutralOutputs || 3;
    const maxOutputs = Math.max(liveOutputs, neutralOutputs);
    const dynamicHeight = Math.max(60, maxOutputs * 20 + 20);
    
    const portMatch = port?.match(/^([LN])(\d+)$/);
    if (portMatch) {
      const portType = portMatch[1];
      const portIndex = parseInt(portMatch[2]) - 1;
      
      if (portType === 'L') {
        const spacing = (dynamicHeight - 20) / (liveOutputs + 1);
        return { x: x + width, y: y + 10 + spacing * (portIndex + 1) };
      } else {
        const spacing = (dynamicHeight - 20) / (neutralOutputs + 1);
        return { x: x + width + 15, y: y + 10 + spacing * (portIndex + 1) };
      }
    }
    
    const spacing = (dynamicHeight - 20) / (liveOutputs + 1);
    return { x: x + width, y: y + 10 + spacing };
  }

  // 灯组件
  if (type === 'light') {
    if (wireType === 'network') {
      return { x: x + width / 2, y: y + height };
    }
    const yOffset = wireType === 'live' ? -8 : 8;
    return { x: x, y: y + height / 2 + yOffset };
  }

  const yOffset = wireType === 'live' || wireType === 'network' ? -8 : 8;
  return { x: x + width, y: y + height / 2 + yOffset };
}

// 计算回路带电状态
function calculateCircuitPower(config: CircuitConfig): Map<string, boolean> {
  const powerMap = new Map<string, boolean>();
  const componentMap = new Map(config.components.map(c => [c.id, c]));

  config.components.forEach(comp => {
    if (comp.type === 'power') {
      powerMap.set(comp.id, comp.properties.status);
    } else {
      powerMap.set(comp.id, false);
    }
  });

  const traceLivePower = (componentId: string, visited: Set<string>) => {
    if (visited.has(componentId)) return;
    visited.add(componentId);

    const comp = componentMap.get(componentId);
    if (!comp) return;

    config.connections
      .filter(conn => conn.from === componentId && conn.type === 'live')
      .forEach(conn => {
        const targetComp = componentMap.get(conn.to);
        if (!targetComp) return;

        if (targetComp.type === 'switch') {
          // 无线模式开关不影响电气回路
          if (!targetComp.properties.wirelessMode && targetComp.properties.isOn) {
            powerMap.set(targetComp.id, true);
            traceLivePower(targetComp.id, visited);
          } else if (targetComp.properties.wirelessMode) {
            // 无线模式开关始终带电（仅控制信号）
            powerMap.set(targetComp.id, true);
          }
        } else {
          powerMap.set(targetComp.id, true);
        }
      });
  };

  config.components
    .filter(c => c.type === 'power' && c.properties.status)
    .forEach(power => {
      traceLivePower(power.id, new Set());
    });

  return powerMap;
}

export function CircuitCanvas({
  config,
  selectedComponentId,
  onSelectComponent,
  onUpdateComponent,
  onDeleteComponent,
  onAddConnection,
  connectionMode,
  onPortClick,
  viewState,
  onViewStateChange,
  activeSignals,
}: Props) {
  const { components, connections } = config;
  const svgRef = useRef<SVGSVGElement>(null);
  
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    componentId: null,
    offsetX: 0,
    offsetY: 0,
  });

  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [tempLine, setTempLine] = useState<{ start: { x: number; y: number }; end: { x: number; y: number } } | null>(null);

  const powerState = useMemo(() => calculateCircuitPower(config), [config]);
  const componentMap = useMemo(() => new Map(components.map(c => [c.id, c])), [components]);

  // 处理滚轮缩放
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(3, Math.max(0.3, viewState.scale * delta));
    
    // 以鼠标位置为中心缩放
    const svg = svgRef.current;
    if (svg) {
      const rect = svg.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const scaleChange = newScale / viewState.scale;
      const newOffsetX = mouseX - (mouseX - viewState.offsetX) * scaleChange;
      const newOffsetY = mouseY - (mouseY - viewState.offsetY) * scaleChange;
      
      onViewStateChange({
        scale: newScale,
        offsetX: newOffsetX,
        offsetY: newOffsetY,
      });
    }
  }, [viewState, onViewStateChange]);

  // 处理中键拖拽平移
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1) { // 中键
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - viewState.offsetX, y: e.clientY - viewState.offsetY });
    }
  }, [viewState.offsetX, viewState.offsetY]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // 平移
    if (isPanning) {
      onViewStateChange({
        ...viewState,
        offsetX: e.clientX - panStart.x,
        offsetY: e.clientY - panStart.y,
      });
      return;
    }

    // 连线模式下显示临时连线
    if (connectionMode.isConnecting && connectionMode.fromComponent && svgRef.current) {
      const svg = svgRef.current;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
      
      const fromComp = componentMap.get(connectionMode.fromComponent);
      if (fromComp && connectionMode.wireType) {
        const startPoint = getConnectionPoints(fromComp, connectionMode.wireType, connectionMode.fromPort || 'right');
        setTempLine({
          start: startPoint,
          end: { x: (svgP.x - viewState.offsetX) / viewState.scale, y: (svgP.y - viewState.offsetY) / viewState.scale },
        });
      }
    }

    // 组件拖拽
    if (dragState.isDragging && dragState.componentId && svgRef.current) {
      const svg = svgRef.current;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

      const newX = Math.max(0, Math.min(750, (svgP.x - viewState.offsetX) / viewState.scale - dragState.offsetX));
      const newY = Math.max(0, Math.min(450, (svgP.y - viewState.offsetY) / viewState.scale - dragState.offsetY));

      const comp = componentMap.get(dragState.componentId);
      if (comp) {
        onUpdateComponent(dragState.componentId, { ...comp, x: newX, y: newY });
      }
    }
  }, [isPanning, panStart, connectionMode, dragState, componentMap, viewState, onUpdateComponent, onViewStateChange]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDragState({ isDragging: false, componentId: null, offsetX: 0, offsetY: 0 });
    setTempLine(null);
  }, []);

  // 处理组件拖拽开始
  const handleDragStart = useCallback((componentId: string, e: React.MouseEvent) => {
    if (connectionMode.isConnecting) return; // 连线模式下不允许拖拽
    
    const svg = svgRef.current;
    if (!svg) return;

    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    const comp = componentMap.get(componentId);
    if (!comp) return;

    setDragState({
      isDragging: true,
      componentId,
      offsetX: (svgP.x - viewState.offsetX) / viewState.scale - comp.x,
      offsetY: (svgP.y - viewState.offsetY) / viewState.scale - comp.y,
    });
  }, [componentMap, connectionMode.isConnecting, viewState]);

  // 处理键盘事件
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedComponentId) {
      e.preventDefault();
      onDeleteComponent?.(selectedComponentId);
    }
    if (e.key === 'Escape' && connectionMode.isConnecting) {
      setTempLine(null);
    }
  }, [selectedComponentId, onDeleteComponent, connectionMode.isConnecting]);

  // 渲染端口（可点击）
  const renderClickablePorts = (component: CircuitComponent) => {
    if (!connectionMode.isConnecting) return null;

    const ports: JSX.Element[] = [];
    const { x, y, type } = component;
    const { width, height } = COMPONENT_SIZE;

    const addPort = (portId: string, portType: WireType, cx: number, cy: number) => {
      // 只显示对应类型的端口
      if (connectionMode.wireType && connectionMode.wireType !== portType) return;
      
      ports.push(
        <circle
          key={`${component.id}-${portId}`}
          cx={cx}
          cy={cy}
          r={8}
          fill="transparent"
          stroke={connectionMode.wireType === portType ? '#FFEB3B' : 'transparent'}
          strokeWidth={2}
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            onPortClick({
              componentId: component.id,
              portId,
              portType,
              position: { x: cx, y: cy },
            });
          }}
        >
          <animate attributeName="stroke-opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
        </circle>
      );
    };

    if (type === 'power') {
      const liveOutputs = component.properties.liveOutputs || 3;
      const neutralOutputs = component.properties.neutralOutputs || 3;
      const maxOutputs = Math.max(liveOutputs, neutralOutputs);
      const dynamicHeight = Math.max(60, maxOutputs * 20 + 20);
      
      for (let i = 0; i < liveOutputs; i++) {
        const spacing = (dynamicHeight - 20) / (liveOutputs + 1);
        addPort(`L${i + 1}`, 'live', x + width, y + 10 + spacing * (i + 1));
      }
      for (let i = 0; i < neutralOutputs; i++) {
        const spacing = (dynamicHeight - 20) / (neutralOutputs + 1);
        addPort(`N${i + 1}`, 'neutral', x + width + 15, y + 10 + spacing * (i + 1));
      }
    } else if (type === 'switch') {
      const hasNeutral = component.properties.type === '零火版';
      const liveY = hasNeutral ? y + height / 2 - 8 : y + height / 2;
      
      addPort('live-in', 'live', x, liveY);
      addPort('live-out', 'live', x + width, liveY);
      
      if (hasNeutral) {
        addPort('neutral-in', 'neutral', x, y + height / 2 + 8);
        addPort('neutral-out', 'neutral', x + width, y + height / 2 + 8);
      }
      
      addPort('network', 'network', x + width / 2, y);
    } else if (type === 'light') {
      addPort('live-in', 'live', x, y + height / 2 - 8);
      addPort('neutral-in', 'neutral', x, y + height / 2 + 8);
      addPort('network', 'network', x + width / 2, y + height);
    } else if (type === 'gateway') {
      addPort('top', 'network', x + width / 2, y);
      addPort('bottom', 'network', x + width / 2, y + height);
      addPort('left', 'network', x, y + height / 2);
      addPort('right', 'network', x + width, y + height / 2);
    }

    return ports;
  };

  // 渲染单个组件
  const renderComponent = (component: CircuitComponent) => {
    const isSelected = selectedComponentId === component.id;
    const handleClick = () => !connectionMode.isConnecting && onSelectComponent(component.id);
    const handleDrag = (e: React.MouseEvent) => handleDragStart(component.id, e);
    
    const isPowered = powerState.get(component.id) ?? false;

    switch (component.type) {
      case 'power':
        return (
          <g key={component.id}>
            <PowerComponent
              component={component}
              onClick={handleClick}
              selected={isSelected}
              onDragStart={handleDrag}
            />
            {renderClickablePorts(component)}
          </g>
        );
      case 'light':
        return (
          <g key={component.id}>
            <LightComponent
              component={component}
              onClick={handleClick}
              selected={isSelected}
              isPowered={isPowered}
              onDragStart={handleDrag}
            />
            {renderClickablePorts(component)}
          </g>
        );
      case 'switch':
        return (
          <g key={component.id}>
            <SwitchComponent
              component={component}
              onClick={handleClick}
              selected={isSelected}
              onDragStart={handleDrag}
            />
            {renderClickablePorts(component)}
          </g>
        );
      case 'gateway':
        return (
          <g key={component.id}>
            <GatewayComponent
              component={component}
              onClick={handleClick}
              selected={isSelected}
              onDragStart={handleDrag}
            />
            {renderClickablePorts(component)}
          </g>
        );
      default:
        return null;
    }
  };

  // 计算连线的信号激活状态
  const getConnectionSignalState = (connection: Connection): boolean => {
    const fromComp = componentMap.get(connection.from);
    const toComp = componentMap.get(connection.to);
    
    if (!fromComp || !toComp) return false;
    
    // 网络线：检查是否有活跃信号
    if (connection.type === 'network') {
      // 检查是否有从该连接发送的信号
      const signalKey = `${connection.from}-${connection.to}`;
      if (activeSignals.get(signalKey)) {
        return true;
      }
      // 默认不显示信号动画
      return false;
    }
    
    // 火线：检查回路是否带电
    if (connection.type === 'live') {
      const fromPowered = powerState.get(connection.from) ?? false;
      
      if (fromComp.type === 'switch') {
        // 无线模式开关不通过物理连线传输信号
        if (fromComp.properties.wirelessMode) {
          return false;
        }
        return fromPowered && fromComp.properties.isOn;
      }
      
      return fromPowered;
    }
    
    return false;
  };

  // 判断网络连线是否应该显示
  const shouldShowNetworkConnection = (connection: Connection): boolean => {
    if (connection.type !== 'network') return true;
    
    // 检查是否有活跃信号
    const signalKey = `${connection.from}-${connection.to}`;
    const reverseKey = `${connection.to}-${connection.from}`;
    
    return activeSignals.get(signalKey) || activeSignals.get(reverseKey) || false;
  };

  // 渲染连线
  const renderConnections = () => {
    return connections.map(connection => {
      const fromComponent = componentMap.get(connection.from);
      const toComponent = componentMap.get(connection.to);

      if (!fromComponent || !toComponent) return null;

      // 网络连线只在有信号时显示
      if (connection.type === 'network' && !shouldShowNetworkConnection(connection)) {
        return null;
      }

      const startPoint = getConnectionPoints(
        fromComponent,
        connection.type,
        connection.fromPort || 'right'
      );
      const endPoint = getConnectionPoints(
        toComponent,
        connection.type,
        connection.toPort || 'left'
      );

      const signalActive = getConnectionSignalState(connection);

      return (
        <WireComponent
          key={connection.id}
          connection={{ ...connection, signalActive }}
          startPoint={startPoint}
          endPoint={endPoint}
        />
      );
    });
  };

  // 渲染临时连线（连线模式）
  const renderTempLine = () => {
    if (!tempLine || !connectionMode.wireType) return null;

    const color = connectionMode.wireType === 'live' ? '#E53935' 
                : connectionMode.wireType === 'neutral' ? '#64B5F6' 
                : '#1976D2';

    return (
      <line
        x1={tempLine.start.x}
        y1={tempLine.start.y}
        x2={tempLine.end.x}
        y2={tempLine.end.y}
        stroke={color}
        strokeWidth={2}
        strokeDasharray="5,5"
        opacity={0.7}
      />
    );
  };

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 800 500"
      style={{
        background: 'linear-gradient(135deg, #0D1B2A 0%, #1B263B 50%, #0D1B2A 100%)',
        borderRadius: '12px',
        outline: 'none',
        cursor: isPanning ? 'grabbing' : (connectionMode.isConnecting ? 'crosshair' : 'default'),
      }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onClick={(e) => {
        if (e.target === e.currentTarget && !connectionMode.isConnecting) {
          onSelectComponent(null);
        }
      }}
    >
      {/* 背景网格 */}
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path
            d="M 20 0 L 0 0 0 20"
            fill="none"
            stroke="#1E3A5F"
            strokeWidth="0.5"
            opacity="0.5"
          />
        </pattern>
        <pattern id="gridLarge" width="100" height="100" patternUnits="userSpaceOnUse">
          <rect width="100" height="100" fill="url(#grid)" />
          <path
            d="M 100 0 L 0 0 0 100"
            fill="none"
            stroke="#1E3A5F"
            strokeWidth="1"
            opacity="0.3"
          />
        </pattern>
        <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.3" />
        </filter>
      </defs>

      <rect width="100%" height="100%" fill="url(#gridLarge)" />

      {/* 可缩放平移的内容层 */}
      <g transform={`translate(${viewState.offsetX}, ${viewState.offsetY}) scale(${viewState.scale})`}>
        {/* 标题 */}
        <text
          x="20"
          y="30"
          fill="#64B5F6"
          fontSize="16"
          fontFamily="'SF Pro Display', -apple-system, sans-serif"
          fontWeight="600"
          opacity="0.8"
        >
          全屋智能电路图
        </text>

        {/* 操作提示 */}
        <text
          x="20"
          y="48"
          fill="#5A6B7D"
          fontSize="10"
          fontFamily="'SF Pro Display', -apple-system, sans-serif"
        >
          {connectionMode.isConnecting 
            ? `连线模式：点击端口完成${connectionMode.wireType === 'live' ? '火线' : connectionMode.wireType === 'neutral' ? '零线' : '网络'}连接` 
            : '拖拽移动 · Delete删除 · 滚轮缩放 · 中键平移'}
        </text>

        {/* 连线层 */}
        <g filter="url(#dropShadow)">
          {renderConnections()}
          {renderTempLine()}
        </g>

        {/* 组件层 */}
        <g filter="url(#dropShadow)">
          {components.map(renderComponent)}
        </g>
      </g>

      {/* 图例（固定位置，不随缩放） */}
      <g transform="translate(580, 15)">
        <text fill="#90A4AE" fontSize="10" fontFamily="'SF Pro Display', -apple-system, sans-serif">
          图例:
        </text>
        <line x1="30" y1="-3" x2="50" y2="-3" stroke="#E53935" strokeWidth="2" />
        <text x="55" fill="#90A4AE" fontSize="9">火线</text>
        <line x1="85" y1="-3" x2="105" y2="-3" stroke="#64B5F6" strokeWidth="2" />
        <text x="110" fill="#90A4AE" fontSize="9">零线</text>
        <line x1="140" y1="-3" x2="160" y2="-3" stroke="#1976D2" strokeWidth="2" strokeDasharray="4,2" />
        <text x="165" fill="#90A4AE" fontSize="9">网络</text>
      </g>
    </svg>
  );
}
