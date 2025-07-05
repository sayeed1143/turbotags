document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const generateBtn = document.getElementById('generate-btn');
    const copyAllBtn = document.getElementById('copy-all-btn');
    const platformTabs = document.querySelectorAll('.tab-btn');
    const titleInput = document.getElementById('video-title');
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
        });
    });

    // Generate tags button click handler
    generateBtn.addEventListener('click', async () => {
        const title = titleInput.value.trim();

        if (!title) {
            alert('Please enter a title for your content');
            return;
        }

        // Show loading spinner
        loadingSpinner.classList.remove('hidden');
        generateBtn.disabled = true;

        try {
            // Simulate API call with timeout
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Generate sample tags based on platform
            const { tags, hashtags } = generateSampleTags(title, currentPlatform);
            
            // Display results
            tagsOutput.textContent = tags;
            hashtagsOutput.textContent = hashtags;
            resultsSection.classList.remove('hidden');
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to generate tags. Please try again.');
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

    // Helper function to generate sample tags
    function generateSampleTags(title, platform) {
        const words = title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        
        const platformTags = {
            youtube: ['video', 'youtube', 'subscribe', 'content', 'creator'],
            instagram: ['insta', 'instagram', 'photo', 'reel', 'story'],
            tiktok: ['tiktok', 'viral', 'fyp', 'trending', 'foryou']
        }[platform] || [];
        
        const allTags = [...new Set([...words, ...platformTags])].slice(0, 15);
        const hashtags = allTags.map(tag => `#${tag.replace(/\s+/g, '')}`).slice(0, 10);

        return {
            tags: allTags.join(', '),
            hashtags: hashtags.join(' ')
        };
    }
});
