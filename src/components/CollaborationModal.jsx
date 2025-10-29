import { useState, useEffect } from 'react';
import { X, Users, Link2, Check, Copy, UserPlus, Trash2, Shield } from 'lucide-react';
import {
  getAlbumShareSettings,
  enableAlbumCollaboration,
  disableAlbumCollaboration,
  getCollaborators,
  addCollaborator,
  removeCollaborator,
  updateCollaboratorRole
} from '../utils/collaboration';

const CollaborationModal = ({ isOpen, album, onClose, showToast }) => {
  const [shareSettings, setShareSettings] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCollaborator, setNewCollaborator] = useState({ name: '', email: '', role: 'viewer' });

  useEffect(() => {
    if (isOpen && album) {
      loadSettings();
      loadCollaborators();
    }
  }, [isOpen, album]);

  const loadSettings = () => {
    const settings = getAlbumShareSettings(album.id);
    setShareSettings(settings);
  };

  const loadCollaborators = () => {
    const collabs = getCollaborators(album.id);
    setCollaborators(collabs);
  };

  const handleEnableCollaboration = () => {
    const settings = enableAlbumCollaboration(album.id, {
      allowComments: true,
      allowContributions: false
    });
    setShareSettings(settings);
    showToast('success', 'Collaboration enabled!');
  };

  const handleDisableCollaboration = () => {
    if (!confirm('Disable collaboration for this album?')) return;
    
    disableAlbumCollaboration(album.id);
    setShareSettings(null);
    showToast('info', 'Collaboration disabled');
  };

  const handleCopyLink = () => {
    if (shareSettings?.shareLink) {
      navigator.clipboard.writeText(shareSettings.shareLink);
      showToast('success', 'Share link copied!');
    }
  };

  const handleToggleSetting = (setting) => {
    const updated = {
      ...shareSettings,
      [setting]: !shareSettings[setting]
    };
    enableAlbumCollaboration(album.id, updated);
    setShareSettings(updated);
  };

  const handleAddCollaborator = () => {
    if (!newCollaborator.name.trim() || !newCollaborator.email.trim()) {
      showToast('error', 'Please fill in all fields');
      return;
    }

    try {
      addCollaborator(album.id, newCollaborator);
      setNewCollaborator({ name: '', email: '', role: 'viewer' });
      setShowAddForm(false);
      loadCollaborators();
      showToast('success', 'Collaborator added!');
    } catch (error) {
      showToast('error', 'Failed to add collaborator');
    }
  };

  const handleRemoveCollaborator = (collabId) => {
    if (!confirm('Remove this collaborator?')) return;

    try {
      removeCollaborator(album.id, collabId);
      loadCollaborators();
      showToast('success', 'Collaborator removed');
    } catch (error) {
      showToast('error', 'Failed to remove collaborator');
    }
  };

  const handleChangeRole = (collabId, newRole) => {
    try {
      updateCollaboratorRole(album.id, collabId, newRole);
      loadCollaborators();
      showToast('success', 'Role updated');
    } catch (error) {
      showToast('error', 'Failed to update role');
    }
  };

  if (!isOpen || !album) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '600px' }}
      >
        <div className="modal-header">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Users size={20} className="text-white" />
            </div>
            <h2>Collaboration Settings</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body space-y-6">
          {/* Album Info */}
          <div className="p-4 bg-white/5 rounded-xl">
            <h4 className="font-semibold mb-1">{album.name}</h4>
            <p className="text-sm opacity-70">{album.description || 'No description'}</p>
          </div>

          {!shareSettings ? (
            /* Enable Collaboration */
            <div className="text-center py-8">
              <Users size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Enable Collaboration</h3>
              <p className="opacity-70 mb-4">
                Share this album with others and collaborate together
              </p>
              <button
                onClick={handleEnableCollaboration}
                className="btn btn--primary"
              >
                Enable Collaboration
              </button>
            </div>
          ) : (
            <>
              {/* Share Link */}
              <div>
                <label className="form-label flex items-center gap-2">
                  <Link2 size={16} />
                  Share Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareSettings.shareLink}
                    readOnly
                    className="form-control flex-1"
                    onClick={(e) => e.target.select()}
                  />
                  <button
                    onClick={handleCopyLink}
                    className="btn btn--outline flex items-center gap-2"
                  >
                    <Copy size={16} />
                    Copy
                  </button>
                </div>
                <p className="text-xs opacity-50 mt-1">
                  Anyone with this link can view the album
                </p>
              </div>

              {/* Collaboration Settings */}
              <div>
                <h4 className="font-semibold mb-3">Permissions</h4>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer">
                    <div>
                      <div className="font-medium">Allow Comments</div>
                      <div className="text-sm opacity-70">Let collaborators add comments</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={shareSettings.allowComments}
                      onChange={() => handleToggleSetting('allowComments')}
                      className="form-checkbox"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer">
                    <div>
                      <div className="font-medium">Allow Contributions</div>
                      <div className="text-sm opacity-70">Let collaborators add memories</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={shareSettings.allowContributions}
                      onChange={() => handleToggleSetting('allowContributions')}
                      className="form-checkbox"
                    />
                  </label>
                </div>
              </div>

              {/* Collaborators */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Collaborators ({collaborators.length})</h4>
                  {!showAddForm && (
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="btn btn--sm btn--primary flex items-center gap-2"
                    >
                      <UserPlus size={16} />
                      Add
                    </button>
                  )}
                </div>

                {showAddForm && (
                  <div className="p-4 bg-white/5 rounded-xl mb-3 space-y-3">
                    <input
                      type="text"
                      placeholder="Name"
                      value={newCollaborator.name}
                      onChange={(e) => setNewCollaborator({ ...newCollaborator, name: e.target.value })}
                      className="form-control"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={newCollaborator.email}
                      onChange={(e) => setNewCollaborator({ ...newCollaborator, email: e.target.value })}
                      className="form-control"
                    />
                    <select
                      value={newCollaborator.role}
                      onChange={(e) => setNewCollaborator({ ...newCollaborator, role: e.target.value })}
                      className="form-control"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                    <div className="flex gap-2">
                      <button onClick={handleAddCollaborator} className="btn btn--primary flex-1">
                        Add Collaborator
                      </button>
                      <button onClick={() => setShowAddForm(false)} className="btn btn--outline">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {collaborators.length === 0 ? (
                    <p className="text-center opacity-50 py-4">No collaborators yet</p>
                  ) : (
                    collaborators.map(collab => (
                      <div key={collab.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{collab.name}</div>
                          <div className="text-sm opacity-70">{collab.email}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={collab.role}
                            onChange={(e) => handleChangeRole(collab.id, e.target.value)}
                            className="form-control form-control--sm"
                            style={{ width: 'auto' }}
                          >
                            <option value="viewer">Viewer</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            onClick={() => handleRemoveCollaborator(collab.id)}
                            className="p-2 opacity-50 hover:opacity-100 hover:text-red-500 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Disable Collaboration */}
              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={handleDisableCollaboration}
                  className="btn btn--outline btn--sm w-full text-red-500 border-red-500/30 hover:bg-red-500/10"
                >
                  Disable Collaboration
                </button>
              </div>
            </>
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

export default CollaborationModal;
