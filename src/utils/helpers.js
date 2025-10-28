export const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getCategoryIcon = (category) => {
  const icons = {
    'Photos': '📷',
    'Videos': '🎥',
    'Audio': '🎵',
    'Documents': '📄',
    'Notes': '📝'
  };
  return icons[category] || '📁';
};

export const detectFileCategory = (fileType) => {
  if (fileType.startsWith('image/')) return 'Photos';
  if (fileType.startsWith('video/')) return 'Videos';
  if (fileType.startsWith('audio/')) return 'Audio';
  if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('text')) return 'Documents';
  return 'Documents';
};

export const readFileAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
