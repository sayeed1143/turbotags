// Platform-specific configurations
const PLATFORM_CONFIG = {
  youtube: {
    hashtagLimit: 500,
    videoTagLimit: 500,
    maxHashtags: 15,
    tips: "🎬 YouTube: Use 10-15 relevant tags. Mix broad and specific keywords. Include your main keyword in the first few tags."
  },
  instagram: {
    hashtagLimit: 2200,
    maxHashtags: 30,
    tips: "📸 Instagram: Use 20-30 hashtags for maximum reach. Mix popular and niche tags. Use location and community hashtags."
  },
  tiktok: {
    hashtagLimit: 2200,
    maxHashtags: 20,
    tips: "🎵 TikTok: Use 3-5 trending hashtags + niche tags. Include #fyp #foryou for algorithm boost. Check trending sounds."
  },
  twitter: {
    hashtagLimit: 280,
    maxHashtags: 5,
    tips: "🐦 Twitter/X: Keep it short! Use 1-3 relevant hashtags max. Focus on trending topics and conversations."
  },
  linkedin: {
    hashtagLimit: 3000,
    maxHashtags: 10,
    tips: "💼 LinkedIn: Use 3-10 professional hashtags. Focus on industry keywords and thought leadership topics."
  }
};

// Enhanced tag suggestions by category
const TAG_ENHANCEMENTS = {
  general: ['viral', 'trending', 'new', 'popular', 'amazing', 'best', 'top', 'cool', 'awesome', 'epic'],
  youtube: ['subscribe', 'tutorial', 'howto', 'review', 'unboxing', 'vlog', 'gaming', 'music', 'comedy', 'education'],
  instagram: ['instagood', 'photooftheday', 'instadaily', 'picoftheday', 'love', 'beautiful', 'happy', 'cute', 'tbt', 'follow'],
  tiktok: ['fyp', 'foryou', 'viral', 'trend', 'dance', 'comedy', 'duet', 'challenge', 'funny', 'trending'],
  twitter: ['breaking', 'news', 'opinion', 'thread', 'discussion', 'update', 'live', 'thoughts', 'today', 'now'],
  linkedin: ['career', 'business', 'professional', 'networking', 'leadership', 'growth', 'innovation', 'strategy', 'industry', 'success']
};

// Global state
let isGenerating = false;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
  updatePlatformTips();
  setupEventListeners();
});

function setupEventListeners() {
  // Platform change handler
  const platformSelect = document.getElementById('platform');
  platformSelect.addEventListener('change', updatePlatformTips);
  
  // Enter key handler for input
  const keywordsInput = document.getElementById('keywords');
  keywordsInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !isGenerating) {
      generateTags();
    }
  });
  
  // Real-time input validation
  keywordsInput.addEventListener('input', function() {
    this.value = this.value.replace(/[^\w\s,.-]/g, '');
  });
}

function updatePlatformTips() {
  const platform = document.getElementById('platform').value;
  const config = PLATFORM_CONFIG[platform];
  const tipsElement = document.getElementById('platform-tips');
  
  if (tipsElement && config) {
    tipsElement.textContent = config.tips;
  }
}

function generateTags() {
  if (isGenerating) return;
  
  const keywords = document.getElementById('keywords').value.trim();
  const platform = document.getElementById('platform').value;
  
  if (!keywords) {
    showNotification('Please enter some keywords first! 💡', 'warning');
    return;
  }
  
  if (keywords.length < 3) {
    showNotification('Please enter at least 3 characters! ⚠️', 'warning');
    return;
  }
  
  setLoadingState(true);
  
  // Simulate API call delay for better UX
  setTimeout(() => {
    try {
      const result = processTagGeneration(keywords, platform);
      displayResults(result, platform);
      showNotification('Tags generated successfully! ✨', 'success');
    } catch (error) {
      showNotification('Something went wrong. Please try again! 😅', 'error');
      console.error('Tag generation error:', error);
    } finally {
      setLoadingState(false);
    }
  }, 800);
}

function processTagGeneration(keywords, platform) {
  const config = PLATFORM_CONFIG[platform];
  const keywordList = keywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k.length > 0);
  
  // Generate base tags
  let baseTags = keywordList.map(tag => tag.replace(/\s+/g, ''));
  
  // Add platform-specific enhancements
  const platformTags = TAG_ENHANCEMENTS[platform] || [];
  const generalTags = TAG_ENHANCEMENTS.general;
  
  // Intelligently add relevant tags
  const enhancedTags = [...baseTags];
  
  // Add a few random platform-specific tags
  const randomPlatformTags = getRandomElements(platformTags, Math.min(3, platformTags.length));
  enhancedTags.push(...randomPlatformTags);
  
  // Add some general tags
  const randomGeneralTags = getRandomElements(generalTags, 2);
  enhancedTags.push(...randomGeneralTags);
  
  // Create variations for longer keywords
  keywordList.forEach(keyword => {
    if (keyword.includes(' ')) {
      const variations = [
        keyword.replace(/\s+/g, ''),
        keyword.replace(/\s+/g, '_'),
        keyword.split(' ')[0] // First word only
      ];
      enhancedTags.push(...variations);
    }
  });
  
  // Remove duplicates and limit based on platform
  const uniqueTags = [...new Set(enhancedTags)].slice(0, config.maxHashtags);
  
  // Generate hashtags
  const hashtags = uniqueTags.map(tag => `#${tag}`).join(' ');
  
  // Generate video tags (for platforms that support them)
  const videoTags = platform === 'youtube' ? baseTags.join(', ') : '';
  
  return {
    hashtags,
    videoTags,
    hashtagCount: hashtags.length,
    videoTagCount: videoTags.length,
    platform
  };
}

function getRandomElements(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function displayResults(result, platform) {
  const config = PLATFORM_CONFIG[platform];
  const output = document.getElementById('output');
  
  // Show hashtags
  document.getElementById('hashtags').textContent = result.hashtags;
  updateCharacterCount('hashtags-count', result.hashtagCount, config.hashtagLimit);
  
  // Show/hide video tags section based on platform
  const videoTagsSection = document.getElementById('videotags-section');
  if (platform === 'youtube' && result.videoTags) {
    document.getElementById('videotags').textContent = result.videoTags;
    updateCharacterCount('videotags-count', result.videoTagCount, config.videoTagLimit);
    videoTagsSection.style.display = 'block';
  } else {
    videoTagsSection.style.display = 'none';
  }
  
  // Show output with animation
  output.classList.add('visible');
  
  // Scroll to results
  setTimeout(() => {
    output.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 300);
}

function updateCharacterCount(elementId, count, limit) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  element.textContent = `${count}/${limit} characters`;
  
  // Update styling based on usage
  element.classList.remove('warning', 'error');
  if (count > limit * 0.9) {
    element.classList.add('error');
  } else if (count > limit * 0.7) {
    element.classList.add('warning');
  }
}

function setLoadingState(loading) {
  isGenerating = loading;
  const generateBtn = document.querySelector('.btn-primary');
  const resetBtn = document.querySelector('.btn-secondary');
  
  if (loading) {
    generateBtn.classList.add('loading');
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<span>⚡</span> Generating...';
    resetBtn.disabled = true;
  } else {
    generateBtn.classList.remove('loading');
    generateBtn.disabled = false;
    generateBtn.innerHTML = '<span>🚀</span> Generate Tags';
    resetBtn.disabled = false;
  }
}

async function copyToClipboard(text, type) {
  if (!text) {
    showNotification('Nothing to copy! Generate tags first. 🤔', 'warning');
    return;
  }
  
  try {
    await navigator.clipboard.writeText(text);
    showNotification(`${type} copied successfully! 📋✨`, 'success');
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showNotification(`${type} copied! 📋`, 'success');
  }
}

function copyHashTags() {
  const text = document.getElementById('hashtags').textContent;
  copyToClipboard(text, 'Hashtags');
}

function copyVideoTags() {
  const text = document.getElementById('videotags').textContent;
  copyToClipboard(text, 'Video tags');
}

function resetFields() {
  // Clear inputs
  document.getElementById('keywords').value = '';
  document.getElementById('hashtags').textContent = '';
  document.getElementById('videotags').textContent = '';
  
  // Clear character counts
  document.getElementById('hashtags-count').textContent = '';
  document.getElementById('videotags-count').textContent = '';
  
  // Hide output
  const output = document.getElementById('output');
  output.classList.remove('visible');
  
  // Hide video tags section
  document.getElementById('videotags-section').style.display = 'none';
  
  // Update platform tips
  updatePlatformTips();
  
  // Focus on input
  document.getElementById('keywords').focus();
  
  showNotification('Fields reset! Ready for new tags. 🔄', 'info');
}

function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');
  if (!notification) return;
  
  // Set message and styling
  notification.textContent = message;
  notification.className = `notification ${type}`;
  
  // Show notification
  notification.classList.add('show');
  
  // Hide after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
  // Ctrl/Cmd + Enter to generate
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    if (!isGenerating) generateTags();
  }
  
  // Escape to reset
  if (e.key === 'Escape') {
    e.preventDefault();
    resetFields();
  }
  
  // Ctrl/Cmd + C to copy hashtags when focused on output
  if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.activeElement.closest('.output')) {
    e.preventDefault();
    copyHashTags();
  }
});

// Add some visual feedback for better UX
document.addEventListener('click', function(e) {
  if (e.target.matches('.btn')) {
    // Add click effect
    e.target.style.transform = 'scale(0.95)';
    setTimeout(() => {
      e.target.style.transform = '';
    }, 150);
  }
});

// Auto-focus on keywords input when page loads
window.addEventListener('load', function() {
  document.getElementById('keywords').focus();
});
