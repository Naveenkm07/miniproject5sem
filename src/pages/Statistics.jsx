import { useMemo } from 'react';
import { useMemories } from '../contexts/MemoryContext';
import { useAlbums } from '../contexts/AlbumContext';
import AnalyticsCard from '../components/AnalyticsCard';
import ChartCard from '../components/ChartCard';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Statistics = () => {
  const { memories } = useMemories();
  const { albums } = useAlbums();

  const calculateStats = () => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const categories = memories.reduce((acc, memory) => {
      acc[memory.category] = (acc[memory.category] || 0) + 1;
      return acc;
    }, {});

    const allTags = memories.flatMap(memory => memory.tags);
    const uniqueTags = new Set(allTags).size;

    const thisMonthCount = memories.filter(memory =>
      new Date(memory.dateAdded) >= thisMonth
    ).length;

    const favoritesCount = memories.filter(memory => memory.isFavorite === true).length;

    const totalSize = memories.reduce((sum, m) => sum + (m.fileSize || 0), 0);

    return {
      total: memories.length,
      categories,
      photos: categories['Photos'] || 0,
      videos: categories['Videos'] || 0,
      audio: categories['Audio'] || 0,
      documents: categories['Documents'] || 0,
      notes: categories['Notes'] || 0,
      uniqueTags,
      thisMonth: thisMonthCount,
      favorites: favoritesCount,
      albums: albums.length,
      totalSize
    };
  };

  const stats = calculateStats();

  // Upload Trends Data (Last 6 months)
  const uploadTrendsData = useMemo(() => {
    const last6Months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        count: 0
      });
    }

    memories.forEach(memory => {
      const memDate = new Date(memory.dateAdded);
      const monthsDiff = (now.getFullYear() - memDate.getFullYear()) * 12 + (now.getMonth() - memDate.getMonth());
      
      if (monthsDiff >= 0 && monthsDiff < 6) {
        last6Months[5 - monthsDiff].count++;
      }
    });

    return {
      labels: last6Months.map(m => m.month),
      datasets: [
        {
          label: 'Memories Uploaded',
          data: last6Months.map(m => m.count),
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  }, [memories]);

  // Category Distribution Data
  const categoryData = useMemo(() => {
    if (Object.keys(stats.categories).length === 0) {
      return { labels: [], datasets: [] };
    }
    
    return {
      labels: Object.keys(stats.categories),
      datasets: [
        {
          data: Object.values(stats.categories),
          backgroundColor: [
            'rgba(99, 102, 241, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(251, 146, 60, 0.8)',
            'rgba(34, 197, 94, 0.8)'
          ],
          borderWidth: 2
        }
      ]
    };
  }, [stats.categories]);

  // Monthly Activity Data
  const monthlyActivityData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const monthCounts = new Array(12).fill(0);

    memories.forEach(memory => {
      const date = new Date(memory.dateAdded);
      if (date.getFullYear() === currentYear) {
        monthCounts[date.getMonth()]++;
      }
    });

    return {
      labels: monthNames,
      datasets: [
        {
          label: `${currentYear} Activity`,
          data: monthCounts,
          backgroundColor: 'rgba(99, 102, 241, 0.6)',
          borderColor: 'rgb(99, 102, 241)',
          borderWidth: 2
        }
      ]
    };
  }, [memories]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right'
      }
    }
  };

  if (memories.length === 0) {
    return (
      <div className="container">
        <div className="page-header">
          <h1>Statistics</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📊</div>
          <h2>No Data Yet</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>Upload some memories to see statistics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>AI Analytics Dashboard</h1>
      </div>
      
      {/* Analytics Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '20px',
        marginBottom: '32px'
      }}>
        <AnalyticsCard 
          icon="📱"
          value={stats.total}
          title="Total Memories"
          subtitle="All time collection"
          trend={15}
          trendLabel="vs last month"
          gradient="var(--gradient-primary)"
          delay={0}
        />
        <AnalyticsCard 
          icon="⭐"
          value={stats.favorites}
          title="Favorites"
          subtitle={`${((stats.favorites / (stats.total || 1)) * 100).toFixed(0)}% of total`}
          gradient="var(--gradient-warning)"
          delay={0.1}
        />
        <AnalyticsCard 
          icon="📁"
          value={stats.albums}
          title="Albums"
          subtitle="Organized collections"
          gradient="var(--gradient-success)"
          delay={0.2}
        />
        <AnalyticsCard 
          icon="📊"
          value={stats.thisMonth}
          title="This Month"
          subtitle="Recent uploads"
          trend={8}
          trendLabel="growth"
          gradient="var(--gradient-ocean)"
          delay={0.3}
        />
        <AnalyticsCard 
          icon="🏷️"
          value={stats.uniqueTags}
          title="Unique Tags"
          subtitle="Categorized"
          gradient="var(--gradient-sunset)"
          delay={0.4}
        />
        <AnalyticsCard 
          icon="💾"
          value={`${(stats.totalSize / (1024 * 1024)).toFixed(1)} MB`}
          title="Storage Used"
          subtitle="Total data size"
          gradient="var(--gradient-forest)"
          delay={0.5}
        />
      </div>

      {/* Charts Section */}
      <div>
        <h2 style={{ 
          marginBottom: '24px',
          background: 'var(--gradient-primary)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          display: 'inline-block'
        }}>Visual Analytics</h2>
        
        {/* Upload Trends */}
        <ChartCard 
          title="Upload Trends"
          subtitle="Memory uploads over the last 6 months"
          gradient="var(--gradient-primary)"
          delay={0.6}
        >
          <Line data={uploadTrendsData} options={chartOptions} />
        </ChartCard>

        {/* Category and Monthly Activity Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '24px',
          marginTop: '24px',
          marginBottom: '24px'
        }}>
          {/* Category Distribution */}
          <ChartCard 
            title="Category Distribution"
            subtitle="Memory types breakdown"
            gradient="var(--gradient-success)"
            delay={0.7}
          >
            {categoryData.labels.length > 0 ? (
              <Doughnut data={categoryData} options={doughnutOptions} />
            ) : (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%', 
                color: 'var(--color-text-secondary)' 
              }}>
                No categories yet
              </div>
            )}
          </ChartCard>

          {/* Monthly Activity */}
          <ChartCard 
            title={`${new Date().getFullYear()} Activity`}
            subtitle="Monthly upload activity"
            gradient="var(--gradient-ocean)"
            delay={0.8}
          >
            <Bar data={monthlyActivityData} options={chartOptions} />
          </ChartCard>
        </div>

        {/* Detailed Breakdown */}
        <div style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'var(--backdrop-blur)',
          WebkitBackdropFilter: 'var(--backdrop-blur)',
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--glass-border)',
          position: 'relative',
          overflow: 'hidden',
          animation: 'cardFadeIn 0.6s var(--transition-smooth) backwards',
          animationDelay: '0.9s'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'var(--gradient-sunset)'
          }} />
          <h3 style={{ marginTop: 0, marginBottom: '20px', fontWeight: 600 }}>Detailed Breakdown</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
            gap: '16px' 
          }}>
            {[
              { icon: '📷', label: 'Photos', value: stats.photos, color: 'rgba(99, 102, 241, 0.1)' },
              { icon: '🎥', label: 'Videos', value: stats.videos, color: 'rgba(168, 85, 247, 0.1)' },
              { icon: '🎵', label: 'Audio', value: stats.audio, color: 'rgba(236, 72, 153, 0.1)' },
              { icon: '📄', label: 'Documents', value: stats.documents, color: 'rgba(251, 146, 60, 0.1)' },
              { icon: '📝', label: 'Notes', value: stats.notes, color: 'rgba(34, 197, 94, 0.1)' }
            ].map((item, index) => (
              <div key={item.label} style={{ 
                padding: '20px', 
                background: item.color,
                borderRadius: 'var(--radius-base)',
                border: '1px solid var(--glass-border)',
                transition: 'all 0.3s var(--transition-smooth)',
                cursor: 'default'
              }}
              className="hover-scale"
              >
                <div style={{ 
                  fontSize: '2rem', 
                  marginBottom: '8px' 
                }}>
                  {item.icon}
                </div>
                <div style={{ 
                  fontSize: 'var(--font-size-sm)', 
                  color: 'var(--color-text-secondary)', 
                  marginBottom: '8px',
                  fontWeight: 500
                }}>
                  {item.label}
                </div>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'var(--font-weight-bold)',
                  background: 'var(--gradient-primary)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
