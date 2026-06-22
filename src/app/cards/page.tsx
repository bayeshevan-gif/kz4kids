'use client';
import { useState, useEffect } from 'react';
import TextToSpeech from '@/components/TextToSpeech';

interface Card {
  id: string;
  wordRu: string;
  wordKz: string;
  imageUrl: string | null;
}

export default function CardsPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [learned, setLearned] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Демонстрационный мок на случай отсутствия инициализированной БД во время сборки на Vercel
    setCategories([
      { id: '1', slug: 'numbers', nameRu: 'Цифры' },
      { id: '2', slug: 'animals', nameRu: 'Животные' },
      { id: '3', slug: 'colors', nameRu: 'Цвета' }
    ]);
  }, []);

  const loadCards = async (slug: string) => {
    setSelectedCat(slug);
    // В продакшене: fetch(`/api/cards?category=${slug}`)
    const mockCards: Record<string, Card[]> = {
      numbers: [{ id: 'n1', wordRu: 'Один', wordKz: 'Бір', imageUrl: null }],
      animals: [{ id: 'a1', wordRu: 'Кошка', wordKz: 'Мысық', imageUrl: null }],
      colors: [{ id: 'c1', wordRu: 'Красный', wordKz: 'Қызыл', imageUrl: null }],
    };
    setCards(mockCards[slug] || []);
  };

  const markAsLearned = (id: string) => {
    setLearned(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-amber-50 dark:bg-slate-950 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-black text-center text-orange-500 mb-8">ИЗУЧАЕМ СЛОВА 📚</h1>
        
        {/* Список Категорий */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => loadCards(cat.slug)}
              className={`px-6 py-4 rounded-2xl text-xl font-bold transition-all shadow-md active:scale-95 ${
                selectedCat === cat.slug ? 'bg-orange-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200'
              }`}
            >
              {cat.nameRu}
            </button>
          ))}
        </div>

        {/* Карточки */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {selectedCat && cards.map((card) => (
            <div key={card.id} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl flex flex-col items-center border-4 border-amber-200 relative overflow-hidden">
              <div className="w-full h-40 rounded-2xl bg-gradient-to-tr from-yellow-100 to-amber-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-5xl mb-6 shadow-inner">
                {card.imageUrl ? <img src={card.imageUrl} alt={card.wordRu} className="w-full h-full object-cover rounded-2xl" /> : '🎨'}
              </div>

              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl font-medium text-slate-500 dark:text-slate-400">RU:</span>
                <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{card.wordRu}</span>
                <TextToSpeech text={card.wordRu} lang="ru-RU" className="p-1.5 text-xs" />
              </div>

              <div className="flex items-center gap-3 mb-6">
                <span className="text-xl font-medium text-amber-600">KZ:</span>
                <span className="text-3xl font-black text-amber-500">{card.wordKz}</span>
                <TextToSpeech text={card.wordKz} lang="kk-KZ" className="p-1.5 text-xs" />
              </div>

              <button
                onClick={() => markAsLearned(card.id)}
                className={`w-full py-3 rounded-xl font-bold text-lg transition-colors shadow-md ${
                  learned[card.id] 
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-amber-100'
                }`}
              >
                {learned[card.id] ? '✓ Выучено!' : 'Отметить как выученное'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}