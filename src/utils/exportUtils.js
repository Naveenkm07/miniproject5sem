// Export and sharing utilities for Memoria Vault

/**
 * Export album as ZIP file with all memories
 */
export const exportAlbumAsZip = async (album, memories, albumMemories) => {
  try {
    // Dynamically import JSZip
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    // Create album folder
    const albumFolder = zip.folder(sanitizeFileName(album.name));

    // Add album info as JSON
    const albumInfo = {
      name: album.name,
      description: album.description,
      dateCreated: album.dateCreated,
      memoryCount: albumMemories.length,
      exportDate: new Date().toISOString()
    };
    albumFolder.file('album-info.json', JSON.stringify(albumInfo, null, 2));

    // Add each memory
    for (let i = 0; i < albumMemories.length; i++) {
      const memory = albumMemories[i];
      
      // Extract file extension from file type
      const extension = getFileExtension(memory.fileType);
      const fileName = `${i + 1}_${sanitizeFileName(memory.title)}.${extension}`;

      // Convert base64 to blob
      const blob = dataURLtoBlob(memory.fileData);
      albumFolder.file(fileName, blob);

      // Add memory metadata
      const metadata = {
        title: memory.title,
        description: memory.description,
        category: memory.category,
        tags: memory.tags,
        dateCreated: memory.dateCreated,
        dateAdded: memory.dateAdded
      };
      albumFolder.file(`${i + 1}_${sanitizeFileName(memory.title)}.json`, JSON.stringify(metadata, null, 2));
    }

    // Generate ZIP
    const content = await zip.generateAsync({ type: 'blob' });
    
    // Download
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sanitizeFileName(album.name)}_${Date.now()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, count: albumMemories.length };
  } catch (error) {
    console.error('Export album as ZIP failed:', error);
    throw error;
  }
};

/**
 * Export multiple memories as ZIP
 */
export const exportMemoriesAsZip = async (memories, zipName = 'memories') => {
  try {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    const folder = zip.folder(zipName);

    for (let i = 0; i < memories.length; i++) {
      const memory = memories[i];
      const extension = getFileExtension(memory.fileType);
      const fileName = `${i + 1}_${sanitizeFileName(memory.title)}.${extension}`;

      const blob = dataURLtoBlob(memory.fileData);
      folder.file(fileName, blob);

      // Add metadata
      const metadata = {
        title: memory.title,
        description: memory.description,
        category: memory.category,
        tags: memory.tags,
        dateCreated: memory.dateCreated,
        dateAdded: memory.dateAdded
      };
      folder.file(`${i + 1}_${sanitizeFileName(memory.title)}.json`, JSON.stringify(metadata, null, 2));
    }

    const content = await zip.generateAsync({ type: 'blob' });
    
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${zipName}_${Date.now()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, count: memories.length };
  } catch (error) {
    console.error('Export memories as ZIP failed:', error);
    throw error;
  }
};

/**
 * Generate shareable link for memory (creates a data package)
 */
export const generateShareableLink = (memory) => {
  try {
    // Create a shareable data package
    const shareData = {
      id: memory.id,
      title: memory.title,
      description: memory.description,
      category: memory.category,
      tags: memory.tags,
      dateCreated: memory.dateCreated,
      thumbnail: memory.thumbnail || memory.fileData,
      shareDate: new Date().toISOString()
    };

    // Encode to base64
    const encoded = btoa(JSON.stringify(shareData));
    
    // Create shareable URL (would be actual URL in production)
    const shareUrl = `${window.location.origin}${window.location.pathname}?share=${encoded}`;

    return shareUrl;
  } catch (error) {
    console.error('Generate shareable link failed:', error);
    throw error;
  }
};

/**
 * Copy shareable link to clipboard
 */
export const copyShareLinkToClipboard = async (memory) => {
  try {
    const shareUrl = generateShareableLink(memory);
    await navigator.clipboard.writeText(shareUrl);
    return shareUrl;
  } catch (error) {
    console.error('Copy to clipboard failed:', error);
    throw error;
  }
};

/**
 * Generate slideshow HTML for memories
 */
export const generateSlideshow = (memories, options = {}) => {
  const {
    autoplay = true,
    interval = 3000,
    showTitles = true,
    theme = 'dark'
  } = options;

  const slidesHTML = memories.map((memory, index) => `
    <div class="slide" data-index="${index}">
      <img src="${memory.fileData}" alt="${memory.title}" />
      ${showTitles ? `<div class="slide-caption"><h3>${memory.title}</h3><p>${memory.description || ''}</p></div>` : ''}
    </div>
  `).join('');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Memory Slideshow</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: ${theme === 'dark' ? '#0f172a' : '#ffffff'};
      color: ${theme === 'dark' ? '#ffffff' : '#000000'};
      overflow: hidden;
    }
    .slideshow-container {
      position: relative;
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .slide {
      display: none;
      width: 100%;
      height: 100%;
      position: absolute;
      animation: fadeIn 1s;
    }
    .slide.active { display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .slide img {
      max-width: 90%;
      max-height: 85vh;
      object-fit: contain;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      border-radius: 8px;
    }
    .slide-caption {
      position: absolute;
      bottom: 40px;
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
      background: rgba(0,0,0,0.7);
      padding: 20px 40px;
      border-radius: 12px;
      backdrop-filter: blur(10px);
      max-width: 80%;
    }
    .slide-caption h3 { font-size: 1.5rem; margin-bottom: 8px; }
    .slide-caption p { font-size: 1rem; opacity: 0.9; }
    .controls {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 12px;
      z-index: 10;
    }
    .controls button {
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      backdrop-filter: blur(10px);
      transition: all 0.3s;
    }
    .controls button:hover { background: rgba(255,255,255,0.3); transform: scale(1.05); }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  </style>
</head>
<body>
  <div class="slideshow-container">
    ${slidesHTML}
    ${!showTitles ? '<div class="controls"><button onclick="prevSlide()">◀ Previous</button><button onclick="togglePlay()" id="playBtn">⏸ Pause</button><button onclick="nextSlide()">Next ▶</button></div>' : ''}
  </div>
  <script>
    let currentSlide = 0;
    let isPlaying = ${autoplay};
    let timer;
    const slides = document.querySelectorAll('.slide');
    const playBtn = document.getElementById('playBtn');

    function showSlide(n) {
      slides.forEach(s => s.classList.remove('active'));
      currentSlide = (n + slides.length) % slides.length;
      slides[currentSlide].classList.add('active');
    }

    function nextSlide() { showSlide(currentSlide + 1); }
    function prevSlide() { showSlide(currentSlide - 1); }

    function togglePlay() {
      isPlaying = !isPlaying;
      if (playBtn) playBtn.textContent = isPlaying ? '⏸ Pause' : '▶ Play';
      if (isPlaying) startAutoplay();
      else stopAutoplay();
    }

    function startAutoplay() {
      timer = setInterval(nextSlide, ${interval});
    }

    function stopAutoplay() {
      clearInterval(timer);
    }

    // Initialize
    showSlide(0);
    if (isPlaying) startAutoplay();

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === ' ') { e.preventDefault(); togglePlay(); }
    });
  </script>
</body>
</html>
  `;

  return html;
};

/**
 * Open slideshow in new window
 */
export const openSlideshow = (memories, options) => {
  const html = generateSlideshow(memories, options);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'width=1200,height=800');
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/**
 * Export slideshow as HTML file
 */
export const exportSlideshow = (memories, fileName = 'slideshow', options) => {
  const html = generateSlideshow(memories, options);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generate printable photo album HTML
 */
export const generatePrintableAlbum = (memories, albumName) => {
  const photosHTML = memories.map(memory => `
    <div class="photo-page">
      <div class="photo-container">
        <img src="${memory.fileData}" alt="${memory.title}" />
      </div>
      <div class="photo-details">
        <h3>${memory.title}</h3>
        <p class="date">${new Date(memory.dateCreated).toLocaleDateString()}</p>
        ${memory.description ? `<p class="description">${memory.description}</p>` : ''}
        ${memory.tags && memory.tags.length > 0 ? `<p class="tags">${memory.tags.join(', ')}</p>` : ''}
      </div>
    </div>
  `).join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${albumName} - Photo Album</title>
  <style>
    @media print {
      @page { size: A4; margin: 1cm; }
      body { margin: 0; }
      .photo-page { page-break-after: always; page-break-inside: avoid; }
    }
    body {
      font-family: Georgia, serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
    .photo-page {
      margin-bottom: 60px;
      border: 1px solid #ddd;
      padding: 20px;
      background: white;
    }
    .photo-container {
      text-align: center;
      margin-bottom: 20px;
    }
    .photo-container img {
      max-width: 100%;
      max-height: 500px;
      border: 1px solid #ccc;
      padding: 5px;
      background: white;
    }
    .photo-details h3 {
      font-size: 1.5rem;
      margin-bottom: 8px;
      color: #333;
    }
    .date {
      color: #666;
      font-style: italic;
      margin-bottom: 12px;
    }
    .description {
      line-height: 1.6;
      margin-bottom: 12px;
    }
    .tags {
      color: #888;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <h1>${albumName}</h1>
  ${photosHTML}
</body>
</html>
  `;

  return html;
};

/**
 * Print memories as photo album
 */
export const printPhotoAlbum = (memories, albumName) => {
  const html = generatePrintableAlbum(memories, albumName);
  const printWindow = window.open('', '_blank');
  printWindow.document.write(html);
  printWindow.document.close();
  setTimeout(() => printWindow.print(), 500);
};

// Helper functions

function sanitizeFileName(name) {
  return name.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_').substring(0, 50);
}

function getFileExtension(mimeType) {
  const map = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/ogg': 'ogv',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/ogg': 'ogg',
    'application/pdf': 'pdf',
    'text/plain': 'txt'
  };
  return map[mimeType] || 'bin';
}

function dataURLtoBlob(dataURL) {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}
