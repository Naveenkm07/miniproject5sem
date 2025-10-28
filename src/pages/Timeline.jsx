import { useMemories } from '../contexts/MemoryContext';
import { getCategoryIcon } from '../utils/helpers';

const Timeline = ({ onOpenMemoryDetail }) => {
  const { memories } = useMemories();

  const sortedMemories = memories
    .sort((a, b) => new Date(b.dateCreated || b.dateAdded) - new Date(a.dateCreated || a.dateAdded));

  const renderPreview = (memory) => {
    if (memory.fileType.startsWith('image/')) {
      return <img src={memory.fileData} alt={memory.title} />;
    } else if (memory.fileType.startsWith('video/')) {
      return <video src={memory.fileData} muted />;
    } else {
      return <div className="file-icon">{getCategoryIcon(memory.category)}</div>;
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Memory Timeline</h1>
      </div>
      <div className="timeline-container">
        {sortedMemories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">⏰</div>
            <h3>No memories in timeline</h3>
            <p>Add some memories to see them in chronological order</p>
          </div>
        ) : (
          sortedMemories.map(memory => {
            const date = new Date(memory.dateCreated || memory.dateAdded);
            const formattedDate = date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            return (
              <div
                key={memory.id}
                className="timeline-item"
                onClick={() => onOpenMemoryDetail(memory)}
              >
                <div className="timeline-date">{formattedDate}</div>
                <div className="timeline-content">
                  <div className="timeline-preview">
                    {renderPreview(memory)}
                  </div>
                  <div className="timeline-info">
                    <h3>{memory.title}</h3>
                    <p>{memory.description}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Timeline;
