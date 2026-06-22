import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-100 to-emerald-100 dark:from-slate-900 dark:to-emerald-950 flex flex-col items-center justify-center p-6 text-center">
      <header className="mb-12 animate-bounce">
        <h1 className="text-5xl md:text-7xl font-black text-amber-500 tracking-wider drop-shadow-lg">
          БАЛА ТІЛІ 🌟
        </h1>
        <p className="text-lg md:text-2xl font-bold text-slate-700 dark:text-slate-300 mt-4">
          Учи казахский язык играя! 🚀
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
        <Link href="/cards" className="group transform transition-all hover:scale-105 active:scale-95">
          <div className="bg-gradient-to-br from-black-100 from-amber-400 to-orange-400 p-8 rounded-3xl shadow-2xl text-white border-4 border-white flex flex-col items-center justify-center min-h-[250px]">
            <span className="text-7xl mb-4">🎴</span>
            <h2 className="text-3xl font-extrabold tracking-wide">УМНЫЕ КАРТОЧКИ</h2>
            <p className="mt-2 text-amber-50 font-medium">Учи новые слова и запоминай картинки</p>
          </div>
        </Link>

        <Link href="/tests" className="group transform transition-all hover:scale-105 active:scale-95">
          <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-8 rounded-3xl shadow-2xl text-white border-4 border-white flex flex-col items-center justify-center min-h-[250px]">
            <span className="text-7xl mb-4">🏆</span>
            <h2 className="text-3xl font-extrabold tracking-wide">ВЕСЕЛЫЕ ТЕСТЫ</h2>
            <p className="mt-2 text-emerald-50 font-medium">Проверяй свои знания и собирай звезды</p>
          </div>
        </Link>
      </div>

      <footer className="mt-16 flex gap-4">
        <Link href="/profile" className="px-6 py-3 bg-white dark:bg-slate-800 rounded-full font-bold shadow-md hover:shadow-lg transition-all text-slate-700 dark:text-slate-200">
          👤 Личный кабинет
        </Link>
        <Link href="/admin" className="px-6 py-3 bg-slate-200 dark:bg-slate-700 rounded-full font-bold shadow-md hover:shadow-lg transition-all text-slate-600 dark:text-slate-300 text-sm">
          ⚙️ Админка
        </Link>
      </footer>
    </main>
  );
}