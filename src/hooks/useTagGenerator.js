// Main App component for the YouTube Tag and Hashtag Generator
function App() {
  // State to store the user's input (e.g., keywords or video title)
  const [inputText, setInputText] = useState('');
  // State to store the generated YouTube tags
  const [generatedTags, setGeneratedTags] = useState([]);
  // State to store the generated YouTube hashtags
  const [generatedHashtags, setGeneratedHashtags] = useState([]);
  // State to manage the visibility of the "copied" message for tags
  const [showTagsCopied, setShowTagsCopied] = useState(false);
  // State to manage the visibility of the "copied" message for hashtags
  const [showHashtagsCopied, setShowHashtagsCopied] = useState(false);
  // State to manage the loading status during content generation
  const [isLoading, setIsLoading] = useState(false);
  // State to store any error messages
  const [error, setError] = useState('');

  // useEffect hook to set the favicon dynamically when the component mounts
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'icon';
    // Using a yellow thunderbolt SVG for the favicon
    link.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FBBF24"><path d="M11 15H6l7-14v8h5l-7 14v-8z"/></svg>';
    document.head.appendChild(link);

    // Clean up the link element if the component unmounts
    return () => {
      document.head.removeChild(link);
    };
  }, []); // Empty dependency array ensures this runs only once on mount
  /**
   * Handles the change event for the input text area.
   * Updates the inputText state with the current value of the textarea.
   * Clears any previous error messages.
   * @param {Object} e - The event object from the textarea change.
   */
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    setError(''); // Clear error when input changes
  };

  /**
   * Generates tags and hashtags from the pre-saved data based on input keywords.
   * This function now includes niche detection logic.
   */
  const generateContent = () => {
    if (!inputText.trim()) {
      setError('Please enter some keywords or a video title to generate tags.');
      setGeneratedTags([]);
      setGeneratedHashtags([]);
      return;
    }

    setIsLoading(true);
    setError('');
    setGeneratedTags([]);
    setGeneratedHashtags([]);

    // Simulate a network delay for better UX (as if an API call was made)
    setTimeout(() => {
      const inputLower = inputText.toLowerCase();
      let bestMatchNiche = null;
      let maxMatches = 0;

      // Determine the best-matching niche based on keyword overlap
      for (const dataEntry of preSavedData) {
        let currentMatches = 0;
        for (const keyword of dataEntry.keywords) {
          if (inputLower.includes(keyword)) {
            currentMatches++;
          }
        }
        if (currentMatches > maxMatches) {
          maxMatches = currentMatches;
          bestMatchNiche = dataEntry;
        }
      }

      let finalTags = [];
      let finalHashtags = [];

      if (bestMatchNiche && maxMatches > 0) {
        // If a niche is detected, use its tags and hashtags
        finalTags = bestMatchNiche.tags;
        finalHashtags = bestMatchNiche.hashtags;
      } else {
        // Fallback: if no strong niche match, split input text into basic tags and hashtags
        const basicTags = inputLower.split(/[, ]+/)
                                    .map(tag => tag.trim())
                                    .filter(tag => tag !== '');
        finalTags = basicTags;
        finalHashtags = basicTags.map(tag => `#${tag.replace(/\s+/g, '')}`);
      }

      // Deduplicate and limit the number of tags/hashtags
      const uniqueTags = Array.from(new Set(finalTags)).slice(0, 25); // Max 25 tags
      const uniqueHashtags = Array.from(new Set(finalHashtags)).slice(0, 20); // Max 20 hashtags

      setGeneratedTags(uniqueTags);
      setGeneratedHashtags(uniqueHashtags);
      setIsLoading(false);
    }, 1000); // Simulate 1 second loading time
  };

  /**
   * Copies the generated tags to the clipboard.
   * Shows a "Copied!" message temporarily.
   */
  const copyTagsToClipboard = () => {
    if (generatedTags.length === 0) return;
    const tagsToCopy = generatedTags.join(', ');
    document.execCommand('copy', false, tagsToCopy); // Deprecated but works in iframes
    setShowTagsCopied(true);
    setTimeout(() => setShowTagsCopied(false), 2000); // Hide message after 2 seconds
  };

  /**
   * Copies the generated hashtags to the clipboard.
   * Shows a "Copied!" message temporarily.
   */
  const copyHashtagsToClipboard = () => {
    if (generatedHashtags.length === 0) return;
    const hashtagsToCopy = generatedHashtags.join(' ');
    document.execCommand('copy', false, hashtagsToCopy); // Deprecated but works in iframes
    setShowHashtagsCopied(true);
    setTimeout(() => setShowHashtagsCopied(false), 2000); // Hide message after 2 seconds
  };

  /**
   * Clears all input and generated content.
   */
  const handleClearAll = () => {
    setInputText('');
    setGeneratedTags([]);
    setGeneratedHashtags([]);
    setError('');
    setShowTagsCopied(false);
    setShowHashtagsCopied(false);
    setIsLoading(false); // Ensure loading state is reset
  };
