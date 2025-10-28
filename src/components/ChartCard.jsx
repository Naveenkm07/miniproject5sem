import React from 'react';

const ChartCard = ({ 
  title, 
  subtitle, 
  children, 
  height = '300px',
  gradient = 'var(--gradient-primary)',
  delay = 0 
}) => {
  return (
    <div 
      className="chart-container"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--backdrop-blur)',
        WebkitBackdropFilter: 'var(--backdrop-blur)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        animation: `cardFadeIn 0.6s var(--transition-smooth) backwards`,
        animationDelay: `${delay}s`
      }}
    >
      {/* Gradient Top Border */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: gradient,
        opacity: 0
      }} 
      className="chart-top-border"
      />

      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: 600,
          color: 'var(--color-text)',
          marginBottom: subtitle ? '4px' : 0
        }}>
          {title}
        </h3>
        {subtitle && (
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--color-text-secondary)',
            margin: 0
          }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Chart */}
      <div style={{ height, position: 'relative' }}>
        {children}
      </div>

      {/* Decorative Elements */}
      <div style={{
        position: 'absolute',
        top: -30,
        right: -30,
        width: '120px',
        height: '120px',
        background: gradient,
        borderRadius: '50%',
        opacity: 0.03,
        filter: 'blur(30px)',
        pointerEvents: 'none'
      }} />
    </div>
  );
};

export default ChartCard;
