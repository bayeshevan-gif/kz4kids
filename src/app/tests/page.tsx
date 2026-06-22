'use client';
import { useState } from 'react';
import TextToSpeech from '@/components/TextToSpeech';

const mockQuiz = [
  { id: '1', questionRu: 'Кошка', correctKz: 'Мысық', options: ['Ит', 'Мысық', 'Жылқы', 'Сиыр'] },
  { id: '2', questionRu: 'Один', correctKz: 'Бір', options: ['Екі', 'Үш', 'Төрт', 'Бір'] }
];

export default function TestsPage() {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleAnswer = (option: string) => {
    setSelectedOption(option);
    if (option === mockQuiz[step].correctKz) {
      setScore(score + 1);
    }
    
    setTimeout(() => {
      if (step + 1 < mockQuiz.length) {
        setStep(step + 1);
        setSelectedOption(null);
      } else {
        setQuizFinished(true);
      }
    }, 1200);
  };

  if (quizFinished) {
    return (
      <div className="min-h-screen bg-emerald-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border-4 border-emerald-400">
          <span className="text-7xl">🎉</span>
          <h2 className="text-4xl font-black text-slate-800 dark:text-slate-100 mt-4">Супер!</h2>
          <p className="text-xl font-bold text-slate-600 dark:text-slate-300 mt-2">Ты прошел тест!</p>
          <div className="bg-emerald-100 dark:bg-emerald-900/40 p-4 rounded-2xl my-6">
            <span className="text-5xl font-black text-emerald-600 dark:text-emerald-400">
              {score} / {mockQuiz.length}
            </span>
          </div>
          <button onClick={() => window.location.reload()} className="w-full bg-emerald-500 text-white text-xl font-extrabold py-4 rounded-2xl hover:bg-emerald-600 transition-all shadow-md">
            Играть снова 🚀
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = mockQuiz[step];

  return (
    <div className="min-h-screen bg-sky-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl border-4 border-sky-300">
        <div className="flex justify-between items-center mb-6">
          <span className="text-lg font-bold text-sky-600">Вопрос {step + 1} из {mockQuiz.length}</span>
          <span className="text-lg font-bold text-amber-500">⭐ Звезды: {score}</span>
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-5xl mb-4 shadow-inner">
            ❓
          </div>
          <div className="flex items-center gap-4">
            <h3 className="text-4xl font-black text-slate-800 dark:text-slate-100">{currentQuestion.questionRu}</h3>
            <TextToSpeech text={currentQuestion.questionRu} lang="ru-RU" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {currentQuestion.options.map((option, index) => {
            let btnStyle = 'bg-slate-100 dark:bg-slate-700 hover:bg-sky-100 dark:hover:bg-sky-900';
            if (selectedOption) {
              if (option === currentQuestion.correctKz) btnStyle = 'bg-emerald-500 text-white';
              else if (option === selectedOption) btnStyle = 'bg-rose-500 text-white';
            }

            return (
              <button
                key={index}
                disabled={!!selectedOption}
                onClick={() => handleAnswer(option)}
                className={`p-5 rounded-2xl text-2xl font-black transition-all transform active:scale-95 shadow-md flex items-center justify-between ${btnStyle}`}
              >
                <span>{option}</span>
                <TextToSpeech text={option} lang="kk-KZ" className="p-1.5 text-sm bg-white/20 hover:bg-white/40" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}