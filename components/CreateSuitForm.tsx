
import React, { useState } from 'react';
import type { Profile } from '../types';
import { generateSuitContent } from '../services/geminiService';
import { AIGenerateIcon } from './common/Icons';

interface CreateSuitFormProps {
  currentUser: Profile;
  onSubmit: (body: string) => void;
}

const CreateSuitForm: React.FC<CreateSuitFormProps> = ({ currentUser, onSubmit }) => {
  const [body, setBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const maxLength = 280;

  const handleGenerateSuit = async () => {
    if(body.trim() === '') {
        alert("Please provide a topic to generate a Suit about.");
        return;
    }
    setIsGenerating(true);
    const generatedContent = await generateSuitContent(body);
    setBody(generatedContent);
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (body.trim()) {
      onSubmit(body.trim());
      setBody('');
    }
  };

  return (
    <div className="p-4 border-b border-border">
      <div className="flex space-x-4">
        <img src={currentUser.profileImageUrl} alt="Your avatar" className="w-12 h-12 rounded-full" />
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What's happening?!"
              className="w-full bg-transparent text-xl p-2 outline-none resize-none"
              rows={3}
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleGenerateSuit}
                  disabled={isGenerating}
                  className="flex items-center space-x-2 px-3 py-1.5 text-sm font-semibold text-primary bg-primary/10 rounded-full hover:bg-primary/20 disabled:opacity-50 transition-colors"
                >
                  <AIGenerateIcon />
                  <span>{isGenerating ? 'Generating...' : 'Ask AI'}</span>
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`text-sm ${body.length > maxLength ? 'text-red-500' : 'text-on-surface-secondary'}`}>
                  {body.length}/{maxLength}
                </span>
                <button
                  type="submit"
                  disabled={!body.trim() || body.length > maxLength}
                  className="bg-primary text-white font-bold py-2 px-6 rounded-full hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Suit
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSuitForm;
