import type { SwitchComponent as SwitchComponentType } from '../types';
import { COMPONENT_SIZE } from '../types';

interface Props {
  component: SwitchComponentType;
  onClick?: () => void;
  selected?: boolean;
}

export function SwitchComponent({ component, onClick, selected }: Props) {
  const { x, y, properties } = component;
  const { name, isOn, type: switchType } = properties;
  const { width, height } = COMPONENT_SIZE;

  const statusColor = isOn ? '#4CAF50' : '#757575';
  const trackColor = isOn ? '#81C784' : '#424242';

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      {/* 滤镜定义 */}
      <defs>
        <filter id={`switchGlow-${component.id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={`switchBody-${component.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#37474F" />
          <stop offset="100%" stopColor="#263238" />
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

      {/* 开关外壳 */}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        rx={8}
        ry={8}
        fill={`url(#switchBody-${component.id})`}
        stroke="#455A64"
        strokeWidth={2}
      />

      {/* 开关类型标签 */}
      <rect
        x={width / 2 - 20}
        y={4}
        width={40}
        height={14}
        rx={3}
        fill="#1A237E"
        opacity={0.6}
      />
      <text
        x={width / 2}
        y={14}
        textAnchor="middle"
        fill="#90CAF9"
        fontSize={8}
        fontFamily="'SF Pro Display', -apple-system, sans-serif"
      >
        {switchType}
      </text>

      {/* 开关轨道 */}
      <rect
        x={width / 2 - 18}
        y={height / 2 - 6}
        width={36}
        height={12}
        rx={6}
        fill={trackColor}
        stroke="#2E7D32"
        strokeWidth={isOn ? 1 : 0}
      >
        {isOn && (
          <animate
            attributeName="fill-opacity"
            values="1;0.8;1"
            dur="2s"
            repeatCount="indefinite"
          />
        )}
      </rect>

      {/* 开关滑块 */}
      <circle
        cx={isOn ? width / 2 + 12 : width / 2 - 12}
        cy={height / 2}
        r={8}
        fill={statusColor}
        stroke="#fff"
        strokeWidth={2}
        filter={isOn ? `url(#switchGlow-${component.id})` : 'none'}
      >
        <animate
          attributeName="cx"
          from={isOn ? width / 2 - 12 : width / 2 + 12}
          to={isOn ? width / 2 + 12 : width / 2 - 12}
          dur="0.3s"
          fill="freeze"
        />
      </circle>

      {/* 状态指示点 */}
      <circle
        cx={width / 2 + (isOn ? 12 : -12)}
        cy={height / 2}
        r={3}
        fill={isOn ? '#fff' : '#424242'}
      />

      {/* 连接端口 - 左侧输入 */}
      <circle
        cx={0}
        cy={height / 2 - 8}
        r={4}
        fill="#E53935"
        stroke="#fff"
        strokeWidth={1}
      />
      <circle
        cx={0}
        cy={height / 2 + 8}
        r={4}
        fill="#64B5F6"
        stroke="#fff"
        strokeWidth={1}
      />

      {/* 连接端口 - 右侧输出 */}
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
        {isOn ? '已导通' : '已断开'}
      </text>
    </g>
  );
}

