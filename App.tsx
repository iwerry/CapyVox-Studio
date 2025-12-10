import React, { useState, useEffect } from 'react';
import { TargetLanguage, VoiceName, ProcessingState, AudioResult, AppLanguage, VoiceTone } from './types';
import { improveText, generateSpeech } from './services/gemini';
import { decodeBase64, pcmToWav } from './utils/audio';
import { getTranslation } from './utils/i18n';
import { Button } from './components/Button';
import { AudioPlayer } from './components/AudioPlayer';

export default function App() {
  const [appLang, setAppLang] = useState<AppLanguage>(AppLanguage.EN); // Default to English
  
  const [text, setText] = useState<string>('');
  const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>(TargetLanguage.Portuguese);
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>(VoiceName.Puck);
  const [selectedTone, setSelectedTone] = useState<VoiceTone>(VoiceTone.Epic);
  
  const [audioResult, setAudioResult] = useState<AudioResult | null>(null);
  
  const [status, setStatus] = useState<ProcessingState>({
    isImproving: false,
    isGeneratingAudio: false,
    error: null,
  });

  const t = (key: any) => getTranslation(appLang, key);

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (audioResult) {
        URL.revokeObjectURL(audioResult.url);
      }
    };
  }, [audioResult]);

  const handleImproveText = async () => {
    if (!text.trim()) return;
    setStatus({ ...status, isImproving: true, error: null });
    
    try {
      // Pass tone to text improver to "style" the text for TTS
      const improved = await improveText(text, targetLanguage, selectedTone);
      setText(improved);
    } catch (error: any) {
      console.error(error);
      setStatus(s => ({ ...s, error: t('error_improve') }));
    } finally {
      setStatus(s => ({ ...s, isImproving: false }));
    }
  };

  const handleGenerateAudio = async () => {
    if (!text.trim()) return;
    setStatus({ ...status, isGeneratingAudio: true, error: null });

    try {
      const base64Data = await generateSpeech(text, selectedVoice);
      const pcmBytes = decodeBase64(base64Data);
      const wavBlob = pcmToWav(pcmBytes);
      const url = URL.createObjectURL(wavBlob);
      
      setAudioResult({ blob: wavBlob, url });
    } catch (error: any) {
      console.error(error);
      setStatus(s => ({ ...s, error: t('error_generate') }));
    } finally {
      setStatus(s => ({ ...s, isGeneratingAudio: false }));
    }
  };

  // Tone color mapping for UI
  const getToneColor = (tone: VoiceTone) => {
    switch(tone) {
        case VoiceTone.Joyful: return 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10';
        case VoiceTone.Serious: return 'text-slate-300 border-slate-500/50 bg-slate-500/10';
        case VoiceTone.Melancholic: return 'text-indigo-400 border-indigo-500/50 bg-indigo-500/10';
        case VoiceTone.Mysterious: return 'text-purple-400 border-purple-500/50 bg-purple-500/10';
        case VoiceTone.Epic: return 'text-neon-blue border-neon-blue/50 bg-neon-blue/10';
        default: return 'text-white border-white/20 bg-white/5';
    }
  };

  // Calculations for stats
  const charCount = text.length;
  // Approximation: Average speaking rate ~15 chars per second
  const estimatedSeconds = Math.ceil(charCount / 15);
  const estMinutes = Math.floor(estimatedSeconds / 60);
  const estRemainingSeconds = estimatedSeconds % 60;
  const timeString = `${estMinutes}m ${estRemainingSeconds}s`;

  return (
    <div className="min-h-screen relative overflow-x-hidden selection:bg-neon-blue selection:text-black font-sans flex flex-col">
        
        {/* App Language Switcher (Fixed Top Right) */}
        <div className="absolute top-4 right-4 z-50 flex gap-2">
            {[AppLanguage.EN, AppLanguage.PT, AppLanguage.ES].map((lang) => (
                <button
                    key={lang}
                    onClick={() => setAppLang(lang)}
                    className={`px-3 py-1 text-xs font-bold rounded-full border transition-all ${
                        appLang === lang 
                        ? 'bg-neon-blue text-black border-neon-blue shadow-[0_0_10px_rgba(0,243,255,0.4)]' 
                        : 'bg-black/40 text-slate-400 border-slate-700 hover:border-slate-500'
                    }`}
                >
                    {lang.toUpperCase()}
                </button>
            ))}
        </div>

        {/* Animated Background Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden bg-deep-space">
             {/* Moving Orbs - Animated Lights */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-neon-purple/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob opacity-60"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-blue/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000 opacity-60"></div>
            <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000 opacity-60"></div>
            
            {/* Grid/Noise overlay for texture */}
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12 relative z-10 flex-grow w-full">
            {/* Header */}
            <header className="mb-10 text-center space-y-4 animate-[fadeIn_0.8s_ease-out]">
                <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 shadow-2xl mb-2 backdrop-blur-xl group hover:border-neon-blue/50 transition-colors duration-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-neon-blue group-hover:scale-110 transition-transform duration-300">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                    </svg>
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.2)] uppercase">
                    Capy<span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">Vox</span> {t('title_suffix')}
                </h1>
                <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
                    {t('subtitle')}
                </p>
            </header>

            {/* Main Interface Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                
                {/* Left Column: Input (Span 7) */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    <div className="glass-panel rounded-2xl p-6 md:p-8 flex-1 border-t border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.3)] hover:shadow-[0_0_50px_rgba(188,19,254,0.1)] transition-shadow duration-500 relative group">
                    
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-slate-200 font-bold tracking-wide flex items-center gap-2">
                                <span className="w-2 h-8 bg-neon-purple rounded-full mr-1"></span>
                                {t('label_script')}
                            </label>
                            
                            {/* Stat Badge Top Right */}
                            <div className="text-[10px] font-mono text-slate-500 uppercase border border-slate-800 px-2 py-1 rounded bg-black/40">
                                {t('stat_limit_text')}
                            </div>
                        </div>

                        <div className="relative">
                            <textarea
                                className="w-full bg-black/40 border-2 border-slate-800 rounded-xl p-5 pb-12 text-white placeholder-slate-600 focus:ring-4 focus:ring-neon-purple/20 focus:border-neon-purple transition-all outline-none resize-none text-lg md:text-xl leading-relaxed min-h-[300px]"
                                placeholder={t('placeholder_script')}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                            />
                            {/* Inner Stat Footer */}
                            <div className="absolute bottom-4 right-4 text-xs font-mono font-bold text-slate-500 pointer-events-none flex gap-3">
                                <span className="text-neon-purple">{t('stat_chars')}: {charCount}</span>
                                <span className="text-slate-600">|</span>
                                <span className="text-neon-blue">{t('stat_est_time')}: ~{timeString}</span>
                            </div>
                        </div>

                        {/* Controls: Tone & Improvement */}
                        <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-slate-400 uppercase tracking-widest font-bold flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
                                        </svg>
                                        {t('label_target_lang')}
                                    </label>
                                    <div className="relative group">
                                        <select 
                                            className="w-full bg-deep-space border border-slate-700 text-white rounded-lg p-3 appearance-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-colors cursor-pointer hover:bg-slate-900"
                                            value={targetLanguage}
                                            onChange={(e) => setTargetLanguage(e.target.value as TargetLanguage)}
                                        >
                                            {Object.values(TargetLanguage).map(lang => (
                                                <option key={lang} value={lang}>{lang}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-white transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-slate-400 uppercase tracking-widest font-bold flex items-center gap-1">
                                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                                        </svg>
                                        {t('label_voice_tone')}
                                    </label>
                                    <div className="relative group">
                                        <select 
                                            className="w-full bg-deep-space border border-slate-700 text-white rounded-lg p-3 appearance-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-colors cursor-pointer hover:bg-slate-900"
                                            value={selectedTone}
                                            onChange={(e) => setSelectedTone(e.target.value as VoiceTone)}
                                        >
                                            {Object.values(VoiceTone).map(tone => (
                                                <option key={tone} value={tone}>{tone}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-white transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <p className="text-xs text-slate-500 mb-3 italic text-center">{t('tone_desc')}</p>

                            <Button 
                                variant="accent" 
                                className="w-full"
                                onClick={handleImproveText}
                                isLoading={status.isImproving}
                                disabled={!text.trim()}
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                                    </svg>
                                }
                            >
                                {t('btn_improve')}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Audio & Output (Span 5) */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    
                     {/* Voice Selection Card */}
                    <div className="glass-panel rounded-2xl p-6 border-t border-white/10 relative overflow-hidden">
                        {/* Decorative Gradient */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/20 blur-[60px] rounded-full pointer-events-none"></div>

                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <label className="text-slate-200 font-bold tracking-wide flex items-center gap-2">
                                <span className="w-2 h-8 bg-neon-blue rounded-full mr-1"></span>
                                {t('label_voice_model')}
                            </label>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
                            {Object.values(VoiceName).map((voice) => (
                                <button
                                    key={voice}
                                    onClick={() => setSelectedVoice(voice)}
                                    className={`relative p-3 rounded-xl border text-sm font-semibold transition-all duration-300 overflow-hidden group ${
                                        selectedVoice === voice
                                            ? 'border-neon-blue bg-neon-blue/20 text-white shadow-[0_0_15px_rgba(0,243,255,0.3)]'
                                            : 'border-slate-800 bg-slate-900/50 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        {voice}
                                        {selectedVoice === voice && <div className="w-2 h-2 rounded-full bg-neon-blue shadow-[0_0_5px_#00f3ff]"></div>}
                                    </div>
                                    {selectedVoice === voice && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 animate-[shimmer_2s_infinite]" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Tone Visualizer Pill */}
                        <div className={`mb-6 p-3 rounded-lg border flex items-center justify-center gap-2 text-sm font-bold tracking-wider transition-all duration-500 ${getToneColor(selectedTone)}`}>
                             <span className="opacity-75">CURRENT VIBE:</span> {selectedTone.toUpperCase()}
                        </div>

                        <div className="space-y-3">
                            <Button
                                variant="primary"
                                className="w-full text-lg h-16 shadow-[0_0_30px_rgba(0,243,255,0.2)]"
                                onClick={handleGenerateAudio}
                                isLoading={status.isGeneratingAudio}
                                disabled={!text.trim()}
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                                    </svg>
                                }
                            >
                                {t('btn_generate')}
                            </Button>
                            
                            {/* Audio Limits Info */}
                            <div className="flex justify-center items-center gap-2 text-[10px] text-slate-500 uppercase font-mono tracking-wide">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                </svg>
                                {t('stat_limit_audio')}
                            </div>
                        </div>
                    </div>

                     {/* Audio Player Container */}
                    <div className="min-h-[140px] transition-all duration-500">
                        {status.error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-200 flex items-center gap-3 animate-pulse mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 shrink-0">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                </svg>
                                {status.error}
                            </div>
                        )}
                        
                        {/* Only show Title if we have a result or just starting, to keep layout stable */}
                        <div className={`transition-opacity duration-500 ${audioResult ? 'opacity-100' : 'opacity-40'}`}>
                             <AudioPlayer audioResult={audioResult} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="mt-16 border-t border-white/10 pt-8 text-center pb-8 lg:pb-0">
                <p className="text-slate-500 text-sm font-light tracking-wider">
                    Criado pela empresa: © 2025 <span className="text-slate-300 font-medium">CapyNews Media Group</span>. All rights reserved.
                </p>
                <p className="text-neon-blue/40 text-xs mt-2 uppercase tracking-[0.2em] animate-pulse">
                    The Pulse of the Planet
                </p>
            </footer>

        </div>
    </div>
  );
}