"use client";

export function speak(text: string, lang: "ru" | "kz") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang === "kz" ? "kk-KZ" : "ru-RU";
  utter.rate = 0.85;
  const voices = window.speechSynthesis.getVoices();
  let voice = voices.find((v) => v.lang?.toLowerCase().startsWith(lang === "kz" ? "kk" : "ru"));
  if (!voice && lang === "kz") {
    voice = voices.find((v) => v.lang?.toLowerCase().startsWith("ru"));
  }
  if (voice) utter.voice = voice;
  window.speechSynthesis.speak(utter);
}
