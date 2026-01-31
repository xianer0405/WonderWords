
import React, { useState, useEffect } from 'react';
import { Word } from '../types';
import { Volume2, Sparkles, ChevronRight, ChevronLeft, PenTool, AlertCircle } from 'lucide-react';
import { generateFunSentence } from '../services/geminiService';

interface FlashcardProps {
  words: Word[];
  onComplete: () => void;
  onBack: () => void;
  onStartSpelling: (words: Word[]) => void;
}

const Flashcard: React.FC<FlashcardProps> = ({ words, onComplete, onBack, onStartSpelling }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [aiSentence, setAiSentence] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Guard clause against empty word lists
  const currentWord = words && words.length > 0 ? words[currentIndex] : undefined;

  // Speak function
  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setAiSentence(null);
    if (currentIndex < words.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 300); // Small delay for flip animation if needed
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setAiSentence(null);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 300);
    }
  };

  const handleAiStory = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (aiSentence) {
        speak(aiSentence);
        return;
    }
    
    if (currentWord) {
        setIsLoadingAi(true);
        const sentence = await generateFunSentence(currentWord);
        setAiSentence(sentence);
        setIsLoadingAi(false);
        speak(sentence);
    }
  };

  // Render Error/Empty State if no word exists
  if (!currentWord) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
              <AlertCircle className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-2xl font-bold text-gray-600 mb-2">No words found</h3>
              <p className="text-gray-500 mb-6">It seems there are no words to learn in this category.</p>
              <button 
                onClick={onBack}
                className="px-6 py-3 bg-brand-blue text-white rounded-xl font-bold shadow-lg hover:bg-blue-600 transition-all"
              >
                  Go Back
              </button>
          </div>
      );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 w-full max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="w-full mb-6 flex items-center gap-4">
        <button onClick={onBack} className="text-gray-500 hover:text-brand-blue font-bold">
             &larr; Exit
        </button>
        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden border-2 border-gray-300">
          <div 
            className="h-full bg-brand-yellow transition-all duration-500 ease-out"
            style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
          />
        </div>
        <span className="font-bold text-gray-600">
            {currentIndex + 1} / {words.length}
        </span>
      </div>

      {/* Card Container */}
      <div 
        className="relative w-full aspect-[4/5] sm:aspect-[4/3] group cursor-pointer"
        style={{ perspective: '1000px' }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div 
            className="relative w-full h-full transition-transform duration-700"
            style={{ 
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
        >
          
          {/* FRONT SIDE */}
          <div 
            className="absolute w-full h-full bg-white rounded-3xl border-b-8 border-brand-blue shadow-2xl flex flex-col items-center justify-center p-8"
            style={{ 
                backfaceVisibility: 'hidden', 
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(0deg)' 
            }}
          >
            <div className="text-[120px] sm:text-[150px] animate-bounce-slow filter drop-shadow-lg">
              {currentWord.emoji}
            </div>
            <h2 className="text-5xl sm:text-6xl font-bold text-gray-800 mt-4 tracking-wide text-center">
              {currentWord.english}
            </h2>
             <div className="mt-2 text-gray-400 text-sm font-semibold uppercase tracking-widest">
                Tap to Flip / 点击翻转
            </div>
            
            <button 
                onClick={(e) => { e.stopPropagation(); speak(currentWord.english); }}
                className="absolute top-4 right-4 p-4 bg-brand-yellow rounded-full hover:scale-110 transition-transform shadow-md border-2 border-yellow-500 text-yellow-900"
            >
                <Volume2 size={32} />
            </button>
          </div>

          {/* BACK SIDE */}
          <div 
            className="absolute w-full h-full bg-brand-blue rounded-3xl border-b-8 border-blue-700 shadow-2xl flex flex-col items-center justify-center p-8 text-white"
            style={{ 
                backfaceVisibility: 'hidden', 
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)' 
            }}
          >
             <div className="text-6xl mb-4">{currentWord.emoji}</div>
             <h3 className="text-5xl font-bold mb-2">{currentWord.chinese}</h3>
             
             <div className="flex flex-col items-center mb-6">
                <p className="text-2xl font-bold text-yellow-300 tracking-wide">/{currentWord.english}/</p>
                {currentWord.phonetic && (
                    <p className="text-lg opacity-80 font-mono mt-1 px-3 py-1 bg-white/10 rounded-lg border border-white/20">
                        [{currentWord.phonetic}]
                    </p>
                )}
             </div>

             {/* AI Feature */}
             <div 
                className="w-full bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 min-h-[100px] flex flex-col items-center justify-center text-center relative"
                onClick={(e) => e.stopPropagation()} 
             >
                 {!aiSentence ? (
                     <button 
                        onClick={handleAiStory}
                        disabled={isLoadingAi}
                        className="flex items-center gap-2 px-6 py-3 bg-brand-yellow text-yellow-900 font-bold rounded-full shadow-lg hover:bg-yellow-300 transition-colors"
                     >
                        <Sparkles className={isLoadingAi ? "animate-spin" : ""} />
                        {isLoadingAi ? "Thinking..." : "Tell me a story!"}
                     </button>
                 ) : (
                    <div className="animate-fade-in">
                        <p className="text-xl font-medium leading-relaxed">"{aiSentence}"</p>
                        <button 
                            onClick={() => speak(aiSentence)}
                            className="mt-2 p-2 bg-white/20 rounded-full hover:bg-white/30"
                        >
                            <Volume2 size={20} />
                        </button>
                    </div>
                 )}
             </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mt-8 w-full justify-between px-2 sm:px-4">
        <button 
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`p-4 rounded-2xl border-b-4 font-bold text-xl flex items-center gap-2 transition-all
                ${currentIndex === 0 
                    ? 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed' 
                    : 'bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-600 active:translate-y-1 active:border-b-0'
                }`}
        >
            <ChevronLeft size={24} /> Prev
        </button>

        {/* Go to Spelling Practice */}
        <button
            onClick={() => onStartSpelling(words)}
            className="flex-1 mx-2 py-4 bg-indigo-500 border-b-4 border-indigo-700 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-2 shadow-lg hover:bg-indigo-600 active:translate-y-1 active:border-b-0 transition-all"
        >
             <PenTool size={20} /> Practice
        </button>

        <button 
            onClick={handleNext}
            className="px-6 py-4 bg-brand-green border-b-4 border-green-600 rounded-2xl font-bold text-white text-xl flex items-center gap-2 shadow-lg hover:bg-green-500 active:translate-y-1 active:border-b-0 active:shadow-none transition-all"
        >
            {currentIndex === words.length - 1 ? "Finish" : "Next"} <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default Flashcard;
