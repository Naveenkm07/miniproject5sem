import { useState, useEffect } from 'react';
import { X, AlertTriangle, Check, Trash2, Eye } from 'lucide-react';
import { useMemories } from '../contexts/MemoryContext';
import { findDuplicates } from '../utils/aiFeatures';

const DuplicateDetector = ({ isOpen, onClose, showToast }) => {
  const { memories, deleteMemory } = useMemories();
  const [duplicateGroups, setDuplicateGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      detectDuplicates();
    }
  }, [isOpen, memories]);

  const detectDuplicates = () => {
    setLoading(true);
    setProgress(0);

    setTimeout(() => {
      const groups = [];
      const processed = new Set();

      memories.forEach((memory, index) => {
        if (processed.has(memory.id)) return;

        const duplicates = findDuplicates(
          memory,
          memories.filter(m => !processed.has(m.id) && m.id !== memory.id),
          0.75 // 75% similarity threshold
        );

        if (duplicates.length > 0) {
          groups.push({
            original: memory,
            duplicates: duplicates.map(d => d.memory),
            similarities: duplicates.map(d => d.similarity),
            reasons: duplicates.map(d => d.reasons)
          });

          processed.add(memory.id);
          duplicates.forEach(d => processed.add(d.memory.id));
        }

        setProgress(((index + 1) / memories.length) * 100);
      });

      setDuplicateGroups(groups);
      setLoading(false);

      if (groups.length === 0) {
        showToast('success', 'No duplicates found! Your library is clean.');
      } else {
        showToast('info', `Found ${groups.length} potential duplicate groups`);
      }
    }, 100);
  };

  const handleKeepOriginal = async (group) => {
    try {
      for (const duplicate of group.duplicates) {
        await deleteMemory(duplicate.id);
      }
      showToast('success', `Removed ${group.duplicates.length} duplicate(s)`);
      detectDuplicates();
    } catch (error) {
      showToast('error', 'Failed to remove duplicates');
    }
  };

  const handleKeepDuplicate = async (group, duplicateIndex) => {
    try {
      await deleteMemory(group.original.id);
      
      // Remove other duplicates except the selected one
      for (let i = 0; i < group.duplicates.length; i++) {
        if (i !== duplicateIndex) {
          await deleteMemory(group.duplicates[i].id);
        }
      }
      
      showToast('success', 'Kept selected version and removed others');
      detectDuplicates();
    } catch (error) {
      showToast('error', 'Failed to remove duplicates');
    }
  };

  const handleKeepAll = (groupIndex) => {
    setDuplicateGroups(prev => prev.filter((_, i) => i !== groupIndex));
    showToast('info', 'Skipped this group');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '800px', maxHeight: '90vh' }}
      >
        <div className="modal-header">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <AlertTriangle size={20} className="text-white" />
            </div>
            <h2>Duplicate Detector</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '70vh', overflow: 'auto' }}>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 mx-auto mb-4"></div>
              <p className="text-lg font-semibold mb-2">Scanning for duplicates...</p>
              <p className="opacity-70">Analyzing {memories.length} memories</p>
              <div className="w-full max-w-md mx-auto mt-4">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm mt-2">{Math.round(progress)}%</p>
              </div>
            </div>
          ) : duplicateGroups.length === 0 ? (
            <div className="text-center py-12">
              <Check size={64} className="mx-auto mb-4 text-green-500" />
              <h3 className="text-xl font-semibold mb-2">No Duplicates Found!</h3>
              <p className="opacity-70">Your memory library looks clean</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                <div className="flex items-start space-x-3">
                  <AlertTriangle size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-orange-500">Found {duplicateGroups.length} Potential Duplicates</h4>
                    <p className="text-sm opacity-70 mt-1">
                      Review each group and choose which version to keep
                    </p>
                  </div>
                </div>
              </div>

              {duplicateGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="glass-card rounded-xl p-4 border border-orange-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Duplicate Group #{groupIndex + 1}</h4>
                    <button
                      onClick={() => handleKeepAll(groupIndex)}
                      className="btn btn--sm btn--outline"
                    >
                      Keep All
                    </button>
                  </div>

                  {/* Original */}
                  <div className="mb-3">
                    <div className="text-sm font-medium opacity-70 mb-2">Original:</div>
                    <div className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg">
                      {group.original.thumbnail ? (
                        <img 
                          src={group.original.thumbnail} 
                          alt={group.original.title}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-white/10 rounded-lg flex items-center justify-center">
                          📄
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{group.original.title}</div>
                        <div className="text-sm opacity-70">{group.original.category}</div>
                        <div className="text-xs opacity-50">
                          {new Date(group.original.dateCreated).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => handleKeepOriginal(group)}
                        className="btn btn--sm btn--primary"
                      >
                        <Check size={16} /> Keep This
                      </button>
                    </div>
                  </div>

                  {/* Duplicates */}
                  <div>
                    <div className="text-sm font-medium opacity-70 mb-2">
                      Duplicates ({group.duplicates.length}):
                    </div>
                    <div className="space-y-2">
                      {group.duplicates.map((duplicate, dupIndex) => (
                        <div key={duplicate.id} className="flex items-start space-x-3 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                          {duplicate.thumbnail ? (
                            <img 
                              src={duplicate.thumbnail} 
                              alt={duplicate.title}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-white/10 rounded-lg flex items-center justify-center">
                              📄
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="font-medium">{duplicate.title}</div>
                            <div className="text-sm opacity-70">{duplicate.category}</div>
                            <div className="text-xs opacity-50">
                              {new Date(duplicate.dateCreated).toLocaleDateString()}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {group.reasons[dupIndex]?.map((reason, i) => (
                                <span key={i} className="text-xs px-2 py-0.5 bg-orange-500/20 rounded">
                                  {reason}
                                </span>
                              ))}
                            </div>
                            <div className="text-sm font-semibold text-orange-500 mt-1">
                              {group.similarities[dupIndex]}% similar
                            </div>
                          </div>
                          <button
                            onClick={() => handleKeepDuplicate(group, dupIndex)}
                            className="btn btn--sm btn--outline"
                          >
                            <Check size={16} /> Keep This
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn--outline" onClick={onClose}>
            Close
          </button>
          {duplicateGroups.length > 0 && !loading && (
            <button 
              className="btn btn--primary"
              onClick={detectDuplicates}
            >
              🔄 Rescan
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DuplicateDetector;
