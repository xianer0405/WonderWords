
import React from 'react';
import { Category, MagicList } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { LayoutGrid, Sparkles, Trash2 } from 'lucide-react';

interface CategorySelectorProps {
  onSelect: (category: Category) => void;
  onSelectMagicList: (list: MagicList) => void;
  onDeleteMagicList: (id: string) => void;
  onOpenGenerator: () => void;
  magicLists: MagicList[];
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ 
  onSelect, 
  onSelectMagicList, 
  onDeleteMagicList,
  onOpenGenerator, 
  magicLists 
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 pb-20">
        <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
                <LayoutGrid className="w-10 h-10 text-brand-blue" />
                Choose a Topic / 选一个主题
            </h2>
            <p className="text-gray-500 text-lg">What do you want to learn today?</p>
        </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        
        {/* Magic Word Generator Button - Always visible */}
        <button
            onClick={onOpenGenerator}
            className={`
              bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-indigo-800
              relative overflow-hidden
              h-40 rounded-3xl border-b-8 active:border-b-0 active:translate-y-2
              transition-all duration-200
              flex flex-col items-center justify-center gap-3
              shadow-lg hover:shadow-xl group
            `}
          >
            <div className="absolute top-0 left-0 w-full h-full bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
            <div className="absolute -top-10 -right-10 bg-white/20 w-32 h-32 rounded-full blur-xl"></div>
            <span className="text-5xl filter drop-shadow-md transform group-hover:rotate-12 transition-transform duration-300">
               ✨
            </span>
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold tracking-wide uppercase">New Magic List</span>
              <span className="text-xs opacity-80 font-medium">Create with AI!</span>
            </div>
          </button>

        {/* Saved Magic Lists (The "DB" items) */}
        {magicLists.map((list) => (
            <div key={list.id} className="relative group">
                <button
                    onClick={() => onSelectMagicList(list)}
                    className={`
                        w-full h-40 bg-gradient-to-br from-amber-400 to-orange-500 text-white border-orange-700
                        relative overflow-hidden rounded-3xl border-b-8 active:border-b-0 active:translate-y-2
                        transition-all duration-200 flex flex-col items-center justify-center gap-2
                        shadow-lg hover:shadow-xl
                    `}
                >
                    <span className="text-5xl filter drop-shadow-sm group-hover:scale-110 transition-transform">{list.emoji || '🪄'}</span>
                    <div className="flex flex-col items-center px-4 text-center">
                        <span className="text-xl font-bold uppercase truncate max-w-full">{list.title}</span>
                        <span className="text-[10px] opacity-70 font-bold uppercase tracking-widest">{list.words.length} Words</span>
                    </div>
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteMagicList(list.id); }}
                    className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="Delete List"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        ))}

        {/* Standard Categories */}
        {(Object.values(Category).filter(c => c !== Category.CUSTOM) as Category[]).map((category) => (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className={`
              ${CATEGORY_COLORS[category]}
              relative overflow-hidden
              h-40 rounded-3xl border-b-8 active:border-b-0 active:translate-y-2
              transition-all duration-200
              flex flex-col items-center justify-center gap-3
              shadow-lg hover:shadow-xl group
            `}
          >
            <div className="absolute top-0 left-0 w-full h-full bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
            <span className="text-5xl filter drop-shadow-md transform group-hover:scale-125 transition-transform duration-300">
               {category === Category.FAMILY ? '👨‍👩‍👧' : 
                category === Category.SCHOOL ? '🎒' :
                category === Category.ANIMALS ? '🐶' :
                category === Category.FOOD ? '🍞' :
                category === Category.BODY ? '👀' : '🎨'}
            </span>
            <span className="text-2xl font-bold tracking-wide uppercase">{category}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategorySelector;
