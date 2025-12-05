import type { PowerComponent as PowerComponentType } from '../types';
import { COMPONENT_SIZE } from '../types';

interface Props {
  component: PowerComponentType;
  onClick?: () => void;
  selected?: boolean;
}

export function PowerComponent({ component, onClick, selected }: Props) {
  const { x, y, properties } = component;
  const { name, status } = properties;
  const { width, height } = COMPONENT_SIZE;

  const statusColor = status ? '#4CAF50' : '#9E9E9E';
  const glowFilter = status ? 'url(#powerGlow)' : 'none';

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
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
        <linearGradient id="powerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#424242" />
          <stop offset="100%" stopColor="#212121" />
        </linearGradient>
      </defs>

      {/* 选中边框 */}
      {selected && (
        <rect
          x={-4}
          y={-4}
          width={width + 8}
          height={height + 8}
          rx={10}
          ry={10}
          fill="none"
          stroke="#2196F3"
          strokeWidth={2}
          strokeDasharray="5,3"
        />
      )}

      {/* 主体外壳 */}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        rx={6}
        ry={6}
        fill="url(#powerGradient)"
        stroke="#616161"
        strokeWidth={2}
      />

      {/* 电源符号 */}
      <g transform={`translate(${width / 2}, ${height / 2 - 5})`}>
        {/* 闪电图标 */}
        <path
          d="M0,-12 L6,0 L2,0 L2,12 L-4,0 L0,0 Z"
          fill={statusColor}
          filter={glowFilter}
        />
      </g>

      {/* 状态指示灯 */}
      <circle
        cx={width - 12}
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

      {/* 连接端口 - 右侧 */}
      <circle
        cx={width}
        cy={height / 2 - 8}
        r={4}
        fill="#E53935"
        stroke="#fff"
        strokeWidth={1}
      />
      <circle
        cx={width}
        cy={height / 2 + 8}
        r={4}
        fill="#64B5F6"
        stroke="#fff"
        strokeWidth={1}
      />

      {/* 名称标签 */}
      <text
        x={width / 2}
        y={height + 16}
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
        x={width / 2}
        y={height + 28}
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

