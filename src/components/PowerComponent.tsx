import type { PowerComponent as PowerComponentType } from '../types';
import { COMPONENT_SIZE } from '../types';

interface Props {
  component: PowerComponentType;
  onClick?: () => void;
  selected?: boolean;
  onDragStart?: (e: React.MouseEvent) => void;
}

export function PowerComponent({ component, onClick, selected, onDragStart }: Props) {
  const { x, y, properties } = component;
  const { name, status, liveOutputs = 3, neutralOutputs = 3 } = properties;
  const { width } = COMPONENT_SIZE;
  
  // 根据输出数量动态计算高度
  const maxOutputs = Math.max(liveOutputs, neutralOutputs);
  const dynamicHeight = Math.max(60, maxOutputs * 20 + 20);

  const statusColor = status ? '#4CAF50' : '#9E9E9E';
  const glowFilter = status ? 'url(#powerGlow)' : 'none';

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDragStart?.(e);
  };

  // 生成火线输出端口
  const renderLiveOutputs = () => {
    const ports = [];
    const spacing = (dynamicHeight - 20) / (liveOutputs + 1);
    for (let i = 0; i < liveOutputs; i++) {
      ports.push(
        <g key={`live-${i}`}>
          <circle
            cx={width}
            cy={10 + spacing * (i + 1)}
            r={4}
            fill="#E53935"
            stroke="#fff"
            strokeWidth={1}
          />
          <text
            x={width + 8}
            y={10 + spacing * (i + 1) + 3}
            fill="#E53935"
            fontSize={7}
            fontFamily="monospace"
          >
            L{i + 1}
          </text>
        </g>
      );
    }
    return ports;
  };

  // 生成零线输出端口
  const renderNeutralOutputs = () => {
    const ports = [];
    const spacing = (dynamicHeight - 20) / (neutralOutputs + 1);
    for (let i = 0; i < neutralOutputs; i++) {
      ports.push(
        <g key={`neutral-${i}`}>
          <circle
            cx={width}
            cy={10 + spacing * (i + 1)}
            r={4}
            fill="#64B5F6"
            stroke="#fff"
            strokeWidth={1}
            transform={`translate(15, 0)`}
          />
          <text
            x={width + 28}
            y={10 + spacing * (i + 1) + 3}
            fill="#64B5F6"
            fontSize={7}
            fontFamily="monospace"
          >
            N{i + 1}
          </text>
        </g>
      );
    }
    return ports;
  };

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onMouseDown={handleMouseDown}
      style={{ cursor: 'move' }}
    >
      {/* 发光滤镜定义 */}
      <defs>
        <filter id="powerGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={`powerGradient-${component.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#424242" />
          <stop offset="100%" stopColor="#212121" />
        </linearGradient>
      </defs>

      {/* 选中边框 */}
      {selected && (
        <rect
          x={-4}
          y={-4}
          width={width + 48}
          height={dynamicHeight + 8}
          rx={10}
          ry={10}
          fill="none"
          stroke="#2196F3"
          strokeWidth={2}
          strokeDasharray="5,3"
        />
      )}

      {/* 主体外壳 - 扩展宽度以容纳双排端口 */}
      <rect
        x={0}
        y={0}
        width={width + 40}
        height={dynamicHeight}
        rx={6}
        ry={6}
        fill={`url(#powerGradient-${component.id})`}
        stroke="#616161"
        strokeWidth={2}
      />

      {/* 电源标识区域 */}
      <rect
        x={5}
        y={5}
        width={width - 10}
        height={dynamicHeight - 10}
        rx={4}
        fill="#1B1B1B"
        opacity={0.5}
      />

      {/* 电源符号 */}
      <g transform={`translate(${width / 2}, ${dynamicHeight / 2})`}>
        {/* 闪电图标 */}
        <path
          d="M0,-15 L8,0 L3,0 L3,15 L-5,0 L0,0 Z"
          fill={statusColor}
          filter={glowFilter}
        />
      </g>

      {/* 电压标识 */}
      <text
        x={width / 2}
        y={dynamicHeight - 8}
        textAnchor="middle"
        fill="#757575"
        fontSize={8}
        fontFamily="monospace"
      >
        220V AC
      </text>

      {/* 状态指示灯 */}
      <circle
        cx={width - 10}
        cy={12}
        r={4}
        fill={statusColor}
        filter={glowFilter}
      >
        {status && (
          <animate
            attributeName="opacity"
            values="1;0.5;1"
            dur="2s"
            repeatCount="indefinite"
          />
        )}
      </circle>

      {/* 火线输出端口列 */}
      <g>
        <text
          x={width + 4}
          y={8}
          fill="#E53935"
          fontSize={8}
          fontWeight="bold"
        >
          L
        </text>
        {renderLiveOutputs()}
      </g>

      {/* 零线输出端口列 */}
      <g>
        <text
          x={width + 20}
          y={8}
          fill="#64B5F6"
          fontSize={8}
          fontWeight="bold"
        >
          N
        </text>
        {renderNeutralOutputs()}
      </g>

      {/* 名称标签 */}
      <text
        x={(width + 40) / 2}
        y={dynamicHeight + 16}
        textAnchor="middle"
        fill="#E0E0E0"
        fontSize={11}
        fontFamily="'SF Pro Display', -apple-system, sans-serif"
        fontWeight={500}
      >
        {name}
      </text>

      {/* 状态文字 */}
      <text
        x={(width + 40) / 2}
        y={dynamicHeight + 28}
        textAnchor="middle"
        fill={statusColor}
        fontSize={9}
        fontFamily="'SF Pro Display', -apple-system, sans-serif"
      >
        {status ? '供电中' : '已断电'}
      </text>
    </g>
  );
}
