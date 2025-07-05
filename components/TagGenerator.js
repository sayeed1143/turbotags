import { useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faSave } from '@fortawesome/free-solid-svg-icons';

export default function TagGenerator() {
  const [input, setInput] = useState('');
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const generateTags = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/generate', { input });
      setTags(response.data.tags);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(tags.join(', '));
  };

  return (
    <div>
      <div className="flex mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter YouTube URL or keywords"
          className="flex-grow p-2 border rounded-l"
        />
        <button 
          onClick={generateTags}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </div>
      
      {tags.length > 0 && (
        <div className="bg-white p-4 rounded shadow">
          <div className="flex justify-between mb-2">
            <h3 className="font-bold">Generated Tags</h3>
            <div>
              <button 
                onClick={copyToClipboard}
                className="mr-2 text-blue-500 hover:text-blue-700"
                title="Copy to clipboard"
              >
                <FontAwesomeIcon icon={faCopy} />
              </button>
              <button 
                className="text-blue-500 hover:text-blue-700"
                title="Save tags"
              >
                <FontAwesomeIcon icon={faSave} />
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span key={index} className="bg-gray-100 px-2 py-1 rounded text-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
