document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const generateBtn = document.getElementById('generate-btn');
    const copyAllBtn = document.getElementById('copy-all-btn');
    const platformTabs = document.querySelectorAll('.tab-btn');
    const titleInput = document.getElementById('video-title');
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
            updateTagDisplay();
        });
    });

    // Generate tags button click handler
    generateBtn.addEventListener('click', async () => {
        const title = titleInput.value.trim();
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

    // Auto-detect niche when title changes
    titleInput.addEventListener('input', () => {
        if (!nicheSelect.value) {
            const detectedNiche = detectNiche(titleInput.value);
            if (detectedNiche) {
                nicheSelect.value = detectedNiche;
            }
        }
    });

    // Copy all button click handler
    copyAllBtn.addEventListener('click', () => {
        const tags = tagsOutput.textContent;
        const hashtags = hashtagsOutput.textContent;
        const allContent = currentPlatform === 'youtube' 
            ? `Tags:\n${tags}\n\nHashtags:\n${hashtags}`
            : `Hashtags:\n${hashtags}`;

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
        updateTagDisplay(tags, hashtags);
        resultsSection.classList.remove('hidden');
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    function updateTagDisplay(tags = '', hashtags = '') {
        if (currentPlatform === 'youtube') {
            tagsOutput.textContent = tags;
            hashtagsOutput.textContent = hashtags;
            document.querySelector('.tags-column').style.display = 'block';
        } else {
            // For Instagram/TikTok only show hashtags
            hashtagsOutput.textContent = hashtags;
            document.querySelector('.tags-column').style.display = 'none';
        }
    }

    function detectNiche(title) {
        const titleLower = title.toLowerCase();
        const niches = {
            gaming: ['game', 'gaming', 'playthrough', 'esports', 'twitch'],
            tech: ['tech', 'technology', 'gadget', 'review', 'unboxing'],
            fitness: ['workout', 'fitness', 'gym', 'exercise', 'training'],
            beauty: ['makeup', 'beauty', 'skincare', 'cosmetic', 'hairstyle'],
            cooking: ['recipe', 'cooking', 'food', 'meal', 'cook'],
            travel: ['travel', 'vacation', 'destination', 'tourism', 'adventure'],
            education: ['learn', 'tutorial', 'education', 'course', 'study'],
            vlog: ['vlog', 'day in life', 'lifestyle', 'routine', 'daily']
        };

        for (const [niche, keywords] of Object.entries(niches)) {
            if (keywords.some(keyword => titleLower.includes(keyword))) {
                return niche;
            }
        }
        return null;
    }

    function getFallbackTags(title, niche, platform) {
        const words = title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const nicheTags = getNicheTags(niche);
        const platformTags = getPlatformTags(platform);
        
        const allTags = [...new Set([...words, ...nicheTags, ...platformTags])];
        const hashtags = allTags.map(tag => `#${tag.replace(/\s+/g, '')}`);

        return {
            tags: allTags.slice(0, 20).join(', '),
            hashtags: hashtags.slice(0, 20).join(' ')
        };
    }

    function getNicheTags(niche) {
        const tags = {
            gaming: ['gaming', 'gameplay', 'walkthrough', 'letsplay', 'pcgaming', 'console', 'twitch', 'streamer', 'esports', 'videogames'],
            tech: ['technology', 'tech', 'gadget', 'review', 'unboxing', 'tutorial', 'howto', 'electronics', 'smartphone', 'laptop'],
            fitness: ['fitness', 'workout', 'gym', 'exercise', 'training', 'bodybuilding', 'cardio', 'yoga', 'health', 'wellness'],
            beauty: ['beauty', 'makeup', 'skincare', 'cosmetics', 'hairstyle', 'glam', 'tutorial', 'review', 'aesthetic', 'selfcare'],
            cooking: ['cooking', 'food', 'recipe', 'meal', 'chef', 'kitchen', 'tutorial', 'howto', 'baking', 'healthy'],
            travel: ['travel', 'vacation', 'destination', 'tourism', 'adventure', 'wanderlust', 'explore', 'trip', 'holiday', 'journey'],
            education: ['education', 'learn', 'tutorial', 'howto', 'study', 'knowledge', 'school', 'course', 'lesson', 'training'],
            vlog: ['vlog', 'lifestyle', 'dayinlife', 'routine', 'daily', 'morning', 'evening', 'storytime', 'update', 'personal']
        };
        return niche ? tags[niche] || [] : [];
    }

    function getPlatformTags(platform) {
        return {
            youtube: ['youtube', 'video', 'subscribe', 'youtuber', 'content', 'creator', 'watch', 'view', 'like', 'comment'],
            instagram: ['instagram', 'insta', 'photo', 'reel', 'story', 'post', 'grid', 'feed', 'igtv', 'explore'],
            tiktok: ['tiktok', 'fyp', 'viral', 'trending', 'foryou', 'foryoupage', 'duet', 'stitch', 'tiktoker', 'creator']
        }[platform];
    }
});
