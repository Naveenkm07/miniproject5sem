import { useState, useEffect } from 'react';
import { MessageCircle, Send, Edit2, Trash2, X } from 'lucide-react';
import { getComments, addComment, editComment, deleteComment } from '../utils/collaboration';

const CommentsSection = ({ memoryId, showToast }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    loadComments();
  }, [memoryId]);

  const loadComments = () => {
    const loaded = getComments(memoryId);
    setComments(loaded);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    try {
      addComment(memoryId, newComment);
      setNewComment('');
      loadComments();
      showToast('success', 'Comment added!');
    } catch (error) {
      showToast('error', 'Failed to add comment');
    }
  };

  const handleEditComment = (commentId) => {
    if (!editText.trim()) return;

    try {
      editComment(memoryId, commentId, editText);
      setEditingId(null);
      setEditText('');
      loadComments();
      showToast('success', 'Comment updated!');
    } catch (error) {
      showToast('error', 'Failed to update comment');
    }
  };

  const handleDeleteComment = (commentId) => {
    if (!confirm('Delete this comment?')) return;

    try {
      deleteComment(memoryId, commentId);
      loadComments();
      showToast('success', 'Comment deleted');
    } catch (error) {
      showToast('error', 'Failed to delete comment');
    }
  };

  const startEdit = (comment) => {
    setEditingId(comment.id);
    setEditText(comment.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="comments-section">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle size={20} />
        <h4 className="font-semibold">Comments ({comments.length})</h4>
      </div>

      {/* Comments List */}
      <div className="space-y-3 mb-4" style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {comments.length === 0 ? (
          <p className="text-center opacity-50 py-4">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="glass-card p-3 rounded-lg">
              {editingId === comment.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="form-control w-full"
                    rows="2"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditComment(comment.id)}
                      className="btn btn--sm btn--primary"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="btn btn--sm btn--outline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{comment.author}</span>
                        <span className="text-xs opacity-50">{formatTimestamp(comment.timestamp)}</span>
                        {comment.edited && (
                          <span className="text-xs opacity-50 italic">(edited)</span>
                        )}
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{comment.text}</p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => startEdit(comment)}
                        className="p-1 opacity-50 hover:opacity-100 transition-opacity"
                        title="Edit comment"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="p-1 opacity-50 hover:opacity-100 hover:text-red-500 transition-all"
                        title="Delete comment"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Comment */}
      <div className="flex gap-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              handleAddComment();
            }
          }}
          placeholder="Add a comment... (Ctrl+Enter to post)"
          className="form-control flex-1"
          rows="2"
        />
        <button
          onClick={handleAddComment}
          disabled={!newComment.trim()}
          className="btn btn--primary px-3"
          style={{ alignSelf: 'flex-end' }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default CommentsSection;
