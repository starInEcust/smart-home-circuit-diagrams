import { useState } from 'react';
import type { VoiceCommand } from '../types';

interface Props {
  onAddComponent: (type: 'power' | 'light' | 'switch' | 'gateway') => void;
  onStartConnection: (wireType: 'live' | 'neutral' | 'network') => void;
  onCancelConnection: () => void;
  isConnecting: boolean;
  connectionWireType: 'live' | 'neutral' | 'network' | null;
  onVoiceCommand: (command: VoiceCommand) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  scale: number;
}

export function Toolbar({
  onAddComponent,
  onStartConnection,
  onCancelConnection,
  isConnecting,
  connectionWireType,
  onVoiceCommand,
  onZoomIn,
  onZoomOut,
  onResetView,
  scale,
}: Props) {
  const [voiceInput, setVoiceInput] = useState('');
  const [showVoicePanel, setShowVoicePanel] = useState(false);

  // 解析语音命令
  const parseVoiceCommand = (input: string): VoiceCommand | null => {
    const lowerInput = input.toLowerCase();
    
    // 匹配模式: "打开/关闭 [设备名]"
    const onMatch = lowerInput.match(/打开\s*(.+)/);
    const offMatch = lowerInput.match(/关闭\s*(.+)/);
    const brightnessMatch = lowerInput.match(/(.+)\s*亮度\s*(\d+)/);
    const colorTempMatch = lowerInput.match(/(.+)\s*色温\s*(\d+)/);

    if (brightnessMatch) {
      return {
        target: brightnessMatch[1].trim(),
        action: 'setBrightness',
        value: parseInt(brightnessMatch[2]),
      };
    }
    if (colorTempMatch) {
      return {
        target: colorTempMatch[1].trim(),
        action: 'setColorTemp',
        value: parseInt(colorTempMatch[2]),
      };
    }
    if (onMatch) {
      return { target: onMatch[1].trim(), action: 'on' };
    }
    if (offMatch) {
      return { target: offMatch[1].trim(), action: 'off' };
    }

    return null;
  };

  const handleVoiceSubmit = () => {
    const command = parseVoiceCommand(voiceInput);
    if (command) {
      onVoiceCommand(command);
      setVoiceInput('');
    }
  };

  return (
    <div className="toolbar">
      {/* 组件添加区 */}
      <div className="toolbar-section">
        <h3>📦 添加组件</h3>
        <div className="toolbar-buttons">
          <button
            className="toolbar-btn"
            onClick={() => onAddComponent('power')}
            title="添加电源"
          >
            <span className="toolbar-icon">⚡</span>
            <span>电源</span>
          </button>
          <button
            className="toolbar-btn"
            onClick={() => onAddComponent('switch')}
            title="添加开关"
          >
            <span className="toolbar-icon">🔘</span>
            <span>开关</span>
          </button>
          <button
            className="toolbar-btn"
            onClick={() => onAddComponent('light')}
            title="添加灯"
          >
            <span className="toolbar-icon">💡</span>
            <span>灯</span>
          </button>
          <button
            className="toolbar-btn"
            onClick={() => onAddComponent('gateway')}
            title="添加网关"
          >
            <span className="toolbar-icon">📡</span>
            <span>网关</span>
          </button>
        </div>
      </div>

      {/* 连线工具区 */}
      <div className="toolbar-section">
        <h3>🔗 连接线路</h3>
        <div className="toolbar-buttons">
          <button
            className={`toolbar-btn wire-btn live ${isConnecting && connectionWireType === 'live' ? 'active' : ''}`}
            onClick={() => isConnecting && connectionWireType === 'live' ? onCancelConnection() : onStartConnection('live')}
            title="连接火线"
          >
            <span className="wire-indicator live"></span>
            <span>火线</span>
          </button>
          <button
            className={`toolbar-btn wire-btn neutral ${isConnecting && connectionWireType === 'neutral' ? 'active' : ''}`}
            onClick={() => isConnecting && connectionWireType === 'neutral' ? onCancelConnection() : onStartConnection('neutral')}
            title="连接零线"
          >
            <span className="wire-indicator neutral"></span>
            <span>零线</span>
          </button>
          <button
            className={`toolbar-btn wire-btn network ${isConnecting && connectionWireType === 'network' ? 'active' : ''}`}
            onClick={() => isConnecting && connectionWireType === 'network' ? onCancelConnection() : onStartConnection('network')}
            title="连接网络"
          >
            <span className="wire-indicator network"></span>
            <span>网络</span>
          </button>
        </div>
        {isConnecting && (
          <div className="connection-hint">
            <span className="hint-icon">👆</span>
            <span>点击组件端口完成连接</span>
            <button className="btn-cancel" onClick={onCancelConnection}>取消</button>
          </div>
        )}
      </div>

      {/* 视图控制区 */}
      <div className="toolbar-section">
        <h3>🔍 视图控制</h3>
        <div className="zoom-controls">
          <button className="zoom-btn" onClick={onZoomOut} title="缩小">
            <span>−</span>
          </button>
          <span className="zoom-level">{Math.round(scale * 100)}%</span>
          <button className="zoom-btn" onClick={onZoomIn} title="放大">
            <span>+</span>
          </button>
          <button className="zoom-btn reset" onClick={onResetView} title="重置视图">
            <span>⟲</span>
          </button>
        </div>
        <p className="view-hint">滚轮缩放 · 中键拖拽平移</p>
      </div>

      {/* 语音控制区 */}
      <div className="toolbar-section">
        <h3 
          className="collapsible"
          onClick={() => setShowVoicePanel(!showVoicePanel)}
        >
          🎤 语音控制 {showVoicePanel ? '▼' : '▶'}
        </h3>
        {showVoicePanel && (
          <div className="voice-control">
            <input
              type="text"
              placeholder="例如: 打开客厅灯"
              value={voiceInput}
              onChange={(e) => setVoiceInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVoiceSubmit()}
            />
            <button onClick={handleVoiceSubmit}>发送</button>
            <div className="voice-hints">
              <p>支持的命令:</p>
              <ul>
                <li>打开 [设备名]</li>
                <li>关闭 [设备名]</li>
                <li>[设备名] 亮度 [0-100]</li>
                <li>[设备名] 色温 [2000-6500]</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}







