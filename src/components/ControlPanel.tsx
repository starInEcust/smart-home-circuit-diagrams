import type { 
  CircuitComponent, 
  CircuitConfig, 
  PowerComponent, 
  LightComponent, 
  SwitchComponent,
  GatewayComponent 
} from '../types';

interface Props {
  config: CircuitConfig;
  selectedComponentId: string | null;
  onUpdateComponent: (id: string, updates: Partial<CircuitComponent>) => void;
  onDeleteComponent: (id: string) => void;
  onSelectComponent: (id: string | null) => void;
}

export function ControlPanel({ 
  config, 
  selectedComponentId, 
  onUpdateComponent,
  onDeleteComponent,
  onSelectComponent,
}: Props) {
  const selectedComponent = config.components.find(c => c.id === selectedComponentId);
  
  // 获取所有网关
  const gateways = config.components.filter(c => c.type === 'gateway') as GatewayComponent[];
  // 获取所有灯具
  const lights = config.components.filter(c => c.type === 'light') as LightComponent[];

  const renderPowerControls = (component: PowerComponent) => (
    <>
      <div className="control-group">
        <label className="control-label">
          <span>供电状态</span>
          <div className="toggle-wrapper">
            <input
              type="checkbox"
              checked={component.properties.status}
              onChange={(e) => onUpdateComponent(component.id, {
                ...component,
                properties: { ...component.properties, status: e.target.checked }
              })}
            />
            <span className="toggle-slider"></span>
          </div>
        </label>
      </div>
      
      <div className="control-group">
        <label className="control-label">
          <span>火线输出数量</span>
          <span className="value-display">{component.properties.liveOutputs || 3}</span>
        </label>
        <input
          type="range"
          min="1"
          max="6"
          value={component.properties.liveOutputs || 3}
          onChange={(e) => onUpdateComponent(component.id, {
            ...component,
            properties: { ...component.properties, liveOutputs: Number(e.target.value) }
          })}
          className="slider"
        />
      </div>
      
      <div className="control-group">
        <label className="control-label">
          <span>零线输出数量</span>
          <span className="value-display">{component.properties.neutralOutputs || 3}</span>
        </label>
        <input
          type="range"
          min="1"
          max="6"
          value={component.properties.neutralOutputs || 3}
          onChange={(e) => onUpdateComponent(component.id, {
            ...component,
            properties: { ...component.properties, neutralOutputs: Number(e.target.value) }
          })}
          className="slider"
        />
      </div>
    </>
  );

  const renderLightControls = (component: LightComponent) => (
    <>
      <div className="control-group">
        <label className="control-label">
          <span>无线模式</span>
          <div className="toggle-wrapper">
            <input
              type="checkbox"
              checked={component.properties.wirelessMode || false}
              onChange={(e) => onUpdateComponent(component.id, {
                ...component,
                properties: { ...component.properties, wirelessMode: e.target.checked }
              })}
            />
            <span className="toggle-slider wireless"></span>
          </div>
        </label>
        <p className="control-hint">启用后可通过网关接收控制信号</p>
      </div>

      {component.properties.wirelessMode && gateways.length > 0 && (
        <div className="control-group">
          <label className="control-label">
            <span>关联网关</span>
          </label>
          <select
            className="select-input"
            value={component.properties.gatewayId || ''}
            onChange={(e) => onUpdateComponent(component.id, {
              ...component,
              properties: { ...component.properties, gatewayId: e.target.value || undefined }
            })}
          >
            <option value="">未关联</option>
            {gateways.map(gw => (
              <option key={gw.id} value={gw.id}>{gw.properties.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="control-group">
        <label className="control-label">
          <span>开关状态</span>
          <div className="toggle-wrapper">
            <input
              type="checkbox"
              checked={component.properties.status}
              onChange={(e) => onUpdateComponent(component.id, {
                ...component,
                properties: { ...component.properties, status: e.target.checked }
              })}
            />
            <span className="toggle-slider"></span>
          </div>
        </label>
      </div>
      
      <div className="control-group">
        <label className="control-label">
          <span>亮度</span>
          <span className="value-display">{component.properties.brightness}%</span>
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={component.properties.brightness}
          onChange={(e) => onUpdateComponent(component.id, {
            ...component,
            properties: { ...component.properties, brightness: Number(e.target.value) }
          })}
          className="slider"
        />
      </div>
      
      <div className="control-group">
        <label className="control-label">
          <span>色温</span>
          <span className="value-display">{component.properties.colorTemperature}K</span>
        </label>
        <input
          type="range"
          min="2000"
          max="6500"
          step="100"
          value={component.properties.colorTemperature}
          onChange={(e) => onUpdateComponent(component.id, {
            ...component,
            properties: { ...component.properties, colorTemperature: Number(e.target.value) }
          })}
          className="slider color-temp"
        />
        <div className="color-temp-labels">
          <span>暖光</span>
          <span>冷光</span>
        </div>
      </div>
    </>
  );

  const renderSwitchControls = (component: SwitchComponent) => (
    <>
      <div className="control-group">
        <label className="control-label">
          <span>无线模式</span>
          <div className="toggle-wrapper">
            <input
              type="checkbox"
              checked={component.properties.wirelessMode || false}
              onChange={(e) => onUpdateComponent(component.id, {
                ...component,
                properties: { ...component.properties, wirelessMode: e.target.checked }
              })}
            />
            <span className="toggle-slider wireless"></span>
          </div>
        </label>
        <p className="control-hint">启用后通过网关控制灯具，无需物理接线</p>
      </div>

      {component.properties.wirelessMode && (
        <>
          {gateways.length > 0 && (
            <div className="control-group">
              <label className="control-label">
                <span>关联网关</span>
              </label>
              <select
                className="select-input"
                value={component.properties.gatewayId || ''}
                onChange={(e) => onUpdateComponent(component.id, {
                  ...component,
                  properties: { ...component.properties, gatewayId: e.target.value || undefined }
                })}
              >
                <option value="">未关联</option>
                {gateways.map(gw => (
                  <option key={gw.id} value={gw.id}>{gw.properties.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="control-group">
            <label className="control-label">
              <span>控制的灯具</span>
            </label>
            <div className="checkbox-list">
              {lights.map(light => (
                <label key={light.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={component.properties.controlledLights?.includes(light.id) || false}
                    onChange={(e) => {
                      const currentLights = component.properties.controlledLights || [];
                      const newLights = e.target.checked
                        ? [...currentLights, light.id]
                        : currentLights.filter(id => id !== light.id);
                      onUpdateComponent(component.id, {
                        ...component,
                        properties: { ...component.properties, controlledLights: newLights }
                      });
                    }}
                  />
                  <span>{light.properties.name}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="control-group">
        <label className="control-label">
          <span>{component.properties.wirelessMode ? '信号状态' : '通断状态'}</span>
          <div className="toggle-wrapper">
            <input
              type="checkbox"
              checked={component.properties.isOn}
              onChange={(e) => onUpdateComponent(component.id, {
                ...component,
                properties: { ...component.properties, isOn: e.target.checked }
              })}
            />
            <span className="toggle-slider"></span>
          </div>
        </label>
      </div>
      
      {!component.properties.wirelessMode && (
        <div className="control-group">
          <label className="control-label">
            <span>开关类型</span>
          </label>
          <div className="button-group">
            {(['零火版', '单火版'] as const).map(type => (
              <button
                key={type}
                className={`btn-option ${component.properties.type === type ? 'active' : ''}`}
                onClick={() => onUpdateComponent(component.id, {
                  ...component,
                  properties: { ...component.properties, type }
                })}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="info-row" style={{ marginTop: 8 }}>
            <span className="info-label">接口说明</span>
            <span className="info-value">
              {component.properties.type === '零火版' ? '火线+零线' : '仅火线'}
            </span>
          </div>
        </div>
      )}
    </>
  );

  const renderGatewayControls = (component: GatewayComponent) => {
    // 找到关联到此网关的设备
    const connectedSwitches = config.components.filter(
      c => c.type === 'switch' && c.properties.wirelessMode && c.properties.gatewayId === component.id
    ) as SwitchComponent[];
    const connectedLights = config.components.filter(
      c => c.type === 'light' && c.properties.wirelessMode && c.properties.gatewayId === component.id
    ) as LightComponent[];

    return (
      <>
        <div className="control-group">
          <label className="control-label">
            <span>网关状态</span>
            <div className="toggle-wrapper">
              <input
                type="checkbox"
                checked={component.properties.status}
                onChange={(e) => onUpdateComponent(component.id, {
                  ...component,
                  properties: { ...component.properties, status: e.target.checked }
                })}
              />
              <span className="toggle-slider"></span>
            </div>
          </label>
        </div>
        
        <div className="control-group">
          <div className="info-section">
            <h4>已连接设备</h4>
            {connectedSwitches.length === 0 && connectedLights.length === 0 ? (
              <p className="empty-hint">暂无设备关联到此网关</p>
            ) : (
              <ul className="connected-devices">
                {connectedSwitches.map(sw => (
                  <li key={sw.id}>
                    <span>🔘</span>
                    <span>{sw.properties.name}</span>
                    <span className={sw.properties.isOn ? 'status-on' : 'status-off'}>
                      {sw.properties.isOn ? '发送中' : '待命'}
                    </span>
                  </li>
                ))}
                {connectedLights.map(light => (
                  <li key={light.id}>
                    <span>💡</span>
                    <span>{light.properties.name}</span>
                    <span className={light.properties.status ? 'status-on' : 'status-off'}>
                      {light.properties.status ? '开启' : '关闭'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="control-group">
          <div className="info-row">
            <span className="info-label">信号传输</span>
            <span className="info-value">{component.properties.status ? '正常' : '离线'}</span>
          </div>
        </div>
      </>
    );
  };

  const renderControls = () => {
    if (!selectedComponent) {
      return (
        <div className="no-selection">
          <div className="no-selection-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12h8M12 8v8" />
            </svg>
          </div>
          <p>选择一个组件进行编辑</p>
          <span className="hint">点击电路图中的组件</span>
        </div>
      );
    }

    return (
      <>
        <div className="component-header">
          <div className="component-type-icon">
            {selectedComponent.type === 'power' && '⚡'}
            {selectedComponent.type === 'light' && '💡'}
            {selectedComponent.type === 'switch' && '🔘'}
            {selectedComponent.type === 'gateway' && '📡'}
          </div>
          <div className="component-info">
            <input
              type="text"
              className="name-input"
              value={selectedComponent.properties.name}
              onChange={(e) => onUpdateComponent(selectedComponent.id, {
                ...selectedComponent,
                properties: { ...selectedComponent.properties, name: e.target.value }
              } as CircuitComponent)}
            />
            <span className="component-type">
              {selectedComponent.type === 'power' && '电源'}
              {selectedComponent.type === 'light' && '灯具'}
              {selectedComponent.type === 'switch' && '开关'}
              {selectedComponent.type === 'gateway' && '中枢网关'}
            </span>
          </div>
          <button 
            className="btn-delete"
            onClick={() => onDeleteComponent(selectedComponent.id)}
            title="删除组件"
          >
            🗑️
          </button>
        </div>
        
        <div className="controls-content">
          {selectedComponent.type === 'power' && renderPowerControls(selectedComponent)}
          {selectedComponent.type === 'light' && renderLightControls(selectedComponent)}
          {selectedComponent.type === 'switch' && renderSwitchControls(selectedComponent)}
          {selectedComponent.type === 'gateway' && renderGatewayControls(selectedComponent)}
        </div>
      </>
    );
  };

  return (
    <div className="control-panel">
      <div className="panel-header">
        <h2>属性面板</h2>
      </div>

      {renderControls()}
      
      {/* 组件列表 */}
      <div className="component-list">
        <h4>所有组件 ({config.components.length})</h4>
        <ul>
          {config.components.map(comp => (
            <li 
              key={comp.id}
              className={selectedComponentId === comp.id ? 'active' : ''}
              onClick={() => onSelectComponent(comp.id)}
            >
              <span className="comp-icon">
                {comp.type === 'power' && '⚡'}
                {comp.type === 'light' && '💡'}
                {comp.type === 'switch' && '🔘'}
                {comp.type === 'gateway' && '📡'}
              </span>
              <span className="comp-name">{comp.properties.name}</span>
              {(comp.type === 'switch' && comp.properties.wirelessMode) && (
                <span className="wireless-badge">📶</span>
              )}
              <span className={`comp-status ${
                (comp.type === 'power' && comp.properties.status) ||
                (comp.type === 'light' && comp.properties.status) ||
                (comp.type === 'switch' && comp.properties.isOn) ||
                (comp.type === 'gateway' && comp.properties.status)
                  ? 'on' : 'off'
              }`}>
                {(comp.type === 'power' && comp.properties.status) ||
                 (comp.type === 'light' && comp.properties.status) ||
                 (comp.type === 'switch' && comp.properties.isOn) ||
                 (comp.type === 'gateway' && comp.properties.status)
                  ? '●' : '○'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
