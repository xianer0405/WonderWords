
import React, { useState, useEffect } from 'react';
import { Category, ViewState, Word, MagicList, UserProgress } from './types';
import { WORDS } from './constants';
import CategorySelector from './components/CategorySelector';
import Flashcard from './components/Flashcard';
import WordGenerator from './components/WordGenerator';
import SpellingGame from './components/SpellingGame';
import AISettingsModal from './components/AISettingsModal';
import ResultView from './components/ResultView';
import { Settings, Trophy, Star, BookOpen } from 'lucide-react';
import { 
  getSavedMagicLists, 
  saveMagicList, 
  deleteMagicList, 
  getUserProgress, 
  addStars,
  markWordLearned
} from './services/storageService';

function App() {
  const [view, setView] = useState<ViewState>('home');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedMagicList, setSelectedMagicList] = useState<MagicList | null>(null);
  const [magicLists, setMagicLists] = useState<MagicList[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress>(getUserProgress());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lastResults, setLastResults] = useState<{stars: number, correct: number, total: number} | null>(null);

  useEffect(() => {
      setMagicLists(getSavedMagicLists());
      refreshProgress();
  }, []);

  const refreshProgress = () => {
    setUserProgress(getUserProgress());
  };

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    setSelectedMagicList(null);
    setView('learn');
  };

  const handleSelectMagicList = (list: MagicList) => {
    setSelectedMagicList(list);
    setSelectedCategory(Category.CUSTOM);
    setView('learn');
  };

  const handleSaveAndStart = (list: MagicList) => {
    const updatedLists = saveMagicList(list);
    setMagicLists(updatedLists);
    setSelectedMagicList(list);
    setSelectedCategory(Category.CUSTOM);
    setView('learn');
  };

  const handleDeleteList = (id: string) => {
      if (confirm("Delete this magic word list?")) {
          const updated = deleteMagicList(id);
          setMagicLists(updated);
      }
  };

  const handleFinishSession = (stats: {correct: number, total: number}) => {
      const earnedStars = Math.max(1, Math.floor((stats.correct / stats.total) * 10));
      const updatedProgress = addStars(earnedStars);
      setUserProgress(updatedProgress);
      setLastResults({ stars: earnedStars, ...stats });
      setView('result');
  };

  const getActiveWords = () => {
    if (selectedCategory === Category.NOTEBOOK) {
        // Find failed words from both hardcoded WORDS and custom magic lists
        const allPossibleWords = [...WORDS, ...magicLists.flatMap(l => l.words)];
        return allPossibleWords.filter(w => userProgress.failedWordIds.includes(w.id));
    }
    if (selectedCategory === Category.CUSTOM && selectedMagicList) {
      return selectedMagicList.words;
    }
    return WORDS.filter(word => word.category === selectedCategory);
  };

  return (
    <div className="min-h-screen pb-10 relative">
      <AISettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

      <header className="bg-white/80 backdrop-blur-md border-b-4 border-brand-blue sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-3 flex justify-between items-center">
          <h1 
            className="text-2xl font-black text-brand-blue tracking-tight flex items-center gap-2 cursor-pointer select-none"
            onClick={() => setView('home')}
          >
            <span className="text-3xl">🌟</span> WonderWords
          </h1>
          
          <div className="flex items-center gap-4">
            {/* Stats Badge */}
            <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-2xl border-2 border-gray-100 shadow-sm">
                <div className="flex items-center gap-1">
                    <Star className="text-brand-yellow fill-brand-yellow w-5 h-5" />
                    <span className="font-bold text-gray-700">{userProgress.stars}</span>
                </div>
                <div className="h-4 w-px bg-gray-200" />
                <div className="flex items-center gap-1">
                    <Trophy className="text-brand-purple w-5 h-5" />
                    <span className="font-bold text-gray-700">Lv.{userProgress.level}</span>
                </div>
            </div>

            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-gray-400 hover:text-brand-blue hover:bg-blue-50 rounded-xl transition-all"
              title="AI Settings"
            >
              <Settings size={24} />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto pt-6 px-4">
        {view === 'home' && (
          <div className="space-y-8 animate-fade-in">
             <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 border-b-8 border-brand-blue/10 flex items-center justify-between">
                <div>
                   <h2 className="text-2xl font-bold text-gray-800">Hello, Explorer! 👋</h2>
                   <p className="text-gray-500">You've mastered {userProgress.learnedWordIds.length} words so far.</p>
                </div>
                <button 
                  onClick={() => {
                    setSelectedCategory(Category.NOTEBOOK);
                    setView('learn');
                  }}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold shadow-lg hover:scale-105 transition-all
                    ${userProgress.failedWordIds.length > 0 ? 'bg-brand-purple text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                   <BookOpen size={20} /> My Notebook ({userProgress.failedWordIds.length})
                </button>
             </div>
             <CategorySelector 
                onSelect={handleSelectCategory}
                onSelectMagicList={handleSelectMagicList}
                onDeleteMagicList={handleDeleteList}
                onOpenGenerator={() => setView('generator')}
                magicLists={magicLists}
              />
          </div>
        )}

        {view === 'generator' && (
          <WordGenerator 
            onBack={() => setView('home')}
            onSaveAndLearn={handleSaveAndStart}
          />
        )}

        {view === 'learn' && (
          <Flashcard 
            words={getActiveWords()} 
            onComplete={() => handleFinishSession({correct: getActiveWords().length, total: getActiveWords().length})} 
            onBack={() => setView('home')}
            onStartSpelling={() => setView('spelling')}
          />
        )}

        {view === 'spelling' && (
          <SpellingGame 
            words={getActiveWords()}
            onBack={() => setView('learn')}
            onFinish={handleFinishSession}
            onWordAddedToNotebook={refreshProgress}
          />
        )}

        {view === 'result' && lastResults && (
           <ResultView 
              {...lastResults}
              onHome={() => setView('home')}
           />
        )}
      </main>
    </div>
  );
}

export default App;
