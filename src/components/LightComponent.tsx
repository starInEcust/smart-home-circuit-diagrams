import type { LightComponent as LightComponentType } from '../types';
import { COMPONENT_SIZE } from '../types';

interface Props {
  component: LightComponentType;
  onClick?: () => void;
  selected?: boolean;
}

// 根据色温计算颜色
function colorTemperatureToRGB(kelvin: number): string {
  const temp = kelvin / 100;
  let r: number, g: number, b: number;

  if (temp <= 66) {
    r = 255;
    g = Math.min(255, Math.max(0, 99.4708025861 * Math.log(temp) - 161.1195681661));
  } else {
    r = Math.min(255, Math.max(0, 329.698727446 * Math.pow(temp - 60, -0.1332047592)));
    g = Math.min(255, Math.max(0, 288.1221695283 * Math.pow(temp - 60, -0.0755148492)));
  }

  if (temp >= 66) {
    b = 255;
  } else if (temp <= 19) {
    b = 0;
  } else {
    b = Math.min(255, Math.max(0, 138.5177312231 * Math.log(temp - 10) - 305.0447927307));
  }

  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

export function LightComponent({ component, onClick, selected }: Props) {
  const { x, y, properties } = component;
  const { name, status, brightness, colorTemperature, onColor, offColor } = properties;
  const { width, height } = COMPONENT_SIZE;

  const lightColor = status
    ? (onColor || colorTemperatureToRGB(colorTemperature))
    : (offColor || '#4A4A4A');
  
  const opacity = status ? brightness / 100 : 0.3;
  const glowIntensity = status ? (brightness / 100) * 8 : 0;

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      {/* 滤镜定义 */}
      <defs>
        <filter id={`lightGlow-${component.id}`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation={glowIntensity} result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id={`bulbGradient-${component.id}`} cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor={status ? '#FFFFFF' : '#666666'} stopOpacity={status ? 0.9 : 0.3} />
          <stop offset="100%" stopColor={lightColor} stopOpacity={opacity} />
        </radialGradient>
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

      {/* 灯泡外圈光晕 */}
      {status && (
        <ellipse
          cx={width / 2}
          cy={height / 2 - 5}
          rx={28}
          ry={24}
          fill={lightColor}
          opacity={0.2}
          filter={`url(#lightGlow-${component.id})`}
        >
          <animate
            attributeName="opacity"
            values="0.15;0.25;0.15"
            dur="2s"
            repeatCount="indefinite"
          />
        </ellipse>
      )}

      {/* 灯座 */}
      <rect
        x={width / 2 - 12}
        y={height / 2 + 10}
        width={24}
        height={12}
        rx={2}
        fill="#37474F"
        stroke="#546E7A"
        strokeWidth={1}
      />

      {/* 灯泡主体 */}
      <ellipse
        cx={width / 2}
        cy={height / 2 - 5}
        rx={20}
        ry={18}
        fill={`url(#bulbGradient-${component.id})`}
        stroke={status ? lightColor : '#555555'}
        strokeWidth={2}
        filter={status ? `url(#lightGlow-${component.id})` : 'none'}
      >
        {status && (
          <animate
            attributeName="stroke-opacity"
            values="1;0.6;1"
            dur="3s"
            repeatCount="indefinite"
          />
        )}
      </ellipse>

      {/* 灯丝 */}
      <path
        d={`M${width / 2 - 6},${height / 2 - 2} 
            Q${width / 2 - 3},${height / 2 - 8} ${width / 2},${height / 2 - 2}
            Q${width / 2 + 3},${height / 2 + 4} ${width / 2 + 6},${height / 2 - 2}`}
        fill="none"
        stroke={status ? '#FFEB3B' : '#666666'}
        strokeWidth={1.5}
        opacity={status ? 0.8 : 0.3}
      />

      {/* 连接端口 - 左侧 */}
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

      {/* 参数显示 */}
      {status && (
        <text
          x={width / 2}
          y={height + 28}
          textAnchor="middle"
          fill="#BDBDBD"
          fontSize={9}
          fontFamily="'SF Pro Display', -apple-system, sans-serif"
        >
          {brightness}% · {colorTemperature}K
        </text>
      )}
    </g>
  );
}

