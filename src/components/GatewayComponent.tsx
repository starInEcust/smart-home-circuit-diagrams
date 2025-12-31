import type { GatewayComponent as GatewayComponentType } from '../types';
import { COMPONENT_SIZE } from '../types';

interface Props {
  component: GatewayComponentType;
  onClick?: () => void;
  selected?: boolean;
  onDragStart?: (e: React.MouseEvent) => void;
}

export function GatewayComponent({ component, onClick, selected, onDragStart }: Props) {
  const { x, y, properties } = component;
  const { name, status } = properties;
  const { width, height } = COMPONENT_SIZE;

  const statusColor = status ? '#00E5FF' : '#757575';

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDragStart?.(e);
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
      {/* 滤镜定义 */}
      <defs>
        <filter id={`gatewayGlow-${component.id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={`gatewayGradient-${component.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1A237E" />
          <stop offset="100%" stopColor="#0D1B2A" />
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

      {/* 主体外壳 - 六边形 */}
      <path
        d={`M ${width/2} 0 
            L ${width} ${height * 0.25} 
            L ${width} ${height * 0.75} 
            L ${width/2} ${height} 
            L 0 ${height * 0.75} 
            L 0 ${height * 0.25} Z`}
        fill={`url(#gatewayGradient-${component.id})`}
        stroke={status ? '#00E5FF' : '#455A64'}
        strokeWidth={2}
      />

      {/* 内部电路图案 */}
      <g opacity={0.6}>
        <circle cx={width/2} cy={height/2} r={12} fill="none" stroke={statusColor} strokeWidth={1} />
        <circle cx={width/2} cy={height/2} r={6} fill={statusColor} opacity={0.5}>
          {status && (
            <animate
              attributeName="opacity"
              values="0.3;0.8;0.3"
              dur="2s"
              repeatCount="indefinite"
            />
          )}
        </circle>
        {/* 连接线 */}
        <line x1={width/2} y1={height/2 - 12} x2={width/2} y2={8} stroke={statusColor} strokeWidth={1} />
        <line x1={width/2} y1={height/2 + 12} x2={width/2} y2={height - 8} stroke={statusColor} strokeWidth={1} />
        <line x1={width/2 - 12} y1={height/2} x2={12} y2={height/2} stroke={statusColor} strokeWidth={1} />
        <line x1={width/2 + 12} y1={height/2} x2={width - 12} y2={height/2} stroke={statusColor} strokeWidth={1} />
      </g>

      {/* WiFi/网络图标 */}
      <g transform={`translate(${width/2}, ${height/2 - 3})`} opacity={status ? 1 : 0.3}>
        <path
          d="M-8,-2 Q0,-8 8,-2"
          fill="none"
          stroke={statusColor}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <path
          d="M-5,1 Q0,-3 5,1"
          fill="none"
          stroke={statusColor}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <circle cx={0} cy={4} r={2} fill={statusColor} />
      </g>

      {/* 状态指示灯 */}
      <circle
        cx={width - 10}
        cy={height * 0.25 + 5}
        r={3}
        fill={statusColor}
        filter={status ? `url(#gatewayGlow-${component.id})` : 'none'}
      >
        {status && (
          <animate
            attributeName="opacity"
            values="1;0.4;1"
            dur="1.5s"
            repeatCount="indefinite"
          />
        )}
      </circle>

      {/* 网络连接端口 - 四个方向 */}
      {/* 上 */}
      <circle
        cx={width / 2}
        cy={0}
        r={4}
        fill="#1976D2"
        stroke="#fff"
        strokeWidth={1}
      />
      {/* 下 */}
      <circle
        cx={width / 2}
        cy={height}
        r={4}
        fill="#1976D2"
        stroke="#fff"
        strokeWidth={1}
      />
      {/* 左 */}
      <circle
        cx={0}
        cy={height / 2}
        r={4}
        fill="#1976D2"
        stroke="#fff"
        strokeWidth={1}
      />
      {/* 右 */}
      <circle
        cx={width}
        cy={height / 2}
        r={4}
        fill="#1976D2"
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
        {status ? '在线' : '离线'}
      </text>
    </g>
  );
}

