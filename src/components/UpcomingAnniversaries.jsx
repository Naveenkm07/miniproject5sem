import { getUpcomingAnniversaries } from '../utils/reminders';

const UpcomingAnniversaries = ({ memories, onOpenMemory }) => {
  const upcoming = getUpcomingAnniversaries(memories, 7); // Next 7 days

  if (upcoming.length === 0) {
    return null;
  }

  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      marginBottom: '32px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <span style={{ fontSize: '1.5rem' }}>🎉</span>
        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
          Upcoming Anniversaries
        </h3>
      </div>

      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '16px', fontSize: '0.875rem' }}>
        Memory anniversaries in the next 7 days
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {upcoming.slice(0, 5).map(memory => (
          <div
            key={`${memory.id}-${memory.daysUntil}`}
            onClick={() => onOpenMemory(memory)}
            style={{
              background: 'var(--color-secondary)',
              borderRadius: 'var(--radius-base)',
              padding: '12px',
              cursor: 'pointer',
              border: '1px solid transparent',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary)';
              e.currentTarget.style.background = 'var(--color-surface)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.background = 'var(--color-secondary)';
            }}
          >
            {memory.thumbnail && (
              <img
                src={memory.thumbnail}
                alt={memory.title}
                style={{
                  width: '60px',
                  height: '60px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-sm)'
                }}
              />
            )}
            
            <div style={{ flex: 1 }}>
              <div style={{
                fontWeight: '600',
                marginBottom: '4px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {memory.title}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-secondary)'
              }}>
                {memory.yearsAgo} {memory.yearsAgo === 1 ? 'year' : 'years'} anniversary
              </div>
            </div>

            <div style={{
              textAlign: 'right',
              fontSize: '0.75rem',
              color: memory.daysUntil === 1 ? '#ff6b95' : 'var(--color-primary)',
              fontWeight: '600'
            }}>
              {memory.daysUntil === 1 ? 'Tomorrow' : `In ${memory.daysUntil} days`}
            </div>
          </div>
        ))}
      </div>

      {upcoming.length > 5 && (
        <div style={{
          marginTop: '12px',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: 'var(--color-text-secondary)'
        }}>
          +{upcoming.length - 5} more upcoming anniversaries
        </div>
      )}
    </div>
  );
};

export default UpcomingAnniversaries;
