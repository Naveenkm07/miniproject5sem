import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeSwitcher = () => {
  const { themeMode, colorScheme, actualTheme, changeThemeMode, changeColorScheme, THEME_MODES, COLOR_SCHEMES } = useTheme();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);

  const themeIcons = {
    [THEME_MODES.LIGHT]: '☀️',
    [THEME_MODES.DARK]: '🌙',
    [THEME_MODES.AUTO]: '🌓'
  };

  const colorSchemeData = {
    [COLOR_SCHEMES.DEFAULT]: { name: 'Purple Wave', icon: '🟣', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    [COLOR_SCHEMES.OCEAN]: { name: 'Ocean Blue', icon: '🌊', gradient: 'linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%)' },
    [COLOR_SCHEMES.SUNSET]: { name: 'Sunset Glow', icon: '🌅', gradient: 'linear-gradient(135deg, #FF6B95 0%, #FFC796 100%)' },
    [COLOR_SCHEMES.FOREST]: { name: 'Forest Green', icon: '🌲', gradient: 'linear-gradient(135deg, #134E5E 0%, #71B280 100%)' },
    [COLOR_SCHEMES.LAVENDER]: { name: 'Lavender Dream', icon: '💜', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    [COLOR_SCHEMES.CRIMSON]: { name: 'Crimson Fire', icon: '🔥', gradient: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)' },
    [COLOR_SCHEMES.MIDNIGHT]: { name: 'Midnight Sky', icon: '🌌', gradient: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' },
    [COLOR_SCHEMES.AURORA]: { name: 'Aurora Lights', icon: '✨', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }
  };

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      {/* Color Scheme Selector */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => {
            setShowColorMenu(!showColorMenu);
            setShowThemeMenu(false);
          }}
          style={{
            background: 'var(--color-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-base)',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          title="Change color scheme"
        >
          <span>{colorSchemeData[colorScheme].icon}</span>
        </button>

        {showColorMenu && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            background: 'var(--glass-bg-strong)',
            backdropFilter: 'var(--backdrop-blur-strong)',
            WebkitBackdropFilter: 'var(--backdrop-blur-strong)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '12px',
            minWidth: '220px',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease'
          }}>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: 'var(--color-text-secondary)',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Color Scheme
            </div>
            {Object.entries(colorSchemeData).map(([key, data]) => (
              <button
                key={key}
                onClick={() => {
                  changeColorScheme(key);
                  setShowColorMenu(false);
                }}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: colorScheme === key ? 'var(--color-secondary)' : 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-base)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '4px',
                  transition: 'all 0.2s ease',
                  color: 'var(--color-text)'
                }}
                onMouseEnter={(e) => {
                  if (colorScheme !== key) {
                    e.currentTarget.style.background = 'var(--color-secondary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (colorScheme !== key) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: data.gradient,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }} />
                <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                  {data.name}
                </span>
                {colorScheme === key && <span style={{ marginLeft: 'auto' }}>✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Theme Mode Selector */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => {
            setShowThemeMenu(!showThemeMenu);
            setShowColorMenu(false);
          }}
          style={{
            background: 'var(--color-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-base)',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '1.25rem',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          title={`Theme: ${themeMode}`}
        >
          {themeIcons[themeMode]}
        </button>

        {showThemeMenu && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            background: 'var(--glass-bg-strong)',
            backdropFilter: 'var(--backdrop-blur-strong)',
            WebkitBackdropFilter: 'var(--backdrop-blur-strong)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '12px',
            minWidth: '180px',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease'
          }}>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: 'var(--color-text-secondary)',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Theme Mode
            </div>
            {Object.entries(THEME_MODES).map(([key, value]) => (
              <button
                key={value}
                onClick={() => {
                  changeThemeMode(value);
                  setShowThemeMenu(false);
                }}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: themeMode === value ? 'var(--color-secondary)' : 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-base)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '4px',
                  transition: 'all 0.2s ease',
                  color: 'var(--color-text)',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  if (themeMode !== value) {
                    e.currentTarget.style.background = 'var(--color-secondary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (themeMode !== value) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{themeIcons[value]}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: '500', textTransform: 'capitalize' }}>
                  {value}
                </span>
                {themeMode === value && <span style={{ marginLeft: 'auto' }}>✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Close menus when clicking outside */}
      {(showThemeMenu || showColorMenu) && (
        <div
          onClick={() => {
            setShowThemeMenu(false);
            setShowColorMenu(false);
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ThemeSwitcher;
