import { useState } from 'react';
import Head from 'next/head';
import TagGenerator from '../components/TagGenerator';
import HashtagAnalyzer from '../components/HashtagAnalyzer';

export default function Home() {
  const [activeTab, setActiveTab] = useState('tags');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Advanced YouTube Tags & Hashtags Generator</title>
        <meta name="description" content="Generate optimal tags and hashtags for YouTube videos" />
      </Head>

      <main className="container mx-auto py-8 px-4">
        <div className="flex border-b mb-6">
          <button 
            className={`py-2 px-4 ${activeTab === 'tags' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('tags')}
          >
            Tag Generator
          </button>
          <button 
            className={`py-2 px-4 ${activeTab === 'hashtags' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('hashtags')}
          >
            Hashtag Analyzer
          </button>
        </div>

        {activeTab === 'tags' ? <TagGenerator /> : <HashtagAnalyzer />}
      </main>
    </div>
  );
}
