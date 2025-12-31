import type { SwitchComponent as SwitchComponentType } from '../types';

interface Props {
  component: SwitchComponentType;
  onClick?: () => void;
  selected?: boolean;
  onDragStart?: (e: React.MouseEvent) => void;
}

export function SwitchComponent({ component, onClick, selected, onDragStart }: Props) {
  const { x, y, properties } = component;
  const { name, isOn, type: switchType, wirelessMode } = properties;
  
  // 简洁尺寸
  const width = 100;
  const height = 80;

  // 判断开关类型
  const isZeroFire = switchType === '零火版';
  const isSingleFire = switchType === '单火版';
  
  // 颜色配置
  const liveColor = '#FF5252';      // 火线红
  const neutralColor = '#448AFF';   // 零线蓝
  const flowColor = '#FFEB3B';      // 电流黄
  const wirelessColor = '#00E5FF';

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDragStart?.(e);
  };

  // 电流粒子动画ID
  const flowId = `flow-${component.id}`;

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
      <defs>
        {/* 发光滤镜 */}
        <filter id={`glow-${component.id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        {/* 电流流动动画 */}
        <linearGradient id={`${flowId}-live`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={liveColor} stopOpacity="0.3">
            <animate attributeName="offset" values="-0.3;1" dur="0.8s" repeatCount="indefinite" />
          </stop>
          <stop offset="15%" stopColor={flowColor} stopOpacity="1">
            <animate attributeName="offset" values="-0.15;1.15" dur="0.8s" repeatCount="indefinite" />
          </stop>
          <stop offset="30%" stopColor={liveColor} stopOpacity="0.3">
            <animate attributeName="offset" values="0;1.3" dur="0.8s" repeatCount="indefinite" />
          </stop>
        </linearGradient>

        {/* 零线电流动画 */}
        <linearGradient id={`${flowId}-neutral`} x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={neutralColor} stopOpacity="0.3">
            <animate attributeName="offset" values="-0.3;1" dur="0.8s" repeatCount="indefinite" />
          </stop>
          <stop offset="15%" stopColor="#82B1FF" stopOpacity="1">
            <animate attributeName="offset" values="-0.15;1.15" dur="0.8s" repeatCount="indefinite" />
          </stop>
          <stop offset="30%" stopColor={neutralColor} stopOpacity="0.3">
            <animate attributeName="offset" values="0;1.3" dur="0.8s" repeatCount="indefinite" />
          </stop>
        </linearGradient>
      </defs>

      {/* 选中边框 */}
      {selected && (
        <rect
          x={-3}
          y={-3}
          width={width + 6}
          height={height + 6}
          rx={10}
          fill="none"
          stroke="#2196F3"
          strokeWidth={2}
          strokeDasharray="5,3"
        >
          <animate attributeName="stroke-dashoffset" from="0" to="16" dur="0.8s" repeatCount="indefinite" />
        </rect>
      )}

      {/* ====== 外壳 - 半透明玻璃效果 ====== */}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        rx={8}
        fill={wirelessMode ? 'rgba(13, 71, 161, 0.85)' : 'rgba(38, 50, 56, 0.9)'}
        stroke={wirelessMode ? wirelessColor : isSingleFire ? '#7B1FA2' : '#455A64'}
        strokeWidth={2}
      />
      
      {/* 玻璃高光 */}
      <rect x={3} y={3} width={width - 6} height={12} rx={5} fill="white" opacity={0.08} />

      {/* ====== 类型标签 ====== */}
      <rect
        x={4}
        y={4}
        width={isSingleFire ? 28 : 28}
        height={14}
        rx={4}
        fill={isSingleFire ? '#7B1FA2' : '#1565C0'}
      />
      <text x={18} y={14} textAnchor="middle" fill="#fff" fontSize={8} fontWeight="600">
        {isSingleFire ? '单火' : '零火'}
      </text>

      {/* ====== ON/OFF 开关 ====== */}
      <g transform={`translate(${width - 38}, 4)`}>
        <rect x={0} y={0} width={34} height={14} rx={7} fill={isOn ? '#2E7D32' : '#424242'} />
        <circle
          cx={isOn ? 27 : 7}
          cy={7}
          r={5}
          fill={isOn ? '#4CAF50' : '#757575'}
          stroke="#fff"
          strokeWidth={1}
          filter={isOn ? `url(#glow-${component.id})` : 'none'}
        />
        <text x={isOn ? 10 : 22} y={10} textAnchor="middle" fill="#fff" fontSize={6} opacity={0.8}>
          {isOn ? 'ON' : 'OFF'}
        </text>
      </g>

      {/* ====== 内部电路区域 ====== */}
      <rect x={6} y={22} width={width - 12} height={height - 42} rx={4} fill="rgba(0,0,0,0.4)" />

      {/* ====== 零火版内部结构 ====== */}
      {isZeroFire && (
        <g>
          {/* ===== 火线路径（受继电器控制） ===== */}
          {/* 火线入口到继电器 - 始终有电 */}
          <path
            d={`M 0,${height/2 - 8} L 15,${height/2 - 8} L 15,35 L 32,35`}
            fill="none"
            stroke={liveColor}
            strokeWidth={2.5}
            strokeLinecap="round"
            opacity={0.8}
          />
          {/* 入口段电流动画 - 始终流动 */}
          <circle r={3} fill={flowColor} filter={`url(#glow-${component.id})`}>
            <animateMotion
              path={`M 0,${height/2 - 8} L 15,${height/2 - 8} L 15,35 L 32,35`}
              dur="0.6s"
              repeatCount="indefinite"
            />
          </circle>
          
          {/* 继电器到出口 - 仅开关打开时有电 */}
          <path
            d={`M 68,35 L 85,35 L 85,${height/2 - 8} L ${width},${height/2 - 8}`}
            fill="none"
            stroke={liveColor}
            strokeWidth={isOn ? 2.5 : 2}
            strokeLinecap="round"
            opacity={isOn ? 0.8 : 0.25}
          />
          {/* 出口段电流动画 - 仅开关打开时 */}
          {isOn && (
            <>
              <circle r={3} fill={flowColor} filter={`url(#glow-${component.id})`}>
                <animateMotion
                  path={`M 68,35 L 85,35 L 85,${height/2 - 8} L ${width},${height/2 - 8}`}
                  dur="0.6s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle r={3} fill={flowColor} filter={`url(#glow-${component.id})`}>
                <animateMotion
                  path={`M 68,35 L 85,35 L 85,${height/2 - 8} L ${width},${height/2 - 8}`}
                  dur="0.6s"
                  begin="0.3s"
                  repeatCount="indefinite"
                />
              </circle>
            </>
          )}
          
          {/* 继电器模块 */}
          <g transform="translate(32, 28)">
            {/* 继电器外壳 - 始终通电所以亮起 */}
            <rect x={0} y={0} width={36} height={18} rx={3} fill="#1565C0" stroke="#42A5F5" strokeWidth={1.5} />
            <text x={18} y={12} textAnchor="middle" fill="#E3F2FD" fontSize={7} fontWeight="600">继电器</text>
            {/* 继电器触点状态：绿=闭合导通，红=断开 */}
            <circle cx={30} cy={5} r={3} fill={isOn ? '#4CAF50' : '#F44336'}>
              <animate attributeName="opacity" values="1;0.6;1" dur="1s" repeatCount="indefinite" />
            </circle>
            {/* 继电器内部触点示意 */}
            <line 
              x1={8} y1={9} 
              x2={isOn ? 28 : 20} y2={isOn ? 9 : 5} 
              stroke={isOn ? '#4CAF50' : '#F44336'} 
              strokeWidth={2} 
              strokeLinecap="round"
            />
          </g>

          {/* ===== 零线路径（始终通电，给芯片供电） ===== */}
          <path
            d={`M 0,${height/2 + 8} L 20,${height/2 + 8} L 20,${height - 22} L 80,${height - 22} L 80,${height/2 + 8} L ${width},${height/2 + 8}`}
            fill="none"
            stroke={neutralColor}
            strokeWidth={2.5}
            strokeLinecap="round"
            opacity={0.7}
          />

          {/* 零线电流动画 - 始终流动（给开关供电） */}
          <circle r={3} fill="#82B1FF" filter={`url(#glow-${component.id})`}>
            <animateMotion
              path={`M 0,${height/2 + 8} L 20,${height/2 + 8} L 20,${height - 22} L 50,${height - 22}`}
              dur="0.8s"
              repeatCount="indefinite"
            />
          </circle>
          <circle r={3} fill="#82B1FF" filter={`url(#glow-${component.id})`}>
            <animateMotion
              path={`M 50,${height - 22} L 80,${height - 22} L 80,${height/2 + 8} L ${width},${height/2 + 8}`}
              dur="0.8s"
              repeatCount="indefinite"
            />
          </circle>
          {/* 第二组零线粒子（错开时间） */}
          <circle r={2.5} fill="#448AFF" filter={`url(#glow-${component.id})`}>
            <animateMotion
              path={`M 0,${height/2 + 8} L 20,${height/2 + 8} L 20,${height - 22} L 50,${height - 22}`}
              dur="0.8s"
              begin="0.4s"
              repeatCount="indefinite"
            />
          </circle>

          {/* 电源模块（始终工作） */}
          <g transform={`translate(35, ${height - 30})`}>
            <rect x={0} y={0} width={30} height={12} rx={2} fill="#37474F" stroke="#4FC3F7" strokeWidth={1} />
            <text x={15} y={9} textAnchor="middle" fill="#B3E5FC" fontSize={6}>电源</text>
            {/* 电源工作指示灯 */}
            <circle cx={26} cy={3} r={2} fill="#4CAF50">
              <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* 火线到电源的分支（给芯片供电） */}
          <path
            d={`M 15,35 L 15,${height - 24} L 35,${height - 24}`}
            fill="none"
            stroke={liveColor}
            strokeWidth={1.5}
            strokeLinecap="round"
            opacity={0.5}
            strokeDasharray="3,2"
          />
          <circle r={2} fill="#FF8A80">
            <animateMotion
              path={`M 15,35 L 15,${height - 24} L 35,${height - 24}`}
              dur="0.6s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      )}

      {/* ====== 单火版内部结构 ====== */}
      {isSingleFire && (
        <g>
          {/* ===== 火线入口段（始终有电） ===== */}
          <path
            d={`M 0,${height/2} L 18,${height/2} L 18,35 L 35,35`}
            fill="none"
            stroke={liveColor}
            strokeWidth={2.5}
            strokeLinecap="round"
            opacity={0.8}
          />
          {/* 入口段电流 - 始终流动 */}
          <circle r={3} fill={flowColor} filter={`url(#glow-${component.id})`}>
            <animateMotion
              path={`M 0,${height/2} L 18,${height/2} L 18,35 L 35,35`}
              dur="0.5s"
              repeatCount="indefinite"
            />
          </circle>
          
          {/* ===== 可控硅到出口（仅导通时有电） ===== */}
          <path
            d={`M 65,35 L 82,35 L 82,${height/2} L ${width},${height/2}`}
            fill="none"
            stroke={liveColor}
            strokeWidth={isOn ? 2.5 : 2}
            strokeLinecap="round"
            opacity={isOn ? 0.8 : 0.25}
          />
          {/* 出口段电流 - 仅导通时 */}
          {isOn && (
            <>
              <circle r={3} fill={flowColor} filter={`url(#glow-${component.id})`}>
                <animateMotion
                  path={`M 65,35 L 82,35 L 82,${height/2} L ${width},${height/2}`}
                  dur="0.5s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle r={3} fill={flowColor} filter={`url(#glow-${component.id})`}>
                <animateMotion
                  path={`M 65,35 L 82,35 L 82,${height/2} L ${width},${height/2}`}
                  dur="0.5s"
                  begin="0.25s"
                  repeatCount="indefinite"
                />
              </circle>
            </>
          )}
          
          {/* 可控硅模块 */}
          <g transform="translate(35, 28)">
            {/* 可控硅外壳 - 始终通电（控制芯片工作） */}
            <rect x={0} y={0} width={30} height={18} rx={3} fill="#6A1B9A" stroke="#AB47BC" strokeWidth={1.5} />
            <text x={15} y={12} textAnchor="middle" fill="#F3E5F5" fontSize={7} fontWeight="600">可控硅</text>
            {/* 可控硅导通状态 */}
            <circle cx={25} cy={5} r={2.5} fill={isOn ? '#4CAF50' : '#F44336'}>
              <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite" />
            </circle>
            {/* 可控硅触发指示 */}
            {isOn && (
              <line x1={5} y1={9} x2={25} y2={9} stroke="#4CAF50" strokeWidth={2} strokeLinecap="round">
                <animate attributeName="opacity" values="1;0.7;1" dur="0.3s" repeatCount="indefinite" />
              </line>
            )}
          </g>

          {/* ===== 取电支路（始终工作 - 偷电给芯片） ===== */}
          <path
            d={`M 18,${height/2} L 18,${height - 18} L 50,${height - 18}`}
            fill="none"
            stroke="#FF9800"
            strokeWidth={2}
            strokeDasharray="4,3"
            opacity={0.7}
          >
            <animate attributeName="stroke-dashoffset" from="14" to="0" dur="0.4s" repeatCount="indefinite" />
          </path>
          
          {/* 取电电流 - 始终流动（偷电给芯片供电） */}
          <circle r={2.5} fill="#FFB74D" filter={`url(#glow-${component.id})`}>
            <animateMotion
              path={`M 18,${height/2} L 18,${height - 18} L 50,${height - 18}`}
              dur="0.6s"
              repeatCount="indefinite"
            />
          </circle>
          <circle r={2} fill="#FFA726" filter={`url(#glow-${component.id})`}>
            <animateMotion
              path={`M 18,${height/2} L 18,${height - 18} L 50,${height - 18}`}
              dur="0.6s"
              begin="0.3s"
              repeatCount="indefinite"
            />
          </circle>

          {/* 取电电路模块 */}
          <g transform={`translate(35, ${height - 28})`}>
            <rect x={0} y={0} width={30} height={12} rx={2} fill="#E65100" stroke="#FF9800" strokeWidth={1} />
            <text x={15} y={9} textAnchor="middle" fill="#FFF3E0" fontSize={6}>取电</text>
            {/* 取电电路工作指示灯 */}
            <circle cx={26} cy={3} r={2} fill="#4CAF50">
              <animate attributeName="opacity" values="1;0.4;1" dur="0.8s" repeatCount="indefinite" />
            </circle>
          </g>
          
          {/* 取电回流路径（经过负载回来的微弱电流） */}
          <path
            d={`M 65,${height - 22} L 82,${height - 22} L 82,45`}
            fill="none"
            stroke="#FF9800"
            strokeWidth={1}
            strokeDasharray="2,2"
            opacity={0.4}
          />
        </g>
      )}

      {/* ====== 端口标识 ====== */}
      {!wirelessMode && (
        <>
          {/* 左侧火线输入 */}
          <circle cx={0} cy={isZeroFire ? height/2 - 8 : height/2} r={5} fill={liveColor} stroke="#fff" strokeWidth={1.5} />
          <text x={-12} y={isZeroFire ? height/2 - 5 : height/2 + 3} textAnchor="middle" fill={liveColor} fontSize={8} fontWeight="600">L</text>
          
          {/* 左侧零线输入 - 仅零火版 */}
          {isZeroFire && (
            <>
              <circle cx={0} cy={height/2 + 8} r={5} fill={neutralColor} stroke="#fff" strokeWidth={1.5} />
              <text x={-12} y={height/2 + 11} textAnchor="middle" fill={neutralColor} fontSize={8} fontWeight="600">N</text>
            </>
          )}

          {/* 右侧火线输出 */}
          <circle cx={width} cy={isZeroFire ? height/2 - 8 : height/2} r={5} fill={liveColor} stroke="#fff" strokeWidth={1.5} />
          <text x={width + 12} y={isZeroFire ? height/2 - 5 : height/2 + 3} textAnchor="middle" fill={liveColor} fontSize={8} fontWeight="600">L'</text>
          
          {/* 右侧零线输出 - 仅零火版 */}
          {isZeroFire && (
            <>
              <circle cx={width} cy={height/2 + 8} r={5} fill={neutralColor} stroke="#fff" strokeWidth={1.5} />
              <text x={width + 12} y={height/2 + 11} textAnchor="middle" fill={neutralColor} fontSize={8} fontWeight="600">N'</text>
            </>
          )}
        </>
      )}

      {/* 网络端口 */}
      <circle cx={width/2} cy={0} r={4} fill="#1976D2" stroke="#fff" strokeWidth={1}>
        {wirelessMode && isOn && (
          <animate attributeName="r" values="4;6;4" dur="1s" repeatCount="indefinite" />
        )}
      </circle>

      {/* 无线信号 */}
      {wirelessMode && isOn && (
        <g transform={`translate(${width/2}, -8)`}>
          {[0, 1, 2].map(i => (
            <path
              key={i}
              d={`M ${-6 - i*4},${-2 - i*3} Q ${0},${-8 - i*4} ${6 + i*4},${-2 - i*3}`}
              fill="none"
              stroke={wirelessColor}
              strokeWidth={1.5}
              opacity={0.6}
            >
              <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1s" begin={`${i * 0.2}s`} repeatCount="indefinite" />
            </path>
          ))}
        </g>
      )}

      {/* 名称 */}
      <text x={width/2} y={height + 14} textAnchor="middle" fill="#E0E0E0" fontSize={11} fontWeight="500">
        {name}
      </text>

      {/* 状态 */}
      <text
        x={width/2}
        y={height + 26}
        textAnchor="middle"
        fill={isOn ? '#4CAF50' : '#757575'}
        fontSize={9}
      >
        {wirelessMode 
          ? (isOn ? '📶 无线控制中' : '待命') 
          : (isOn ? '⚡ 导通' : '断开')
        }
      </text>
    </g>
  );
}
