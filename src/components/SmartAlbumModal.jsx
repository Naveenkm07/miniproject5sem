import { useState } from 'react';
import { X, Sparkles, Calendar, Star, Tag, Users, MapPin, Filter } from 'lucide-react';
import { useAlbums } from '../contexts/AlbumContext';
import { SMART_ALBUM_TYPES, getAvailableYears, getAvailableCategories, getAllTags } from '../utils/smartAlbums';

const SmartAlbumModal = ({ isOpen, onClose, showToast, memories }) => {
  const { createSmartAlbum } = useAlbums();
  const [albumType, setAlbumType] = useState(SMART_ALBUM_TYPES.FAVORITES);
  const [albumName, setAlbumName] = useState('');
  const [albumDescription, setAlbumDescription] = useState('');
  const [criteria, setCriteria] = useState({});

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!albumName.trim()) {
      showToast('error', 'Please enter an album name');
      return;
    }

    const smartAlbum = {
      name: albumName,
      description: albumDescription,
      type: albumType,
      criteria,
      autoUpdate: true
    };

    createSmartAlbum(smartAlbum);
    showToast('success', 'Smart album created!');
    handleClose();
  };

  const handleClose = () => {
    setAlbumName('');
    setAlbumDescription('');
    setAlbumType(SMART_ALBUM_TYPES.FAVORITES);
    setCriteria({});
    onClose();
  };

  const renderCriteriaInputs = () => {
    switch (albumType) {
      case SMART_ALBUM_TYPES.RECENT:
        return (
          <div className="form-group">
            <label className="form-label">Days</label>
            <input
              type="number"
              className="form-control"
              value={criteria.days || 30}
              onChange={(e) => setCriteria({ days: parseInt(e.target.value) })}
              min="1"
              max="365"
            />
          </div>
        );

      case SMART_ALBUM_TYPES.BY_YEAR:
        return (
          <div className="form-group">
            <label className="form-label">Year</label>
            <select
              className="form-control"
              value={criteria.year || new Date().getFullYear()}
              onChange={(e) => setCriteria({ year: parseInt(e.target.value) })}
            >
              {getAvailableYears(memories).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        );

      case SMART_ALBUM_TYPES.BY_MONTH:
        return (
          <>
            <div className="form-group">
              <label className="form-label">Year</label>
              <select
                className="form-control"
                value={criteria.year || new Date().getFullYear()}
                onChange={(e) => setCriteria({ ...criteria, year: parseInt(e.target.value) })}
              >
                {getAvailableYears(memories).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Month</label>
              <select
                className="form-control"
                value={criteria.month || 0}
                onChange={(e) => setCriteria({ ...criteria, month: parseInt(e.target.value) })}
              >
                {['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'].map((month, idx) => (
                  <option key={idx} value={idx}>{month}</option>
                ))}
              </select>
            </div>
          </>
        );

      case SMART_ALBUM_TYPES.BY_CATEGORY:
        return (
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-control"
              value={criteria.category || ''}
              onChange={(e) => setCriteria({ category: e.target.value })}
            >
              <option value="">Select category</option>
              {getAvailableCategories(memories).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        );

      case SMART_ALBUM_TYPES.BY_TAG:
        return (
          <div className="form-group">
            <label className="form-label">Tag</label>
            <select
              className="form-control"
              value={criteria.tag || ''}
              onChange={(e) => setCriteria({ tag: e.target.value })}
            >
              <option value="">Select tag</option>
              {getAllTags(memories).map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        );

      case SMART_ALBUM_TYPES.CUSTOM:
        return (
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">Date Range</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  className="form-control"
                  placeholder="Start date"
                  onChange={(e) => setCriteria({ 
                    ...criteria, 
                    dateRange: { ...criteria.dateRange, start: e.target.value }
                  })}
                />
                <input
                  type="date"
                  className="form-control"
                  placeholder="End date"
                  onChange={(e) => setCriteria({ 
                    ...criteria, 
                    dateRange: { ...criteria.dateRange, end: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <h2>Create Smart Album</h2>
          </div>
          <button className="modal-close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Album Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                className={`p-3 rounded-xl border-2 transition-all ${
                  albumType === SMART_ALBUM_TYPES.FAVORITES
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
                onClick={() => setAlbumType(SMART_ALBUM_TYPES.FAVORITES)}
              >
                <Star size={20} className="mx-auto mb-1" />
                <div className="text-sm font-medium">Favorites</div>
              </button>

              <button
                className={`p-3 rounded-xl border-2 transition-all ${
                  albumType === SMART_ALBUM_TYPES.RECENT
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
                onClick={() => setAlbumType(SMART_ALBUM_TYPES.RECENT)}
              >
                <Calendar size={20} className="mx-auto mb-1" />
                <div className="text-sm font-medium">Recent</div>
              </button>

              <button
                className={`p-3 rounded-xl border-2 transition-all ${
                  albumType === SMART_ALBUM_TYPES.BY_YEAR
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
                onClick={() => setAlbumType(SMART_ALBUM_TYPES.BY_YEAR)}
              >
                <Calendar size={20} className="mx-auto mb-1" />
                <div className="text-sm font-medium">By Year</div>
              </button>

              <button
                className={`p-3 rounded-xl border-2 transition-all ${
                  albumType === SMART_ALBUM_TYPES.BY_TAG
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
                onClick={() => setAlbumType(SMART_ALBUM_TYPES.BY_TAG)}
              >
                <Tag size={20} className="mx-auto mb-1" />
                <div className="text-sm font-medium">By Tag</div>
              </button>

              <button
                className={`p-3 rounded-xl border-2 transition-all ${
                  albumType === SMART_ALBUM_TYPES.BY_CATEGORY
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
                onClick={() => setAlbumType(SMART_ALBUM_TYPES.BY_CATEGORY)}
              >
                <Filter size={20} className="mx-auto mb-1" />
                <div className="text-sm font-medium">By Category</div>
              </button>

              <button
                className={`p-3 rounded-xl border-2 transition-all ${
                  albumType === SMART_ALBUM_TYPES.CUSTOM
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
                onClick={() => setAlbumType(SMART_ALBUM_TYPES.CUSTOM)}
              >
                <Sparkles size={20} className="mx-auto mb-1" />
                <div className="text-sm font-medium">Custom</div>
              </button>
            </div>
          </div>

          {renderCriteriaInputs()}

          <div className="form-group">
            <label className="form-label">Album Name</label>
            <input
              type="text"
              className="form-control"
              value={albumName}
              onChange={(e) => setAlbumName(e.target.value)}
              placeholder="Enter album name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description (optional)</label>
            <textarea
              className="form-control"
              value={albumDescription}
              onChange={(e) => setAlbumDescription(e.target.value)}
              placeholder="Describe this smart album"
              rows="2"
            />
          </div>

          <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <p className="text-sm">
              ✨ <strong>Smart albums</strong> automatically update based on your criteria. 
              Memories matching the rules will appear here automatically!
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn--outline" onClick={handleClose}>
            Cancel
          </button>
          <button className="btn btn--primary" onClick={handleCreate}>
            Create Smart Album
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartAlbumModal;
