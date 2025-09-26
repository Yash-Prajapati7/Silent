import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { Smile } from 'lucide-react';
import { useIsDarkMode } from '../stores/themeStore';

const EmojiSelector = ({ onEmojiSelect, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isDarkMode = useIsDarkMode();
  const pickerRef = useRef(null);
  const buttonRef = useRef(null);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        pickerRef.current && 
        !pickerRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEmojiClick = (emojiData) => {
    onEmojiSelect(emojiData.emoji);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          p-2 md:p-3 rounded-xl transition-all duration-200 hover:scale-105 border-2
          ${isDarkMode
            ? 'text-white border-white/30 hover:border-white/50 hover:bg-white/10'
            : 'text-black border-black/30 hover:border-black/50 hover:bg-black/10'
          }
        `}
        title="Add emoji"
      >
        <Smile className="w-5 h-5" />
      </button>

      {isOpen && (
        <div 
          ref={pickerRef}
          className={`
            absolute bottom-full right-0 mb-2 z-50 rounded-2xl shadow-2xl border-2 overflow-hidden
            ${isDarkMode ? 'border-white/20' : 'border-black/20'}
          `}
          style={{
            filter: 'drop-shadow(0 25px 25px rgba(0, 0, 0, 0.15))'
          }}
        >
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme={isDarkMode ? 'dark' : 'light'}
            height={400}
            width={350}
            previewConfig={{
              showPreview: false
            }}
            skinTonesDisabled={false}
            searchDisabled={false}
            categoryEmojis={{
              recent: '⏰',
              smileys_people: '😊',
              animals_nature: '🐻',
              food_drink: '🍎',
              travel_places: '✈️',
              activities: '⚽',
              objects: '📱',
              symbols: '❤️',
              flags: '🏳️'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default EmojiSelector;
