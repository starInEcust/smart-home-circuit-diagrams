// 组件基础类型
export interface BaseComponent {
  id: string;
  type: 'power' | 'light' | 'switch' | 'gateway';
  x: number;
  y: number;
}

// 电源组件
export interface PowerComponent extends BaseComponent {
  type: 'power';
  properties: {
    name: string;
    status: boolean;
    liveOutputs?: number;    // 火线输出数量
    neutralOutputs?: number; // 零线输出数量
  };
}

// 灯组件
export interface LightComponent extends BaseComponent {
  type: 'light';
  properties: {
    name: string;
    status: boolean;
    brightness: number;
    colorTemperature: number;
    onColor?: string;
    offColor?: string;
    isPowered?: boolean;       // 是否有电（由回路状态决定）
    wirelessMode?: boolean;    // 是否为无线模式（通过网关控制）
    gatewayId?: string;        // 关联的网关ID
  };
}

// 开关组件
export interface SwitchComponent extends BaseComponent {
  type: 'switch';
  properties: {
    name: string;
    isOn: boolean;
    type: '零火版' | '单火版' | '显示面板';
    additionalStatus?: string[];
    wirelessMode?: boolean;    // 是否为无线模式（通过网关控制灯具）
    gatewayId?: string;        // 关联的网关ID
    controlledLights?: string[]; // 无线模式下控制的灯具ID列表
  };
}

// 中枢网关组件
export interface GatewayComponent extends BaseComponent {
  type: 'gateway';
  properties: {
    name: string;
    status: boolean;
    connectedDevices?: string[]; // 已连接设备ID列表
    signalQueue?: SignalMessage[]; // 信号队列
  };
}

// 信号消息
export interface SignalMessage {
  id: string;
  from: string;       // 发送者ID
  to: string;         // 接收者ID
  command: 'on' | 'off' | 'toggle' | 'setBrightness' | 'setColorTemp';
  value?: number;     // 可选参数值
  timestamp: number;
}

// 联合类型
export type CircuitComponent = PowerComponent | LightComponent | SwitchComponent | GatewayComponent;

// 连线类型
export type WireType = 'live' | 'neutral' | 'network';

// 端口位置类型
export type PortPosition = 'left' | 'right' | 'top' | 'bottom' | string;

// 连接定义
export interface Connection {
  id: string;
  from: string;
  to: string;
  type: WireType;
  fromPort?: PortPosition;  // 起始端口位置
  toPort?: PortPosition;    // 终止端口位置
  path?: { x: number; y: number }[];
  signalActive?: boolean;
  signalSpeed?: number;
  isVirtual?: boolean;      // 是否为虚拟连线（网络信号）
}

// 电路图配置
export interface CircuitConfig {
  components: CircuitComponent[];
  connections: Connection[];
}

// 组件连接点位置
export interface ConnectionPoint {
  x: number;
  y: number;
}

// 线型颜色映射
export const WIRE_COLORS: Record<WireType, string> = {
  live: '#E53935',      // 火线 - 红色
  neutral: '#64B5F6',   // 零线 - 浅蓝色
  network: '#1976D2',   // 网络线 - 蓝色
};

// 组件尺寸常量
export const COMPONENT_SIZE = {
  width: 80,
  height: 60,
};

// 拖拽状态
export interface DragState {
  isDragging: boolean;
  componentId: string | null;
  offsetX: number;
  offsetY: number;
}

// 连线模式状态
export interface ConnectionMode {
  isConnecting: boolean;
  fromComponent: string | null;
  fromPort: PortPosition | null;
  wireType: WireType | null;
}

// 画布视图状态
export interface CanvasViewState {
  scale: number;
  offsetX: number;
  offsetY: number;
}

// 组件模板 - 用于添加新组件
export const COMPONENT_TEMPLATES = {
  power: {
    type: 'power' as const,
    properties: {
      name: '电源',
      status: true,
      liveOutputs: 3,
      neutralOutputs: 3,
    },
  },
  light: {
    type: 'light' as const,
    properties: {
      name: '灯',
      status: false,
      brightness: 80,
      colorTemperature: 4000,
      isPowered: false,
      wirelessMode: false,
    },
  },
  switch: {
    type: 'switch' as const,
    properties: {
      name: '开关',
      isOn: false,
      type: '零火版' as const,
      wirelessMode: false,
    },
  },
  gateway: {
    type: 'gateway' as const,
    properties: {
      name: '中枢网关',
      status: true,
      connectedDevices: [],
      signalQueue: [],
    },
  },
};

// 端口信息
export interface PortInfo {
  componentId: string;
  portId: string;
  portType: WireType;
  position: { x: number; y: number };
}

// 语音命令类型
export interface VoiceCommand {
  target: string;     // 目标设备名称或ID
  action: 'on' | 'off' | 'toggle' | 'setBrightness' | 'setColorTemp';
  value?: number;
}
