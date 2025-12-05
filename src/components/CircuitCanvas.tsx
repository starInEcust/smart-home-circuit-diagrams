import type { CircuitConfig, CircuitComponent } from '../types';
import { COMPONENT_SIZE } from '../types';
import { PowerComponent } from './PowerComponent';
import { LightComponent } from './LightComponent';
import { SwitchComponent } from './SwitchComponent';
import { WireComponent } from './WireComponent';

interface Props {
  config: CircuitConfig;
  selectedComponentId: string | null;
  onSelectComponent: (id: string | null) => void;
}

// 计算组件的连接点位置
function getConnectionPoints(component: CircuitComponent, wireType: 'live' | 'neutral' | 'network') {
  const { x, y, type } = component;
  const { width, height } = COMPONENT_SIZE;
  
  const yOffset = wireType === 'live' || wireType === 'network' ? -8 : 8;
  
  // 根据组件类型决定连接点位置
  if (type === 'power') {
    // 电源只有右侧输出
    return {
      input: { x: x + width, y: y + height / 2 + yOffset },
      output: { x: x + width, y: y + height / 2 + yOffset }
    };
  } else if (type === 'light') {
    // 灯只有左侧输入
    return {
      input: { x: x, y: y + height / 2 + yOffset },
      output: { x: x, y: y + height / 2 + yOffset }
    };
  } else {
    // 开关有左侧输入和右侧输出
    return {
      input: { x: x, y: y + height / 2 + yOffset },
      output: { x: x + width, y: y + height / 2 + yOffset }
    };
  }
}

export function CircuitCanvas({ config, selectedComponentId, onSelectComponent }: Props) {
  const { components, connections } = config;

  // 构建组件映射
  const componentMap = new Map(components.map(c => [c.id, c]));

  // 渲染单个组件
  const renderComponent = (component: CircuitComponent) => {
    const isSelected = selectedComponentId === component.id;
    const handleClick = () => onSelectComponent(component.id);

    switch (component.type) {
      case 'power':
        return (
          <PowerComponent
            key={component.id}
            component={component}
            onClick={handleClick}
            selected={isSelected}
          />
        );
      case 'light':
        return (
          <LightComponent
            key={component.id}
            component={component}
            onClick={handleClick}
            selected={isSelected}
          />
        );
      case 'switch':
        return (
          <SwitchComponent
            key={component.id}
            component={component}
            onClick={handleClick}
            selected={isSelected}
          />
        );
      default:
        return null;
    }
  };

  // 渲染连线
  const renderConnections = () => {
    return connections.map(connection => {
      const fromComponent = componentMap.get(connection.from);
      const toComponent = componentMap.get(connection.to);

      if (!fromComponent || !toComponent) return null;

      const fromPoints = getConnectionPoints(fromComponent, connection.type);
      const toPoints = getConnectionPoints(toComponent, connection.type);

      return (
        <WireComponent
          key={connection.id}
          connection={connection}
          startPoint={fromPoints.output}
          endPoint={toPoints.input}
        />
      );
    });
  };

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 800 500"
      style={{ 
        background: 'linear-gradient(135deg, #0D1B2A 0%, #1B263B 50%, #0D1B2A 100%)',
        borderRadius: '12px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
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
        
        {/* 全局滤镜 */}
        <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.3" />
        </filter>
      </defs>
      
      <rect width="100%" height="100%" fill="url(#gridLarge)" />

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

      {/* 图例 */}
      <g transform="translate(620, 15)">
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

      {/* 连线层 - 先渲染以便在组件下方 */}
      <g filter="url(#dropShadow)">
        {renderConnections()}
      </g>

      {/* 组件层 */}
      <g filter="url(#dropShadow)">
        {components.map(renderComponent)}
      </g>
    </svg>
  );
}

