
import React, { useState } from 'react';
import { Difficulty, Word, MagicList } from '../types';
import { generateWordList } from '../services/geminiService';
import { Wand2, Loader2, ArrowLeft, CheckCircle2, Save } from 'lucide-react';

interface WordGeneratorProps {
  onBack: () => void;
  onSaveAndLearn: (list: MagicList) => void;
}

const WordGenerator: React.FC<WordGeneratorProps> = ({ onBack, onSaveAndLearn }) => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.BEGINNER);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedWords, setGeneratedWords] = useState<Word[]>([]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setGeneratedWords([]); 
    
    try {
      const words = await generateWordList(topic, difficulty);
      setGeneratedWords(words);
    } catch (error) {
      console.error(error);
      alert("Oops! Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalize = () => {
      const newList: MagicList = {
          id: `list-${Date.now()}`,
          title: topic.charAt(0).toUpperCase() + topic.slice(1),
          emoji: generatedWords[0]?.emoji || '🪄',
          words: generatedWords,
          createdAt: Date.now()
      };
      onSaveAndLearn(newList);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <button onClick={onBack} className="flex items-center text-gray-500 hover:text-brand-blue font-bold mb-6">
        <ArrowLeft className="mr-2" size={20} /> Back to Topics
      </button>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-b-8 border-indigo-100">
        <div className="bg-indigo-600 p-6 text-white text-center">
          <Wand2 className="w-12 h-12 mx-auto mb-2 text-yellow-300" />
          <h2 className="text-3xl font-bold">Magic Word Generator</h2>
          <p className="opacity-90 text-sm mt-2">For Parents: Create a custom list for your child!</p>
        </div>

        <div className="p-6 sm:p-8">
          {!generatedWords.length ? (
            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-bold mb-2 text-lg">
                  1. What topic fits your child's interest?
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Space, Dinosaurs, Kitchen, Superheroes..."
                  className="w-full p-4 text-lg rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                  maxLength={30}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2 text-lg">
                  2. Choose Difficulty (Age 8)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setDifficulty(Difficulty.BEGINNER)}
                    className={`p-4 rounded-xl border-2 font-bold text-lg transition-all ${
                      difficulty === Difficulty.BEGINNER
                        ? 'bg-green-50 border-green-500 text-green-700'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    🌱 Beginner
                    <span className="block text-xs font-normal mt-1 text-gray-500">Simple nouns & objects</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDifficulty(Difficulty.INTERMEDIATE)}
                    className={`p-4 rounded-xl border-2 font-bold text-lg transition-all ${
                      difficulty === Difficulty.INTERMEDIATE
                        ? 'bg-orange-50 border-orange-500 text-orange-700'
                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    🚀 Intermediate
                    <span className="block text-xs font-normal mt-1 text-gray-500">Verbs & Abstract</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !topic}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-xl shadow-lg hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Conjuring Words...
                  </>
                ) : (
                  <>
                    Create Word List ✨
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="animate-fade-in">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CheckCircle2 className="text-green-500" />
                Here is your list! ({generatedWords.length} words)
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 max-h-[400px] overflow-y-auto pr-2">
                {generatedWords.map((word) => (
                  <div key={word.id} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-3xl mr-3">{word.emoji}</span>
                    <div>
                      <p className="font-bold text-gray-800">{word.english}</p>
                      <p className="text-sm text-gray-500">{word.chinese}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setGeneratedWords([])}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Discard
                </button>
                <button 
                  onClick={handleFinalize}
                  className="flex-[2] py-3 bg-brand-green text-white font-bold rounded-xl shadow-lg hover:bg-green-500 active:translate-y-1 transition-all text-lg flex items-center justify-center gap-2"
                >
                  <Save size={20} /> Save & Start Learning!
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WordGenerator;
