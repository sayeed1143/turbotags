document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const generateBtn = document.getElementById('generate-btn');
  const copyAllBtn = document.getElementById('copy-all-btn');
  const platformTabs = document.querySelectorAll('.tab-btn');
  const titleInput = document.getElementById('video-title');
  const descriptionInput = document.getElementById('video-description');
  const nicheSelect = document.getElementById('niche-select');
  const tagsOutput = document.getElementById('tags-output');
  const hashtagsOutput = document.getElementById('hashtags-output');
  const resultsSection = document.getElementById('results-section');
  const loadingSpinner = document.querySelector('.loading-spinner');

  // Current platform (default: YouTube)
  let currentPlatform = 'youtube';

  // Platform tab switching
  platformTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      platformTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentPlatform = tab.dataset.platform;
      updatePlatformTips();
    });
  });

  // Generate tags button click handler
  generateBtn.addEventListener('click', async () => {
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const niche = nicheSelect.value;

    if (!title) {
      alert('Please enter a title for your content');
      return;
    }

    // Show loading spinner
    loadingSpinner.classList.remove('hidden');
    generateBtn.disabled = true;

    try {
      const response = await fetch('/api/generate-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description: description || '',
          niche: niche || '',
          platform: currentPlatform
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        displayResults(data.tags, data.hashtags);
      } else {
        // Fallback to local JSON if API fails
        console.error('API Error:', data.error);
        const fallbackTags = getFallbackTags(title, niche, currentPlatform);
        displayResults(fallbackTags.tags, fallbackTags.hashtags);
      }
    } catch (error) {
      console.error('Network Error:', error);
      // Final fallback to local JSON
      const fallbackTags = getFallbackTags(title, niche, currentPlatform);
      displayResults(fallbackTags.tags, fallbackTags.hashtags);
    } finally {
      loadingSpinner.classList.add('hidden');
      generateBtn.disabled = false;
    }
  });

  // Copy all button click handler
  copyAllBtn.addEventListener('click', () => {
    const tags = tagsOutput.textContent;
    const hashtags = hashtagsOutput.textContent;
    const allContent = `Tags:\n${tags}\n\nHashtags:\n${hashtags}`;

    navigator.clipboard.writeText(allContent).then(() => {
      copyAllBtn.textContent = 'Copied!';
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => copyAllBtn.textContent = 'Copy All', 2000);
    }).catch(err => {
      console.error('Copy failed:', err);
      alert('Failed to copy. Please try again.');
    });
  });

  // Helper functions
  function displayResults(tags, hashtags) {
    tagsOutput.textContent = tags;
    hashtagsOutput.textContent = hashtags;
    resultsSection.classList.remove('hidden');
    updatePlatformTips();
    resultsSection.scrollIntoView({ behavior: 'smooth' });
  }

  function updatePlatformTips() {
    const tips = {
      youtube: '💡 YouTube Tip: Use a mix of broad and specific tags. Include your channel name as a tag.',
      instagram: '💡 Instagram Tip: Use all 30 hashtags allowed. Mix popular and niche hashtags.',
      tiktok: '💡 TikTok Tip: Use 3-5 highly relevant hashtags. Focus on trending tags.'
    };
    document.getElementById('platform-tips').textContent = tips[currentPlatform];
  }

  function getFallbackTags(title, niche, platform) {
    // Simplified fallback - expand with your own tags in production
    const words = title.toLowerCase().split(/\s+/);
    const nicheTags = {
      gaming: ['gaming', 'gameplay', 'twitch'],
      tech: ['tech', 'technology', 'gadget'],
      // Add more niches as needed
    }[niche] || [];

    const commonTags = {
      youtube: ['video', 'youtube', 'subscribe'],
      instagram: ['insta', 'instagram', 'photo'],
      tiktok: ['tiktok', 'viral', 'fyp']
    }[platform];

    const allTags = [...new Set([...words, ...nicheTags, ...commonTags])];
    const hashtags = allTags.map(tag => `#${tag.replace(/\s+/g, '')}`);

    return {
      tags: allTags.slice(0, 15).join(', '),
      hashtags: hashtags.slice(0, 10).join(' ')
    };
  }
});
