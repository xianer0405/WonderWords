
import React, { useState, useEffect, useRef } from 'react';
import { Word } from '../types';
import { Volume2, Check, X, ArrowRight, BookMarked, AlertCircle } from 'lucide-react';
import { markWordFailed } from '../services/storageService';

interface SpellingGameProps {
  words: Word[];
  onBack: () => void;
  onFinish: (stats: {correct: number, total: number}) => void;
  onWordAddedToNotebook?: () => void; // Callback to refresh UI in App
}

type Mode = 'partial' | 'full';

const SpellingGame: React.FC<SpellingGameProps> = ({ words, onBack, onFinish, onWordAddedToNotebook }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<Mode>('partial');
  const [stats, setStats] = useState({ correct: 0, total: words.length });
  const [failCount, setFailCount] = useState(0);
  const [addedToNotebook, setAddedToNotebook] = useState(false);
  
  // State for Partial Mode
  const [maskedIndices, setMaskedIndices] = useState<Set<number>>(new Set());
  const [partialInputs, setPartialInputs] = useState<Record<number, string>>({});
  
  // State for Full Mode
  const [fullInput, setFullInput] = useState('');
  
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [showHint, setShowHint] = useState(false);

  const currentWord = words && words.length > 0 ? words[currentIndex] : undefined;
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const fullInputRef = useRef<HTMLInputElement>(null);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!currentWord) return;
    setStatus('idle');
    setPartialInputs({});
    setFullInput('');
    setShowHint(false);
    setFailCount(0);
    setAddedToNotebook(false);

    if (mode === 'partial') {
      const indices = new Set<number>();
      const chars = currentWord.english.split('');
      chars.forEach((char, i) => {
        if (char === ' ') return;
        if (chars.length > 3 && i === 0) return; 
        if (Math.random() > 0.4) indices.add(i);
      });
      if (indices.size === 0 && currentWord.english.length > 0) indices.add(currentWord.english.length - 1);
      setMaskedIndices(indices);
      setTimeout(() => {
        const sortedIndices = Array.from(indices).sort((a: number, b: number) => a - b);
        if (sortedIndices.length > 0) {
          inputRefs.current[sortedIndices[0]]?.focus();
        }
      }, 100);
    } else {
      setTimeout(() => fullInputRef.current?.focus(), 100);
    }
  }, [currentIndex, mode, currentWord]);

  const handlePartialChange = (index: number, value: string) => {
    if (status === 'correct') return;
    const char = value.slice(-1); 
    setPartialInputs(prev => ({ ...prev, [index]: char }));
    setStatus('idle');

    if (char) {
      const sortedIndices = Array.from(maskedIndices).sort((a: number, b: number) => a - b);
      const currentPos = sortedIndices.indexOf(index);
      if (currentPos !== -1 && currentPos < sortedIndices.length - 1) {
        inputRefs.current[sortedIndices[currentPos + 1]]?.focus();
      }
    }
  };

  const handleCheck = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!currentWord) return;
    if (status === 'correct') { handleNext(); return; }

    let isCorrect = false;
    const target = currentWord.english.trim().toLowerCase();

    if (mode === 'partial') {
      const reconstructed = currentWord.english.split('').map((char, i) => maskedIndices.has(i) ? (partialInputs[i] || '') : char).join('');
      isCorrect = reconstructed.trim().toLowerCase() === target;
    } else {
      isCorrect = fullInput.trim().toLowerCase() === target;
    }

    if (isCorrect) {
      setStatus('correct');
      setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
      speak("Great job!");
    } else {
      setStatus('wrong');
      const newFailCount = failCount + 1;
      setFailCount(newFailCount);
      
      // Automatic Addition to Notebook logic
      markWordFailed(currentWord.id);
      setAddedToNotebook(true);
      if (onWordAddedToNotebook) onWordAddedToNotebook();

      if (newFailCount >= 3) {
        speak("Look carefully at the red boxes");
      } else {
        speak("Try once more");
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onFinish(stats);
    }
  };

  if (!currentWord) return null;

  return (
    <div className="w-full max-w-2xl mx-auto p-4 flex flex-col animate-fade-in relative">
      {/* Notebook Floating Notification */}
      {addedToNotebook && (
          <div className="absolute top-20 right-4 bg-brand-purple text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce z-10 border-2 border-white">
              <BookMarked size={16} />
              <span className="text-xs font-bold">Added to Notebook!</span>
          </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="text-gray-500 hover:text-brand-blue font-bold flex items-center gap-1">
             &larr; Quit
        </button>
        <div className="flex bg-white rounded-full p-1 shadow-sm border border-gray-200">
            <button 
                type="button"
                onClick={() => setMode('partial')}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${mode === 'partial' ? 'bg-brand-blue text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                Fill Blanks
            </button>
            <button 
                type="button"
                onClick={() => setMode('full')}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${mode === 'full' ? 'bg-brand-purple text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                Dictation
            </button>
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border-b-8 border-gray-200 flex-1 flex flex-col">
        <div className="bg-gradient-to-b from-blue-50 to-white p-8 text-center border-b border-gray-100">
           <div className="text-8xl mb-4 animate-bounce-slow inline-block filter drop-shadow-md">
               {currentWord.emoji}
           </div>
           <h2 className="text-3xl font-bold text-gray-800 mb-2">{currentWord.chinese}</h2>
           <div className="flex justify-center items-center gap-3">
               <button type="button" onClick={() => speak(currentWord.english)} className="p-3 bg-white rounded-full shadow-md text-brand-blue hover:scale-110 transition-transform">
                   <Volume2 size={24} />
               </button>
               {currentWord.phonetic && <span className="font-mono text-gray-400 bg-gray-50 px-4 py-2 rounded-xl text-sm">/{currentWord.phonetic}/</span>}
           </div>
        </div>

        <form onSubmit={handleCheck} className="p-10 flex-1 flex flex-col items-center justify-center">
            {mode === 'partial' ? (
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                    {currentWord.english.split('').map((char, i) => {
                        if (char === ' ') return <div key={i} className="w-4"></div>;
                        if (!maskedIndices.has(i)) return <div key={i} className="w-12 h-16 flex items-center justify-center text-3xl font-bold text-brand-blue bg-blue-50 rounded-2xl border-2 border-blue-100 shadow-sm">{char}</div>;
                        
                        const isIncorrect = failCount >= 3 && (partialInputs[i] || '').toLowerCase() !== char.toLowerCase();
                        
                        return (
                          <input 
                            key={i} 
                            ref={el => { inputRefs.current[i] = el }} 
                            type="text" 
                            maxLength={1} 
                            value={partialInputs[i] || ''} 
                            onChange={(e) => handlePartialChange(i, e.target.value)} 
                            className={`w-12 h-16 text-center text-3xl font-bold rounded-2xl border-2 outline-none transition-all shadow-inner 
                              ${status === 'correct' 
                                ? 'bg-green-100 border-green-400 text-green-700' 
                                : isIncorrect 
                                  ? 'bg-red-50 border-red-500 text-red-700 animate-shake' 
                                  : 'bg-white border-gray-300 focus:border-brand-blue focus:ring-4 focus:ring-blue-100'}`} 
                            autoComplete="off" 
                          />
                        );
                    })}
                </div>
            ) : (
                <div className="w-full max-w-md mb-8 relative">
                    <input 
                      ref={fullInputRef} 
                      type="text" 
                      value={fullInput} 
                      onChange={(e) => { setStatus('idle'); setFullInput(e.target.value); }} 
                      placeholder="Type the word..." 
                      className={`w-full p-5 text-center text-3xl font-bold rounded-3xl border-4 outline-none transition-all 
                        ${status === 'correct' 
                          ? 'border-green-400 bg-green-50 text-green-700' 
                          : (status === 'wrong' && failCount >= 3) 
                            ? 'border-red-500 bg-red-50 text-red-700 animate-shake' 
                            : 'border-gray-200 focus:border-brand-purple focus:ring-4 focus:ring-purple-100'}`} 
                      autoComplete="off" 
                    />
                    {showHint && <div className="absolute -top-10 left-0 w-full text-center text-brand-purple font-bold tracking-widest animate-pulse">{currentWord.english.split('').map((c, i) => i % 2 === 0 ? c : '_').join(' ')}</div>}
                </div>
            )}

            <div className="h-10 mb-6 flex items-center justify-center">
                {status === 'correct' && <div className="text-green-600 font-black text-2xl animate-bounce">✨ AWESOME!</div>}
                {status === 'wrong' && (
                  <div className="text-red-500 font-black text-2xl animate-shake">
                    {failCount >= 3 ? "CHECK THE RED BOXES! 🧐" : "TRY AGAIN! 🚀"}
                  </div>
                )}
            </div>

            <div className="w-full max-w-md flex flex-col gap-4">
                 <button type="submit" className={`w-full py-5 rounded-2xl font-black text-2xl shadow-xl transition-all flex items-center justify-center gap-3 ${status === 'correct' ? 'bg-brand-green text-white hover:bg-green-500' : 'bg-gray-800 text-white hover:bg-gray-900'}`}>
                    {status === 'correct' ? <>GO NEXT <ArrowRight /></> : "CHECK ANSWER"}
                </button>
                {(status === 'wrong' || failCount > 0) && (
                    <button type="button" onClick={() => setShowHint(true)} className="text-gray-400 hover:text-gray-600 font-bold underline">Need a hint?</button>
                )}
            </div>
        </form>
      </div>
      <div className="text-center mt-8 text-gray-400 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-4">
          <span>Progress: {currentIndex + 1} / {words.length}</span>
          {failCount > 0 && <span className="text-red-400">Tries: {failCount}</span>}
      </div>
    </div>
  );
};

export default SpellingGame;
