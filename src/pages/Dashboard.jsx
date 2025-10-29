import { useMemories } from '../contexts/MemoryContext';
import { useAlbums } from '../contexts/AlbumContext';
import MemoryCard from '../components/MemoryCard';
import OnThisDay from '../components/OnThisDay';
import UpcomingAnniversaries from '../components/UpcomingAnniversaries';
import StorageMonitor from '../components/StorageMonitor';
import { useMemo } from 'react';

const Dashboard = ({ onOpenUpload, onOpenBulkUpload, onNavigate, onOpenMemoryDetail, showToast }) => {
  const { memories, toggleFavorite } = useMemories();
  const { albums } = useAlbums();

  const recentMemories = memories
    .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
    .slice(0, 6);

  // AI Analytics-style Stats
  const stats = useMemo(() => {
    const categories = memories.reduce((acc, m) => {
      acc[m.category] = (acc[m.category] || 0) + 1;
      return acc;
    }, {});

    const totalSize = memories.reduce((sum, m) => sum + (m.fileSize || 0), 0);
    const favoritesCount = memories.filter(m => m.isFavorite).length;
    
    const today = new Date();
    const last7Days = memories.filter(m => {
      const date = new Date(m.dateAdded);
      const diff = today - date;
      return diff < 7 * 24 * 60 * 60 * 1000;
    }).length;

    const last30Days = memories.filter(m => {
      const date = new Date(m.dateAdded);
      const diff = today - date;
      return diff < 30 * 24 * 60 * 60 * 1000;
    }).length;

    return {
      total: memories.length,
      categories,
      totalSize,
      favorites: favoritesCount,
      last7Days,
      last30Days,
      albums: albums.length,
      growth: last7Days > 0 ? ((last7Days / (memories.length || 1)) * 100).toFixed(1) : 0
    };
  }, [memories, albums]);

  return (
    <div className="container">
      {/* On This Day Section */}
      <OnThisDay memories={memories} onOpenMemory={onOpenMemoryDetail} />

      {/* Hero Section - AI Analytics Style */}
      <div className="hero-section" style={{
        background: 'var(--gradient-primary)',
        borderRadius: 'var(--radius-lg)',
        padding: '48px 32px',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="hero-content" style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ 
            color: 'white', 
            fontSize: '2.5rem', 
            marginBottom: '12px',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)' 
          }}>
            Welcome to Your Memory Vault
          </h1>
          <p style={{ 
            color: 'rgba(255,255,255,0.9)', 
            fontSize: '1.1rem',
            marginBottom: '20px' 
          }}>
            Preserve, organize, and cherish your precious memories in one secure digital vault.
          </p>
          {/* Quick Stats in Hero */}
          <div style={{ 
            display: 'flex', 
            gap: '24px', 
            flexWrap: 'wrap',
            marginTop: '24px'
          }}>
            <div style={{ 
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              padding: '16px 24px',
              borderRadius: 'var(--radius-base)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'white' }}>
                {stats.total}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>
                Total Memories
              </div>
            </div>
            <div style={{ 
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              padding: '16px 24px',
              borderRadius: 'var(--radius-base)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'white' }}>
                {stats.last7Days}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>
                This Week
              </div>
            </div>
            <div style={{ 
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              padding: '16px 24px',
              borderRadius: 'var(--radius-base)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'white' }}>
                {stats.albums}
              </div>
              <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>
                Albums
              </div>
            </div>
            <div style={{ 
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              padding: '16px 24px',
              borderRadius: 'var(--radius-base)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'white' }}>
                {(stats.totalSize / (1024 * 1024)).toFixed(0)}MB
              </div>
              <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>
                Storage Used
              </div>
            </div>
          </div>
        </div>
        {/* Decorative Elements */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '150px',
          height: '150px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '50%',
          filter: 'blur(30px)'
        }} />
      </div>

      {/* AI Analytics Stats Dashboard */}
      <div className="analytics-stats" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '32px' 
      }}>
        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div className="stat-icon" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📊</div>
          <div className="stat-number" style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '8px 0' }}>
            {stats.total}
          </div>
          <div className="stat-label" style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            Total Memories
          </div>
          <div style={{ 
            marginTop: '8px', 
            padding: '4px 12px', 
            background: 'var(--gradient-success)', 
            color: 'white', 
            borderRadius: 'var(--radius-full)', 
            fontSize: '0.75rem', 
            display: 'inline-block' 
          }}>
            +{stats.growth}% This Week
          </div>
        </div>

        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div className="stat-icon" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>⭐</div>
          <div className="stat-number" style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '8px 0' }}>
            {stats.favorites}
          </div>
          <div className="stat-label" style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            Favorites
          </div>
          <div style={{ 
            marginTop: '8px', 
            fontSize: '0.75rem', 
            color: 'var(--color-text-secondary)' 
          }}>
            {((stats.favorites / (stats.total || 1)) * 100).toFixed(0)}% of total
          </div>
        </div>

        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div className="stat-icon" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📁</div>
          <div className="stat-number" style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '8px 0' }}>
            {stats.albums}
          </div>
          <div className="stat-label" style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            Albums
          </div>
          <div style={{ 
            marginTop: '8px', 
            fontSize: '0.75rem', 
            color: 'var(--color-text-secondary)' 
          }}>
            Organized collections
          </div>
        </div>

        <div className="stat-card" style={{ textAlign: 'center' }}>
          <div className="stat-icon" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>💾</div>
          <div className="stat-number" style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '8px 0' }}>
            {(stats.totalSize / (1024 * 1024)).toFixed(1)}
          </div>
          <div className="stat-label" style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            MB Used
          </div>
          <div style={{ 
            marginTop: '8px', 
            fontSize: '0.75rem', 
            color: 'var(--color-text-secondary)' 
          }}>
            {stats.last30Days} in last 30 days
          </div>
        </div>
      </div>

      {/* Upcoming Anniversaries */}
      <UpcomingAnniversaries memories={memories} onOpenMemory={onOpenMemoryDetail} />

      {/* Storage Monitor */}
      <div style={{ marginBottom: '32px' }}>
        <StorageMonitor showToast={showToast} />
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <div className="action-grid">
          <button className="action-card" onClick={onOpenUpload}>
            <div className="action-icon">📤</div>
            <h3>Upload Memory</h3>
            <p>Add photos, videos, audio, or documents</p>
          </button>
          <button className="action-card" onClick={onOpenBulkUpload}>
            <div className="action-icon">📦</div>
            <h3>Bulk Upload</h3>
            <p>Upload multiple files at once</p>
          </button>
          <button className="action-card" onClick={() => onNavigate('gallery')}>
            <div className="action-icon">🖼️</div>
            <h3>View Gallery</h3>
            <p>Browse all your memories</p>
          </button>
          <button className="action-card" onClick={() => onNavigate('timeline')}>
            <div className="action-icon">⏰</div>
            <h3>Timeline</h3>
            <p>View memories chronologically</p>
          </button>
          <button className="action-card" onClick={() => onNavigate('stats')}>
            <div className="action-icon">📊</div>
            <h3>Statistics</h3>
            <p>View memory insights</p>
          </button>
        </div>
      </div>

      {/* Upcoming Anniversaries */}
      <UpcomingAnniversaries memories={memories} onOpenMemory={onOpenMemoryDetail} />

      {/* Recent Memories */}
      <div className="recent-memories">
        <div className="section-header">
          <h2>Recent Memories</h2>
          <button className="btn btn--outline" onClick={() => onNavigate('gallery')}>
            View All
          </button>
        </div>
        <div className="memories-grid">
          {recentMemories.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📸</div>
              <h3>No memories yet</h3>
              <p>Upload your first memory to get started</p>
            </div>
          ) : (
            recentMemories.map(memory => (
              <MemoryCard
                key={memory.id}
                memory={memory}
                onClick={onOpenMemoryDetail}
                onToggleFavorite={toggleFavorite}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
