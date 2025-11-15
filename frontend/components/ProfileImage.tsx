import React, { useState } from 'react';
import { User } from 'lucide-react';

interface ProfileImageProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ProfileImage: React.FC<ProfileImageProps> = ({ src, alt, size = 'md', className = '' }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  const handleError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Generate a consistent color based on the alt text (username)
  const getBackgroundColor = (text: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-indigo-500',
      'bg-teal-500',
    ];
    const index = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  if (imageError || !src || src === 'https://picsum.photos/200') {
    // Show fallback with user icon
    return (
      <div 
        className={`${sizeClasses[size]} ${getBackgroundColor(alt)} rounded-full flex items-center justify-center ${className}`}
        title={alt}
      >
        <User className={`${iconSizes[size]} text-white`} />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-700 ${className}`}>
      {isLoading && (
        <div className={`${sizeClasses[size]} rounded-full bg-gray-700 animate-pulse`} />
      )}
      <img
        src={src}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        className={`${sizeClasses[size]} rounded-full object-cover ${isLoading ? 'hidden' : ''}`}
      />
    </div>
  );
};

export default ProfileImage;
