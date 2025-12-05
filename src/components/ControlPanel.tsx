import type { CircuitComponent, CircuitConfig, PowerComponent, LightComponent, SwitchComponent } from '../types';

interface Props {
  config: CircuitConfig;
  selectedComponentId: string | null;
  onUpdateComponent: (id: string, updates: Partial<CircuitComponent>) => void;
}

export function ControlPanel({ config, selectedComponentId, onUpdateComponent }: Props) {
  const selectedComponent = config.components.find(c => c.id === selectedComponentId);

  const renderPowerControls = (component: PowerComponent) => (
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
  );

  const renderLightControls = (component: LightComponent) => (
    <>
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
          <span>通断状态</span>
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
      
      <div className="control-group">
        <div className="info-row">
          <span className="info-label">开关类型</span>
          <span className="info-value">{component.properties.type}</span>
        </div>
      </div>
    </>
  );

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
          </div>
          <div className="component-info">
            <h3>{selectedComponent.properties.name}</h3>
            <span className="component-type">
              {selectedComponent.type === 'power' && '电源'}
              {selectedComponent.type === 'light' && '灯具'}
              {selectedComponent.type === 'switch' && '开关'}
            </span>
          </div>
        </div>
        
        <div className="controls-content">
          {selectedComponent.type === 'power' && renderPowerControls(selectedComponent)}
          {selectedComponent.type === 'light' && renderLightControls(selectedComponent)}
          {selectedComponent.type === 'switch' && renderSwitchControls(selectedComponent)}
        </div>
      </>
    );
  };

  return (
    <div className="control-panel">
      <div className="panel-header">
        <h2>控制面板</h2>
      </div>
      {renderControls()}
      
      {/* 组件列表 */}
      <div className="component-list">
        <h4>所有组件</h4>
        <ul>
          {config.components.map(comp => (
            <li 
              key={comp.id}
              className={selectedComponentId === comp.id ? 'active' : ''}
            >
              <span className="comp-icon">
                {comp.type === 'power' && '⚡'}
                {comp.type === 'light' && '💡'}
                {comp.type === 'switch' && '🔘'}
              </span>
              <span className="comp-name">{comp.properties.name}</span>
              <span className={`comp-status ${
                (comp.type === 'power' && comp.properties.status) ||
                (comp.type === 'light' && comp.properties.status) ||
                (comp.type === 'switch' && comp.properties.isOn)
                  ? 'on' : 'off'
              }`}>
                {(comp.type === 'power' && comp.properties.status) ||
                 (comp.type === 'light' && comp.properties.status) ||
                 (comp.type === 'switch' && comp.properties.isOn)
                  ? '●' : '○'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

