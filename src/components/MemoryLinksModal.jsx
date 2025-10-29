import { useState, useEffect } from 'react';
import { X, Link, Plus, Trash2, Lightbulb } from 'lucide-react';
import { useMemories } from '../contexts/MemoryContext';
import { 
  getLinksForMemory, 
  getLinkedMemories, 
  addMemoryLink, 
  removeMemoryLink,
  suggestMemoryLinks,
  LINK_TYPES 
} from '../utils/memoryLinks';

const MemoryLinksModal = ({ isOpen, memory, onClose, showToast }) => {
  const { memories } = useMemories();
  const [links, setLinks] = useState([]);
  const [linkedMemories, setLinkedMemories] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showAddLink, setShowAddLink] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState('');
  const [selectedLinkType, setSelectedLinkType] = useState(LINK_TYPES.RELATED);

  useEffect(() => {
    if (isOpen && memory) {
      loadLinks();
      loadSuggestions();
    }
  }, [isOpen, memory]);

  const loadLinks = () => {
    if (!memory) return;
    const memoryLinks = getLinksForMemory(memory.id);
    setLinks(memoryLinks);
    
    const linked = getLinkedMemories(memory.id, memories);
    setLinkedMemories(linked);
  };

  const loadSuggestions = () => {
    if (!memory) return;
    const suggested = suggestMemoryLinks(memory, memories);
    setSuggestions(suggested);
  };

  const handleAddLink = () => {
    if (!selectedMemory) {
      showToast('error', 'Please select a memory to link');
      return;
    }

    const result = addMemoryLink(memory.id, selectedMemory, selectedLinkType);
    
    if (result) {
      showToast('success', 'Memory link created!');
      loadLinks();
      loadSuggestions();
      setShowAddLink(false);
      setSelectedMemory('');
    } else {
      showToast('info', 'This link already exists');
    }
  };

  const handleRemoveLink = (linkId) => {
    if (confirm('Remove this link?')) {
      removeMemoryLink(linkId);
      showToast('success', 'Link removed');
      loadLinks();
      loadSuggestions();
    }
  };

  const handleAddSuggestion = (suggestedMemory, linkType) => {
    const result = addMemoryLink(memory.id, suggestedMemory.id, linkType);
    
    if (result) {
      showToast('success', 'Link created from suggestion!');
      loadLinks();
      loadSuggestions();
    }
  };

  const getLinkTypeLabel = (linkType) => {
    const labels = {
      [LINK_TYPES.RELATED]: '🔗 Related',
      [LINK_TYPES.SEQUENCE]: '📊 Part of Series',
      [LINK_TYPES.BEFORE_AFTER]: '⏳ Before/After',
      [LINK_TYPES.SAME_EVENT]: '📅 Same Event',
      [LINK_TYPES.SAME_PEOPLE]: '👥 Same People',
      [LINK_TYPES.SAME_PLACE]: '📍 Same Place',
      [LINK_TYPES.CUSTOM]: '✨ Custom'
    };
    return labels[linkType] || '🔗 Related';
  };

  if (!isOpen || !memory) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
        <div className="modal-header">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Link size={20} className="text-white" />
            </div>
            <div>
              <h2>Memory Links</h2>
              <p className="text-sm opacity-70">{memory.title}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Current Links */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Linked Memories ({linkedMemories.length})</h3>
              <button
                className="btn btn--sm btn--primary"
                onClick={() => setShowAddLink(!showAddLink)}
              >
                <Plus size={16} />
                <span>Add Link</span>
              </button>
            </div>

            {showAddLink && (
              <div className="glass-card rounded-xl p-4 mb-4">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="form-label text-sm">Select Memory</label>
                    <select
                      className="form-control"
                      value={selectedMemory}
                      onChange={(e) => setSelectedMemory(e.target.value)}
                    >
                      <option value="">Choose a memory...</option>
                      {memories
                        .filter(m => m.id !== memory.id)
                        .map(m => (
                          <option key={m.id} value={m.id}>{m.title}</option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label text-sm">Link Type</label>
                    <select
                      className="form-control"
                      value={selectedLinkType}
                      onChange={(e) => setSelectedLinkType(e.target.value)}
                    >
                      {Object.entries(LINK_TYPES).map(([key, value]) => (
                        <option key={value} value={value}>
                          {getLinkTypeLabel(value)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    className="btn btn--sm btn--outline"
                    onClick={() => setShowAddLink(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn--sm btn--primary"
                    onClick={handleAddLink}
                  >
                    Create Link
                  </button>
                </div>
              </div>
            )}

            {linkedMemories.length > 0 ? (
              <div className="space-y-2">
                {linkedMemories.map(({ link, memory: linkedMem }) => (
                  <div key={link.id} className="glass-card rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {linkedMem.thumbnail ? (
                          <img
                            src={linkedMem.thumbnail}
                            alt={linkedMem.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-white/5 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">📝</span>
                          </div>
                        )}

                        <div className="flex-1">
                          <div className="font-medium mb-1">{linkedMem.title}</div>
                          <div className="text-sm opacity-70 mb-2">
                            {getLinkTypeLabel(link.linkType)}
                          </div>
                          <div className="text-xs opacity-50">
                            {new Date(linkedMem.dateCreated).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveLink(link.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-500"
                        title="Remove link"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 opacity-50">
                <Link size={48} className="mx-auto mb-3 opacity-30" />
                <p>No links yet</p>
                <p className="text-sm">Connect related memories together!</p>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Lightbulb size={20} className="text-yellow-500" />
                <h3 className="text-lg font-semibold">Suggested Links</h3>
              </div>

              <div className="space-y-2">
                {suggestions.map(({ memory: suggestedMem, score, suggestedLinkType }) => (
                  <div key={suggestedMem.id} className="glass-card rounded-xl p-4 border border-yellow-500/20">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {suggestedMem.thumbnail ? (
                          <img
                            src={suggestedMem.thumbnail}
                            alt={suggestedMem.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-white/5 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">📝</span>
                          </div>
                        )}

                        <div className="flex-1">
                          <div className="font-medium mb-1">{suggestedMem.title}</div>
                          <div className="text-sm opacity-70 mb-2">
                            {getLinkTypeLabel(suggestedLinkType)}
                          </div>
                          <div className="text-xs opacity-50">
                            Match score: {score}%
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddSuggestion(suggestedMem, suggestedLinkType)}
                        className="btn btn--sm btn--primary"
                      >
                        <Plus size={16} />
                        Link
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn--outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemoryLinksModal;
