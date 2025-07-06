  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8 flex items-center justify-center font-inter relative">
      {/* Custom CSS for floating animation */}
      <style>
        {`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        `}
      </style>

      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-3xl border border-gray-200">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-800 mb-6 flex items-center justify-center">
          {/* Thunder icon SVG for the logo */}
          <svg className="w-8 h-8 sm:w-10 sm:h-10 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 15H6l7-14v8h5l-7 14v-8z"/>
          </svg>
          TurboTags
        </h1>

        {/* Input Section */}
        <div className="mb-6">
          <label htmlFor="input-text" className="block text-gray-700 text-lg font-semibold mb-2">
            Enter Keywords or Video Title:
          </label>
          <textarea
            id="input-text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out text-gray-800 resize-y min-h-[100px]"
            rows="4"
            placeholder="e.g., 'React tutorial for beginners, web development, JavaScript framework'"
            value={inputText}
            onChange={handleInputChange}
            disabled={isLoading} // Disable input while loading
          ></textarea>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <button
            onClick={generateContent}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform transition duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center sm:w-auto w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            )}
            {isLoading ? 'Generating...' : 'Generate Tags & Hashtags'}
          </button>

          <button
            onClick={handleClearAll}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-xl shadow-lg transform transition duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 flex items-center justify-center sm:w-auto w-full"
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            Clear All
          </button>
        </div>

        {/* Error Message Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-6" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        {/* Generated Tags Section */}
        {generatedTags.length > 0 && (
          <div className="bg-blue-50 p-5 rounded-xl border border-blue-200 mb-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-3 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
              Generated YouTube Tags
            </h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {generatedTags.map((tag, index) => (
                <span key={index} className="bg-blue-200 text-blue-800 text-sm font-medium px-3 py-1 rounded-full shadow-sm animate-float">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center">
              <button
                onClick={copyTagsToClipboard}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg flex items-center transition duration-200 ease-in-out text-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                Copy Tags
              </button>
              {showTagsCopied && (
                <span className="ml-3 text-green-600 text-sm font-semibold animate-fade-in">Copied!</span>
              )}
            </div>
          </div>
        )}

        {/* Generated Hashtags Section */}
        {generatedHashtags.length > 0 && (
          <div className="bg-purple-50 p-5 rounded-xl border border-purple-200">
            <h2 className="text-xl font-semibold text-purple-800 mb-3 flex items-center">
              <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path></svg>
              Generated YouTube Hashtags
            </h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {generatedHashtags.map((hashtag, index) => (
                <span key={index} className="bg-purple-200 text-purple-800 text-sm font-medium px-3 py-1 rounded-full shadow-sm animate-float">
                  {hashtag}
                </span>
              ))}
            </div>
            <div className="flex items-center">
              <button
                onClick={copyHashtagsToClipboard}
                className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg flex items-center transition duration-200 ease-in-out text-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                Copy Hashtags
              </button>
              {showHashtagsCopied && (
                <span className="ml-3 text-green-600 text-sm font-semibold animate-fade-in">Copied!</span>
              )}
            </div>
          </div>
        )}

        {/* New Section: How Tag Generators Work */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            How Tag Generators Work
          </h2>
          <p className="text-gray-700 mb-4">
            Tag and hashtag generators, like TurboTags, use various methods to provide you with relevant suggestions. Understanding these approaches can help you appreciate the technology behind them:
          </p>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
              Hybrid Approaches & AI (Future)
            </h3>
            <p className="text-gray-700">
              The most powerful generators combine various methods. They might use a large static database for common queries and then leverage advanced AI models (like Google's Gemini API) for more nuanced, creative, or real-time suggestions based on complex inputs. This allows for both efficiency and high-quality, context-aware tag generation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
