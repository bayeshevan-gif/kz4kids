'use client';

export default function TextToSpeech({ text, lang, className }: { text: string; lang: 'ru-RU' | 'kk-KZ'; className?: string }) {
  const speak = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      
      // Попытка найти нативный казахский голос, если доступен в ОС
      if (lang === 'kk-KZ') {
        const voices = window.speechSynthesis.getVoices();
        const kzVoice = voices.find(v => v.lang.includes('KK') || v.lang.includes('kk'));
        if (kzVoice) utterance.voice = kzVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Голосовой движок не поддерживается вашим устройством');
    }
  };

  return (
    <button
      onClick={speak}
      className={`p-3 rounded-full bg-amber-400 hover:bg-amber-500 active:scale-95 transition-all text-xl shadow-md ${className}`}
      title="Прослушать"
    >
      🔊
    </button>
  );
}