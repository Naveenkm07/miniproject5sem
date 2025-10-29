import { getOnThisDayMemories } from '../utils/reminders';

const OnThisDay = ({ memories, onOpenMemory }) => {
  const onThisDayMemories = getOnThisDayMemories(memories);

  if (onThisDayMemories.length === 0) {
    return null;
  }

  return (
    <div style={{
      background: 'var(--gradient-primary)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      marginBottom: '32px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ fontSize: '2rem' }}>📅</span>
          <h2 style={{ color: 'white', margin: 0, fontSize: '1.5rem' }}>
            On This Day
          </h2>
        </div>

        <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '20px' }}>
          {onThisDayMemories.length === 1 
            ? 'You have 1 memory from this day in a previous year'
            : `You have ${onThisDayMemories.length} memories from this day in previous years`
          }
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {onThisDayMemories.slice(0, 4).map(memory => (
            <div
              key={memory.id}
              onClick={() => onOpenMemory(memory)}
              style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: 'var(--radius-base)',
                padding: '12px',
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
              }}
            >
              {memory.thumbnail && (
                <img
                  src={memory.thumbnail}
                  alt={memory.title}
                  style={{
                    width: '100%',
                    height: '120px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '8px'
                  }}
                />
              )}
              <div style={{ color: 'white' }}>
                <div style={{
                  fontSize: '0.875rem',
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
                  color: 'rgba(255,255,255,0.8)'
                }}>
                  {memory.yearsAgo} {memory.yearsAgo === 1 ? 'year' : 'years'} ago
                </div>
              </div>
            </div>
          ))}
        </div>

        {onThisDayMemories.length > 4 && (
          <div style={{
            marginTop: '16px',
            textAlign: 'center'
          }}>
            <span style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: '0.875rem'
            }}>
              +{onThisDayMemories.length - 4} more {onThisDayMemories.length - 4 === 1 ? 'memory' : 'memories'}
            </span>
          </div>
        )}
      </div>

      {/* Decorative background */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '200px',
        height: '200px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '50%',
        filter: 'blur(40px)',
        zIndex: 0
      }} />
    </div>
  );
};

export default OnThisDay;
