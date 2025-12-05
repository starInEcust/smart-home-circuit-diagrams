// 组件基础类型
export interface BaseComponent {
  id: string;
  type: 'power' | 'light' | 'switch';
  x: number;
  y: number;
}

// 电源组件
export interface PowerComponent extends BaseComponent {
  type: 'power';
  properties: {
    name: string;
    status: boolean;
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
  };
}

// 开关组件
export interface SwitchComponent extends BaseComponent {
  type: 'switch';
  properties: {
    name: string;
    isOn: boolean;
    type: string;
    additionalStatus?: string[];
  };
}

// 联合类型
export type CircuitComponent = PowerComponent | LightComponent | SwitchComponent;

// 连线类型
export type WireType = 'live' | 'neutral' | 'network';

// 连接定义
export interface Connection {
  id: string;
  from: string;
  to: string;
  type: WireType;
  path?: { x: number; y: number }[];
  signalActive?: boolean;
  signalSpeed?: number;
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

