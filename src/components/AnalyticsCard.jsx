import React from 'react';

const AnalyticsCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendLabel, 
  subtitle,
  gradient = 'var(--gradient-primary)',
  delay = 0 
}) => {
  return (
    <div 
      className="stat-card analytics-card" 
      style={{
        animation: `cardFadeIn 0.6s var(--transition-smooth) backwards`,
        animationDelay: `${delay}s`,
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--backdrop-blur)',
        WebkitBackdropFilter: 'var(--backdrop-blur)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Gradient Top Border */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: gradient,
        opacity: 0.8
      }} />

      {/* Icon with Glow */}
      <div style={{
        fontSize: '2.5rem',
        marginBottom: '12px',
        position: 'relative',
        display: 'inline-block'
      }}>
        <span className="stat-icon">{icon}</span>
      </div>

      {/* Value */}
      <div 
        className="stat-number"
        style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          background: gradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '8px',
          lineHeight: 1
        }}
      >
        {value}
      </div>

      {/* Title */}
      <div style={{
        color: 'var(--color-text)',
        fontSize: '0.95rem',
        fontWeight: 500,
        marginBottom: subtitle || trend ? '8px' : 0
      }}>
        {title}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div style={{
          color: 'var(--color-text-secondary)',
          fontSize: '0.813rem',
          marginBottom: trend ? '8px' : 0
        }}>
          {subtitle}
        </div>
      )}

      {/* Trend Badge */}
      {trend && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px 12px',
          background: trend > 0 ? 'var(--gradient-success)' : 'var(--gradient-warning)',
          color: 'white',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.75rem',
          fontWeight: 500,
          marginTop: '8px'
        }}>
          <span>{trend > 0 ? '↗' : '↘'}</span>
          <span>{Math.abs(trend)}%</span>
          {trendLabel && <span>{trendLabel}</span>}
        </div>
      )}

      {/* Decorative Gradient Overlay */}
      <div style={{
        position: 'absolute',
        bottom: -20,
        right: -20,
        width: '100px',
        height: '100px',
        background: gradient,
        borderRadius: '50%',
        opacity: 0.05,
        filter: 'blur(20px)',
        pointerEvents: 'none'
      }} />
    </div>
  );
};

export default AnalyticsCard;
