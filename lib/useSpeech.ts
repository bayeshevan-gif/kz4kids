"use client";

let currentAudio: HTMLAudioElement | null = null;

/**
 * Plays audio from a URL (uploaded .mp3/.ogg file).
 * Stops any currently playing audio first.
 */
export function playAudioUrl(url: string): void {
  if (typeof window === "undefined") return;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  const audio = new Audio(url);
  currentAudio = audio;
  audio.play().catch(() => {
    // Ignore autoplay errors (e.g. browser policy)
  });
}

/**
 * Speaks text using Web Speech API (browser built-in).
 * Fallback when no recorded audio is available.
 */
export function speakBrowser(text: string, lang: "ru" | "kz"): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang === "kz" ? "kk-KZ" : "ru-RU";
  utter.rate = 0.8;
  const voices = window.speechSynthesis.getVoices();
  let voice = voices.find((v) => v.lang?.toLowerCase().startsWith(lang === "kz" ? "kk" : "ru"));
  if (!voice && lang === "kz") {
    voice = voices.find((v) => v.lang?.toLowerCase().startsWith("ru"));
  }
  if (voice) utter.voice = voice;
  window.speechSynthesis.speak(utter);
}

/**
 * Smart speak: uses uploaded audio URL if available, falls back to Web Speech API.
 *
 * @param text   - text to speak (used for TTS fallback)
 * @param lang   - language: "ru" or "kz"
 * @param audioUrl - optional URL to a pre-recorded audio file
 */
export function speak(text: string, lang: "ru" | "kz", audioUrl?: string | null): void {
  if (audioUrl) {
    playAudioUrl(audioUrl);
  } else {
    speakBrowser(text, lang);
  }
}
