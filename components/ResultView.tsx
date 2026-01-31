
import React, { useEffect } from 'react';
import { Star, Trophy, Home, RefreshCcw } from 'lucide-react';

interface ResultViewProps {
  stars: number;
  correct: number;
  total: number;
  onHome: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ stars, correct, total, onHome }) => {
  // Simple sound effect simulation (visual)
  useEffect(() => {
    // Add any confetti or visual pop effects here
  }, []);

  const percentage = Math.round((correct / total) * 100);

  return (
    <div className="w-full max-w-xl mx-auto p-4 animate-scale-in">
      <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border-b-[12px] border-brand-yellow">
        <div className="bg-gradient-to-b from-brand-yellow to-yellow-400 p-10 text-center relative">
            {/* Background elements */}
            <div className="absolute top-4 left-4 text-white/40 text-4xl animate-bounce">✨</div>
            <div className="absolute bottom-4 right-4 text-white/40 text-4xl animate-bounce-slow">🌟</div>
            
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Trophy className="w-12 h-12 text-brand-yellow" strokeWidth={2.5} />
            </div>
            <h2 className="text-4xl font-black text-white drop-shadow-md">Fantastic!</h2>
            <p className="text-yellow-900 font-bold opacity-80">Adventure Complete</p>
        </div>

        <div className="p-10 text-center space-y-8">
            <div className="flex justify-center items-end gap-2">
                {[...Array(Math.min(3, Math.ceil(stars/3)))].map((_, i) => (
                    <Star 
                        key={i} 
                        className={`w-16 h-16 text-brand-yellow fill-brand-yellow drop-shadow-lg transform hover:scale-110 transition-transform cursor-pointer`} 
                        style={{animationDelay: `${i * 0.2}s`}}
                    />
                ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-3xl border-2 border-gray-100">
                    <p className="text-sm font-bold text-gray-400 uppercase">Accuracy</p>
                    <p className="text-3xl font-black text-gray-800">{percentage}%</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-3xl border-2 border-gray-100">
                    <p className="text-sm font-bold text-gray-400 uppercase">Stars Won</p>
                    <p className="text-3xl font-black text-brand-yellow">+{stars}</p>
                </div>
            </div>

            <div className="space-y-4 pt-4">
                <button 
                    onClick={onHome}
                    className="w-full py-5 bg-brand-blue text-white rounded-2xl font-black text-xl shadow-xl hover:bg-blue-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                    <Home /> Back to Map
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ResultView;
