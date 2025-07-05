document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const generateBtn = document.getElementById('generate-btn');
  const copyTagsBtn = document.getElementById('copy-tags-btn');
  const copyHashtagsBtn = document.getElementById('copy-hashtags-btn');
  const savePresetBtn = document.getElementById('save-preset-btn');
  const platformTabs = document.querySelectorAll('.platform-tab');
  const titleInput = document.getElementById('content-title');
  const nicheSelect = document.getElementById('content-niche');
  const languageSelect = document.getElementById('content-language');
  const tagsOutput = document.getElementById('tags-output');
  const hashtagsOutput = document.getElementById('hashtags-output');
  const resultsSection = document.getElementById('results-section');
  const spinner = document.querySelector('.spinner');
  const tagCloud = document.querySelector('.tag-cloud');

  // State
  let currentPlatform = 'youtube';
  let generatedTags = [];
  let generatedHashtags = [];

  // Platform tab switching
  platformTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      platformTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentPlatform = tab.dataset.platform;
      updatePlatformTips();
      updateResultsMeta();
    });
  });

  // Generate tags
  generateBtn.addEventListener('click', handleGenerate);

  // Copy buttons
  copyTagsBtn.addEventListener('click', () => copyToClipboard(tagsOutput));
  copyHashtagsBtn.addEventListener('click', () => copyToClipboard(hashtagsOutput));
  savePresetBtn.addEventListener('click', savePreset);

  // Handle Enter key in title input
  titleInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleGenerate();
  });

  async function handleGenerate() {
    const title = titleInput.value.trim();
    const niche = nicheSelect.value;
    const language = languageSelect.value;

    if (!title) {
      showToast('Please enter a content title');
      titleInput.focus();
      return;
    }

    // UI Feedback
    generateBtn.disabled = true;
    spinner.classList.remove('hidden');
    clearResults();

    try {
      const response = await fetchWithTimeout('/api/generate-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          niche: niche || undefined,
          language,
          platform: currentPlatform
        })
      }, 5000); // 5 second timeout

      const data = await response.json();

      if (response.ok) {
        generatedTags = data.tags?.split(',') || [];
        generatedHashtags = data.hashtags?.split(' ') || [];
        displayResults();
        animateTagCloud();
      } else {
        throw new Error(data.error || 'API request failed');
      }
    } catch (error) {
      console.error('Generation error:', error);
      useFallbackTags(title, niche);
    } finally {
      generateBtn.disabled = false;
      spinner.classList.add('hidden');
    }
  }

  function displayResults() {
    // Display tags with click-to-copy functionality
    tagsOutput.innerHTML = generatedTags.map(tag => 
      `<span class="tag" data-tag="${tag.trim()}">${tag.trim()}</span>`
    ).join('');

    // Display hashtags
    hashtagsOutput.innerHTML = generatedHashtags.map(hashtag =>
      `<span class="hashtag">${hashtag.trim()}</span>`
    ).join('');

    // Add click handlers to individual tags
    document.querySelectorAll('.tag').forEach(tag => {
      tag.addEventListener('click', () => {
        navigator.clipboard.writeText(tag.dataset.tag);
        showToast(`Copied: ${tag.dataset.tag}`);
      });
    });

    // Show results section
    resultsSection.classList.remove('hidden');
    updatePlatformTips();
    updateResultsMeta();
    resultsSection.scrollIntoView({ behavior: 'smooth' });
  }

  function useFallbackTags(title, niche) {
    const words = title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const nicheTags = getNicheTags(niche);
    const platformTags = getPlatformTags(currentPlatform);
    
    generatedTags = [...new Set([...words, ...nicheTags, ...platformTags])].slice(0, 20);
    generatedHashtags = generatedTags.map(t => `#${t.replace(/\s+/g, '')}`).slice(0, 10);
    
    displayResults();
    showToast('Using fallback tags (API unavailable)', 'warning');
  }

  function animateTagCloud() {
    // Clear existing animation
    tagCloud.innerHTML = '';
    
    // Create animated tag elements
    generatedTags.slice(0, 15).forEach(tag => {
      const el = document.createElement('div');
      el.className = 'cloud-tag';
      el.textContent = tag;
      el.style.left = `${Math.random() * 90}%`;
      el.style.top = `${Math.random() * 90}%`;
      tagCloud.appendChild(el);
    });
  }

  // Helper functions
  function updatePlatformTips() {
    const tips = {
      youtube: 'Use the first 5 tags in your video description for better SEO. Include your channel name as a tag.',
      instagram: 'Mix 10 popular hashtags, 10 moderately popular, and 10 niche hashtags for best reach.',
      tiktok: 'Use 3-5 highly relevant hashtags. The first hashtag should be your most important keyword.'
    };
    document.getElementById('platform-tips-content').textContent = tips[currentPlatform];
    document.getElementById('platform-name').textContent = 
      currentPlatform.charAt(0).toUpperCase() + currentPlatform.slice(1);
  }

  function updateResultsMeta() {
    document.getElementById('tags-count').textContent = `${generatedTags.length} tags`;
    document.getElementById('hashtags-count').textContent = `${generatedHashtags.length} hashtags`;
    document.getElementById('tags-platform').textContent = 
      currentPlatform.charAt(0).toUpperCase() + currentPlatform.slice(1);
  }

  function clearResults() {
    tagsOutput.innerHTML = '';
    hashtagsOutput.innerHTML = '';
    tagCloud.innerHTML = '';
  }

  async function copyToClipboard(element) {
    try {
      await navigator.clipboard.writeText(element.textContent);
      showToast(`Copied ${element.previousElementSibling.textContent.toLowerCase()}`);
      triggerConfetti();
    } catch (err) {
      showToast('Failed to copy', 'error');
      console.error('Copy failed:', err);
    }
  }

  function savePreset() {
    // In a real app, you would save to localStorage or database
    showToast('Preset saved!', 'success');
    console.log('Saved preset:', {
      tags: generatedTags,
      hashtags: generatedHashtags,
      platform: currentPlatform
    });
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  }

  function triggerConfetti() {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

  // Utility functions
  async function fetchWithTimeout(resource, options = {}, timeout = 8000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal  
    });
    
    clearTimeout(id);
    return response;
  }

  function getNicheTags(niche) {
    const tags = {
      gaming: ['gaming', 'gameplay', 'twitch', 'streamer', 'esports'],
      tech: ['tech', 'technology', 'gadget', 'review', 'unboxing'],
      fitness: ['fitness', 'workout', 'gym', 'exercise', 'training'],
      // Add more niches as needed
    };
    return niche ? tags[niche] || [] : [];
  }

  function getPlatformTags(platform) {
    return {
      youtube: ['youtube', 'video', 'subscribe', 'youtuber'],
      instagram: ['instagram', 'insta', 'photo', 'reel'],
      tiktok: ['tiktok', 'fyp', 'viral', 'trending']
    }[platform];
  }
});
