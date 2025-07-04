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
    const platformTips = document.getElementById('platform-tips');
    
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
            // Try Gemini API first
            const response = await generateTagsWithGemini(title, description, niche, currentPlatform);
            
            if (response && response.tags && response.hashtags) {
                displayResults(response.tags, response.hashtags);
            } else {
                // Fallback to OpenRouter if Gemini fails
                console.log('Gemini failed, trying OpenRouter...');
                const openRouterResponse = await generateTagsWithOpenRouter(title, description, niche, currentPlatform);
                
                if (openRouterResponse && openRouterResponse.tags && openRouterResponse.hashtags) {
                    displayResults(openRouterResponse.tags, openRouterResponse.hashtags);
                } else {
                    // Final fallback to local JSON
                    console.log('APIs failed, using fallback tags...');
                    const fallbackTags = getFallbackTags(title, niche, currentPlatform);
                    displayResults(fallbackTags.tags, fallbackTags.hashtags);
                }
            }
        } catch (error) {
            console.error('Error generating tags:', error);
            // Fallback to local JSON
            const fallbackTags = getFallbackTags(title, niche, currentPlatform);
            displayResults(fallbackTags.tags, fallbackTags.hashtags);
        } finally {
            // Hide loading spinner
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
            // Show success feedback
            copyAllBtn.textContent = 'Copied!';
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            
            // Reset button text after 2 seconds
            setTimeout(() => {
                copyAllBtn.textContent = 'Copy All';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
            alert('Failed to copy to clipboard. Please try again.');
        });
    });
    
    // Display results function
    function displayResults(tags, hashtags) {
        tagsOutput.textContent = tags;
        hashtagsOutput.textContent = hashtags;
        resultsSection.classList.remove('hidden');
        updatePlatformTips();
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Update platform-specific tips
    function updatePlatformTips() {
        let tips = '';
        
        switch(currentPlatform) {
            case 'youtube':
                tips = '💡 YouTube Tip: Use a mix of broad and specific tags. Include your channel name as a tag. Place the most important tags first (max 500 characters total).';
                break;
            case 'instagram':
                tips = '💡 Instagram Tip: Use all 30 hashtags allowed. Mix popular (100k-500k posts) and niche hashtags. Place hashtags in the first comment if you prefer a cleaner caption.';
                break;
            case 'tiktok':
                tips = '💡 TikTok Tip: Use 3-5 highly relevant hashtags. Include a mix of trending and niche hashtags. Don\'t overdo it - focus on quality over quantity.';
                break;
        }
        
        platformTips.textContent = tips;
        platformTips.classList.remove('hidden');
    }
    
    // API Functions
    async function generateTagsWithGemini(title, description, niche, platform) {
        // In production, this would call your Vercel serverless function
        // which would then call the Gemini API with your API key
        
        // For now, we'll simulate a successful response
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate API failure 20% of the time for testing fallback
                if (Math.random() < 0.2) {
                    resolve(null);
                    return;
                }
                
                const tags = generateSampleTags(title, niche, platform, false);
                const hashtags = generateSampleTags(title, niche, platform, true);
                
                resolve({
                    tags: tags.join(', '),
                    hashtags: hashtags.join(' ')
                });
            }, 1500); // Simulate network delay
        });
    }
    
    async function generateTagsWithOpenRouter(title, description, niche, platform) {
        // In production, this would call your Vercel serverless function
        // which would then call the OpenRouter API with your API key
        
        // For now, we'll simulate a successful response
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate API failure 30% of the time for testing fallback
                if (Math.random() < 0.3) {
                    resolve(null);
                    return;
                }
                
                const tags = generateSampleTags(title, niche, platform, false);
                const hashtags = generateSampleTags(title, niche, platform, true);
                
                resolve({
                    tags: tags.join(', '),
                    hashtags: hashtags.join(' ')
                });
            }, 2000); // Simulate slightly longer network delay
        });
    }
    
    // Fallback tags function
    function getFallbackTags(title, niche, platform) {
        // In production, this would load from your fallback-tags.json file
        // For now, we'll generate some basic fallback tags
        
        const tags = generateSampleTags(title, niche, platform, false);
        const hashtags = generateSampleTags(title, niche, platform, true);
        
        return {
            tags: tags.join(', '),
            hashtags: hashtags.join(' ')
        };
    }
    
    // Helper function to generate sample tags (for demo purposes)
    function generateSampleTags(title, niche, platform, isHashtags) {
        const words = title.toLowerCase().split(/\s+/);
        const nicheTags = getNicheTags(niche, platform);
        const commonTags = getCommonTags(platform);
        
        // Combine words from title, niche tags, and common tags
        let tags = [...new Set([...words, ...nicheTags, ...commonTags])];
        
        // For hashtags, add # prefix and remove spaces
        if (isHashtags) {
            tags = tags.map(tag => `#${tag.replace(/\s+/g, '')}`);
            
            // Platform-specific hashtag limits
            if (platform === 'youtube') {
                tags = tags.slice(0, 15); // YouTube doesn't use many hashtags
            } else if (platform === 'instagram') {
                tags = tags.slice(0, 30); // Instagram allows up to 30
            } else if (platform === 'tiktok') {
                tags = tags.slice(0, 5); // TikTok works best with fewer hashtags
            }
        } else {
            // For regular tags, limit based on platform
            if (platform === 'youtube') {
                tags = tags.slice(0, 30); // YouTube allows many tags
            } else if (platform === 'instagram') {
                tags = tags.slice(0, 20); // Instagram uses fewer tags
            } else if (platform === 'tiktok') {
                tags = tags.slice(0, 10); // TikTok uses very few tags
            }
        }
        
        return tags;
    }
    
    // Helper function to get niche-specific tags
    function getNicheTags(niche, platform) {
        if (!niche) return [];
        
        const nicheTags = {
            gaming: ['gaming', 'game', 'gamer', 'play', 'stream', 'twitch', 'esports'],
            tech: ['tech', 'technology', 'gadget', 'review', 'unboxing', 'tutorial'],
            fitness: ['fitness', 'workout', 'exercise', 'gym', 'health', 'training'],
            beauty: ['beauty', 'makeup', 'skincare', 'cosmetics', 'tutorial', 'review'],
            cooking: ['cooking', 'recipe', 'food', 'meal', 'delicious', 'tasty'],
            travel: ['travel', 'vacation', 'tourism', 'adventure', 'explore', 'wanderlust'],
            education: ['education', 'learn', 'study', 'tutorial', 'howto', 'knowledge'],
            vlog: ['vlog', 'daily', 'life', 'lifestyle', 'dayinlife', 'routine'],
            music: ['music', 'song', 'artist', 'musician', 'performance', 'cover'],
            comedy: ['comedy', 'funny', 'humor', 'joke', 'laugh', 'entertainment'],
            business: ['business', 'finance', 'money', 'entrepreneur', 'startup', 'success']
        };
        
        return nicheTags[niche] || [];
    }
    
    // Helper function to get platform-specific common tags
    function getCommonTags(platform) {
        const commonTags = {
            youtube: ['video', 'youtube', 'youtuber', 'content', 'creator', 'subscribe', 'like', 'comment', 'share', 'trending'],
            instagram: ['insta', 'instagram', 'photo', 'pic', 'picture', 'post', 'reel', 'story', 'follow', 'like'],
            tiktok: ['tiktok', 'viral', 'trend', 'fyp', 'foryou', 'foryoupage', 'duet', 'stitch', 'creator', 'content']
        };
        
        return commonTags[platform] || [];
    }
});
