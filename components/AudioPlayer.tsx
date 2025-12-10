import React, { useRef, useState, useEffect } from 'react';
import { AudioResult } from '../types';

interface AudioPlayerProps {
  audioResult: AudioResult | null;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioResult }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (audioResult) {
      // Reset state when new audio comes in
      setIsPlaying(false);
      setProgress(0);
      if(audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    }
  }, [audioResult]);

  if (!audioResult) return null;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const duration = audioRef.current.duration;
    if (duration > 0) {
      setProgress((current / duration) * 100);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(100);
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-6 border-t border-neon-blue shadow-[0_10px_40px_-10px_rgba(0,243,255,0.2)] animate-[fadeIn_0.5s_ease-out]">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Generated Audio
        </h3>
        <span className="text-[10px] font-mono text-neon-blue font-bold px-2 py-1 bg-neon-blue/10 rounded border border-neon-blue/20">
          WAV 24kHz
        </span>
      </div>

      <audio
        ref={audioRef}
        src={audioResult.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        className="hidden"
      />

      {/* Custom Controls */}
      <div className="flex items-center gap-4 mb-5">
        <button
          onClick={togglePlay}
          className="w-14 h-14 flex items-center justify-center rounded-full bg-white text-black hover:bg-neon-blue hover:text-black transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(0,243,255,0.5)] hover:scale-105"
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6 ml-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
          )}
        </button>

        {/* Waveform/Progress Bar */}
        <div className="flex-1 h-14 bg-black/60 rounded-xl relative overflow-hidden flex items-center px-3 border border-white/5">
            {/* Fake waveform bars for visual effect */}
            <div className="absolute inset-0 flex items-center justify-between px-3 opacity-40">
               {Array.from({ length: 45 }).map((_, i) => (
                   <div 
                    key={i} 
                    className="w-1 bg-neon-blue rounded-full transition-all duration-300"
                    style={{ 
                        height: `${Math.max(15, Math.random() * 80)}%`,
                        opacity: i / 45 < progress / 100 ? 1 : 0.2
                    }} 
                   />
               ))}
            </div>
            {/* Actual Progress Overlay (Invisible hit area conceptually, but using visual overlay here) */}
        </div>
      </div>

      <div className="flex justify-end border-t border-white/10 pt-4">
        <a
          href={audioResult.url}
          download="voxgemini_output.wav"
          className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors group bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 group-hover:scale-110 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download .WAV
        </a>
      </div>
    </div>
  );
};