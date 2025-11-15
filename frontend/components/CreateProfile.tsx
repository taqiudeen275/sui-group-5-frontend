import React, { useState } from 'react';
import { useProfile } from '../src/hooks/useProfile';

interface CreateProfileProps {
  onSuccess?: () => void;
}

const CreateProfile: React.FC<CreateProfileProps> = ({ onSuccess }) => {
  const { createProfile } = useProfile();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await createProfile({
        username,
        bio,
        profileImageUrl: profileImageUrl || 'https://picsum.photos/200',
      });
      // Success! Call the callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6">Create Your Profile</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded text-red-500">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-2">
            Username *
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            maxLength={30}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter your username"
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium mb-2">
            Bio *
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            required
            maxLength={160}
            rows={3}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder="Tell us about yourself"
          />
          <p className="text-sm text-on-surface-secondary mt-1">
            {bio.length}/160
          </p>
        </div>

        <div>
          <label htmlFor="profileImage" className="block text-sm font-medium mb-2">
            Profile Image URL (optional)
          </label>
          <input
            id="profileImage"
            type="url"
            value={profileImageUrl}
            onChange={(e) => setProfileImageUrl(e.target.value)}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="https://example.com/image.jpg"
          />
          <p className="text-sm text-on-surface-secondary mt-1">
            Leave empty for a random avatar
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !username || !bio}
          className="w-full py-3 bg-primary text-white font-bold rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Creating Profile...' : 'Create Profile'}
        </button>
      </form>
    </div>
  );
};

export default CreateProfile;
