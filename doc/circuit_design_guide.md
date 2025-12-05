# 全屋智能电路图设计配置规范

## 概述
本文档定义了全屋智能电路图的JSON配置规范，用于精确描述电路图的组件和连接关系。

## JSON配置结构
使用JSON格式定义整个电路图：

```json
{
  "components": [
    {
      "id": "power1",
      "type": "power",
      "x": 100,
      "y": 100,
      "properties": {
        "name": "主电源",
        "status": true
      }
    },
    {
      "id": "light1",
      "type": "light",
      "x": 300,
      "y": 150,
      "properties": {
        "name": "客厅灯",
        "status": false,
        "brightness": 80,
        "colorTemperature": 4000
      }
    },
    {
      "id": "switch1",
      "type": "switch",
      "x": 200,
      "y": 150,
      "properties": {
        "name": "客厅开关",
        "isOn": true,
        "type": "零火版"
      }
    }
  ],
  "connections": [
    {
      "id": "conn1",
      "from": "power1",
      "to": "switch1",
      "type": "live",
      "path": []
    },
    {
      "id": "conn2",
      "from": "switch1",
      "to": "light1",
      "type": "live",
      "path": []
    }
  ]
}
```

### 参数说明
- `components`：组件数组，定义电路图中所有的组件
  - `id`：组件唯一标识符
  - `type`：组件类型（power/light/switch）
  - `x, y`：组件在画布上的坐标
  - `properties`：组件特定属性（根据组件类型而定）
- `connections`：连接数组，定义组件间的连接关系
  - `id`：连接唯一标识符
  - `from`：起始组件ID
  - `to`：终止组件ID
  - `type`：连线类型（live/neutral/network）
  - `path`：可选手动指定连线路径点

## 组件详细规范

### 电源组件
- `type`: "power"
- 属性:
  - `name`: 电源名称
  - `status`: 供电状态(true/false)

### 灯组件
- `type`: "light"
- 属性:
  - `name`: 灯名称
  - `status`: 开关状态(true/false)
  - `brightness`: 亮度(0-100)
  - `colorTemperature`: 色温(单位K)

### 开关组件
- `type`: "switch"
- 属性:
  - `name`: 开关名称
  - `isOn`: 通断状态(true/false)
  - `type`: 开关类型(如"零火版")

## 连接线规范

### 火线(live)
- 用于传输电流的主要线路
- 颜色标识：红色

### 零线(neutral)
- 构成回路的返回线路
- 颜色标识：浅蓝色

### 网络线(network)
- 用于设备间通信的数据线路
- 颜色标识：蓝色

## 使用示例

### 简单照明电路
```json
{
  "components": [
    {
      "id": "power1",
      "type": "power",
      "x": 100,
      "y": 100,
      "properties": {
        "name": "主电源",
        "status": true
      }
    },
    {
      "id": "light1",
      "type": "light",
      "x": 300,
      "y": 100,
      "properties": {
        "name": "客厅灯",
        "status": true,
        "brightness": 90,
        "colorTemperature": 4000
      }
    }
  ],
  "connections": [
    {
      "id": "conn1",
      "from": "power1",
      "to": "light1",
      "type": "live",
      "path": []
    },
    {
      "id": "conn2",
      "from": "light1",
      "to": "power1",
      "type": "neutral",
      "path": []
    }
  ]
}
```

## 注意事项
- 所有ID必须唯一
- 坐标系统以左上角为原点(0,0)
- 连线必须在有效的组件之间建立
- 所有设计都应遵循电气安全规范