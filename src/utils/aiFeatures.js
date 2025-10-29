/**
 * AI-Powered Features
 * - Auto-tagging based on content analysis
 * - Smart categorization
 * - Duplicate detection
 * - Color analysis
 */

/**
 * Generate smart tags based on file metadata and content
 */
export const generateSmartTags = (memory) => {
  const tags = new Set();
  const { title, description, category, dateCreated, location } = memory;

  // Tag from category
  if (category) {
    tags.add(category.toLowerCase());
  }

  // Tag from date (season, year)
  if (dateCreated) {
    const date = new Date(dateCreated);
    const month = date.getMonth();
    const year = date.getFullYear();

    // Seasons
    if (month >= 2 && month <= 4) tags.add('spring');
    else if (month >= 5 && month <= 7) tags.add('summer');
    else if (month >= 8 && month <= 10) tags.add('fall');
    else tags.add('winter');

    // Year
    tags.add(year.toString());

    // Decade
    const decade = Math.floor(year / 10) * 10;
    tags.add(`${decade}s`);
  }

  // Tag from title (extract meaningful words)
  if (title) {
    const words = title.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.has(word));
    
    words.slice(0, 3).forEach(word => tags.add(word));
  }

  // Tag from description
  if (description) {
    const keywords = extractKeywords(description);
    keywords.slice(0, 5).forEach(keyword => tags.add(keyword));
  }

  // Tag from location
  if (location) {
    const locationParts = location.split(',').map(p => p.trim().toLowerCase());
    locationParts.forEach(part => {
      if (part.length > 2) tags.add(part);
    });
  }

  return Array.from(tags).slice(0, 10); // Max 10 tags
};

/**
 * Detect category based on file type and content
 */
export const smartCategorize = (file) => {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  // Image patterns
  if (type.startsWith('image/')) {
    if (name.includes('screenshot') || name.includes('screen')) return 'Screenshots';
    if (name.includes('selfie') || name.includes('portrait')) return 'Portraits';
    if (name.includes('landscape') || name.includes('nature')) return 'Nature';
    return 'Photos';
  }

  // Video patterns
  if (type.startsWith('video/')) {
    if (name.includes('screen') || name.includes('record')) return 'Recordings';
    if (name.includes('vlog')) return 'Vlogs';
    return 'Videos';
  }

  // Audio patterns
  if (type.startsWith('audio/')) {
    if (name.includes('voice') || name.includes('memo')) return 'Voice Memos';
    if (name.includes('music') || name.includes('song')) return 'Music';
    return 'Audio';
  }

  // Document patterns
  if (type.includes('pdf') || type.includes('document')) {
    if (name.includes('receipt') || name.includes('invoice')) return 'Receipts';
    if (name.includes('contract') || name.includes('agreement')) return 'Legal';
    if (name.includes('report')) return 'Reports';
    return 'Documents';
  }

  return 'Notes';
};

/**
 * Find duplicate or similar memories
 */
export const findDuplicates = (newMemory, existingMemories, threshold = 0.85) => {
  const duplicates = [];

  existingMemories.forEach(existing => {
    const similarity = calculateSimilarity(newMemory, existing);
    
    if (similarity >= threshold) {
      duplicates.push({
        memory: existing,
        similarity: (similarity * 100).toFixed(0),
        reasons: getSimilarityReasons(newMemory, existing, similarity)
      });
    }
  });

  return duplicates.sort((a, b) => b.similarity - a.similarity);
};

/**
 * Calculate similarity between two memories
 */
const calculateSimilarity = (mem1, mem2) => {
  let score = 0;
  let weight = 0;

  // Title similarity (weight: 0.3)
  if (mem1.title && mem2.title) {
    const titleSim = stringSimilarity(mem1.title, mem2.title);
    score += titleSim * 0.3;
    weight += 0.3;
  }

  // File size similarity (weight: 0.2)
  if (mem1.fileSize && mem2.fileSize) {
    const sizeDiff = Math.abs(mem1.fileSize - mem2.fileSize) / Math.max(mem1.fileSize, mem2.fileSize);
    const sizeSim = 1 - Math.min(sizeDiff, 1);
    score += sizeSim * 0.2;
    weight += 0.2;
  }

  // Date similarity (weight: 0.1)
  if (mem1.dateCreated && mem2.dateCreated) {
    const date1 = new Date(mem1.dateCreated).getTime();
    const date2 = new Date(mem2.dateCreated).getTime();
    const daysDiff = Math.abs(date1 - date2) / (1000 * 60 * 60 * 24);
    const dateSim = Math.max(0, 1 - (daysDiff / 365));
    score += dateSim * 0.1;
    weight += 0.1;
  }

  // Category match (weight: 0.2)
  if (mem1.category === mem2.category) {
    score += 0.2;
    weight += 0.2;
  }

  // Tags overlap (weight: 0.2)
  if (mem1.tags && mem2.tags) {
    const tagSim = setOverlap(mem1.tags, mem2.tags);
    score += tagSim * 0.2;
    weight += 0.2;
  }

  return weight > 0 ? score / weight : 0;
};

/**
 * Get reasons for similarity
 */
const getSimilarityReasons = (mem1, mem2, similarity) => {
  const reasons = [];

  if (mem1.title && mem2.title && stringSimilarity(mem1.title, mem2.title) > 0.7) {
    reasons.push('Similar titles');
  }

  if (mem1.fileSize && mem2.fileSize) {
    const sizeDiff = Math.abs(mem1.fileSize - mem2.fileSize) / Math.max(mem1.fileSize, mem2.fileSize);
    if (sizeDiff < 0.1) {
      reasons.push('Same file size');
    }
  }

  if (mem1.category === mem2.category) {
    reasons.push('Same category');
  }

  if (mem1.tags && mem2.tags && setOverlap(mem1.tags, mem2.tags) > 0.5) {
    reasons.push('Similar tags');
  }

  if (mem1.dateCreated && mem2.dateCreated) {
    const date1 = new Date(mem1.dateCreated).getTime();
    const date2 = new Date(mem2.dateCreated).getTime();
    const daysDiff = Math.abs(date1 - date2) / (1000 * 60 * 60 * 24);
    if (daysDiff < 1) {
      reasons.push('Same day');
    }
  }

  return reasons;
};

/**
 * Calculate string similarity (Dice coefficient)
 */
const stringSimilarity = (str1, str2) => {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();

  if (s1 === s2) return 1;
  if (s1.length < 2 || s2.length < 2) return 0;

  const pairs1 = new Set();
  const pairs2 = new Set();

  for (let i = 0; i < s1.length - 1; i++) {
    pairs1.add(s1.substring(i, i + 2));
  }

  for (let i = 0; i < s2.length - 1; i++) {
    pairs2.add(s2.substring(i, i + 2));
  }

  const intersection = new Set([...pairs1].filter(x => pairs2.has(x)));
  return (2 * intersection.size) / (pairs1.size + pairs2.size);
};

/**
 * Calculate set overlap
 */
const setOverlap = (arr1, arr2) => {
  if (!arr1 || !arr2 || arr1.length === 0 || arr2.length === 0) return 0;
  
  const set1 = new Set(arr1.map(s => s.toLowerCase()));
  const set2 = new Set(arr2.map(s => s.toLowerCase()));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
};

/**
 * Extract keywords from text
 */
const extractKeywords = (text) => {
  if (!text) return [];

  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word));

  // Count word frequency
  const frequency = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  // Sort by frequency
  const sorted = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);

  return sorted;
};

/**
 * Common words to exclude from tags
 */
const commonWords = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
  'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think',
  'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well'
]);

/**
 * Batch analyze multiple memories
 */
export const batchAnalyzeMemories = (memories, onProgress) => {
  const results = [];
  let processed = 0;

  memories.forEach((memory, index) => {
    // Generate smart tags
    const smartTags = generateSmartTags(memory);
    
    // Find duplicates
    const duplicates = findDuplicates(memory, memories.slice(0, index), 0.8);

    results.push({
      memory,
      smartTags,
      duplicates: duplicates.slice(0, 3), // Top 3 duplicates
      hasDuplicates: duplicates.length > 0
    });

    processed++;
    if (onProgress) {
      onProgress((processed / memories.length) * 100);
    }
  });

  return results;
};
