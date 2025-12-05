import type { Connection, WireType } from '../types';
import { WIRE_COLORS } from '../types';

interface Props {
  connection: Connection;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
}

// 生成平滑曲线路径
function generatePath(
  start: { x: number; y: number },
  end: { x: number; y: number }
): string {
  const midX = (start.x + end.x) / 2;
  
  // 使用贝塞尔曲线创建平滑连接
  if (Math.abs(end.x - start.x) > Math.abs(end.y - start.y)) {
    // 水平方向为主
    return `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`;
  } else {
    // 垂直方向为主
    const midY = (start.y + end.y) / 2;
    return `M ${start.x} ${start.y} C ${start.x} ${midY}, ${end.x} ${midY}, ${end.x} ${end.y}`;
  }
}

// 计算路径总长度（近似值）
function getPathLength(
  start: { x: number; y: number },
  end: { x: number; y: number }
): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  return Math.sqrt(dx * dx + dy * dy) * 1.2; // 曲线比直线长约20%
}

// 获取线型样式
function getWireStyle(type: WireType): { dashArray: string; opacity: number } {
  switch (type) {
    case 'network':
      return { dashArray: '8,4', opacity: 0.9 };
    case 'neutral':
      return { dashArray: '', opacity: 0.7 };
    case 'live':
    default:
      return { dashArray: '', opacity: 1 };
  }
}

export function WireComponent({ connection, startPoint, endPoint }: Props) {
  const { id, type, signalActive = true, signalSpeed = 5 } = connection;
  
  const pathD = generatePath(startPoint, endPoint);
  const pathLength = getPathLength(startPoint, endPoint);
  const wireColor = WIRE_COLORS[type];
  const wireStyle = getWireStyle(type);
  
  // 动画持续时间基于路径长度和速度
  const animationDuration = pathLength / (signalSpeed * 30);
  
  // 信号颜色
  const signalColor = type === 'live' ? '#FFEB3B' : 
                     type === 'neutral' ? '#90CAF9' : '#00E5FF';

  return (
    <g>
      {/* 滤镜定义 */}
      <defs>
        <filter id={`wireGlow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        {/* 脉冲信号渐变 */}
        <linearGradient id={`signalGradient-${id}`}>
          <stop offset="0%" stopColor={signalColor} stopOpacity="0" />
          <stop offset="40%" stopColor={signalColor} stopOpacity="1" />
          <stop offset="60%" stopColor={signalColor} stopOpacity="1" />
          <stop offset="100%" stopColor={signalColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* 线缆底层阴影 */}
      <path
        d={pathD}
        fill="none"
        stroke="#000"
        strokeWidth={5}
        strokeLinecap="round"
        opacity={0.2}
        transform="translate(1, 1)"
      />

      {/* 主线缆 */}
      <path
        d={pathD}
        fill="none"
        stroke={wireColor}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={wireStyle.dashArray}
        opacity={wireStyle.opacity}
      />

      {/* 线缆高光 */}
      <path
        d={pathD}
        fill="none"
        stroke="#fff"
        strokeWidth={1}
        strokeLinecap="round"
        strokeDasharray={wireStyle.dashArray}
        opacity={0.2}
      />

      {/* 脉冲信号动画 */}
      {signalActive && (
        <>
          {/* 信号光晕 */}
          <circle r={6} fill={signalColor} opacity={0.4} filter={`url(#wireGlow-${id})`}>
            <animateMotion
              dur={`${animationDuration}s`}
              repeatCount="indefinite"
              path={pathD}
            />
          </circle>
          
          {/* 信号核心 */}
          <circle r={3} fill={signalColor}>
            <animateMotion
              dur={`${animationDuration}s`}
              repeatCount="indefinite"
              path={pathD}
            />
            <animate
              attributeName="opacity"
              values="1;0.7;1"
              dur="0.5s"
              repeatCount="indefinite"
            />
          </circle>

          {/* 第二个信号点（延迟） */}
          <circle r={2} fill={signalColor} opacity={0.6}>
            <animateMotion
              dur={`${animationDuration}s`}
              repeatCount="indefinite"
              path={pathD}
              begin={`${animationDuration / 3}s`}
            />
          </circle>
        </>
      )}

      {/* 连接点高亮 */}
      <circle
        cx={startPoint.x}
        cy={startPoint.y}
        r={2}
        fill={wireColor}
        opacity={0.8}
      />
      <circle
        cx={endPoint.x}
        cy={endPoint.y}
        r={2}
        fill={wireColor}
        opacity={0.8}
      />
    </g>
  );
}

