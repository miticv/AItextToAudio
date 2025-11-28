import React, { useState, useRef, useEffect, useCallback } from 'react';
import { generateSpeech } from './services/gemini';
import { decodeBase64, decodeAudioData, getAudioContext, createWavBlob } from './services/audio';
import { VoiceName } from './types';
import Controls from './components/Controls';
import Visualizer from './components/Visualizer';
import ScriptEditor from './components/ScriptEditor';

const DEFAULT_TEXT = `<whisper>Whisper voice</whisper><break time="1s" />
<happy>Happy voice</happy><break time="1s" />
<sad>Sad voice</sad><break time="1s" />
<excited>Excited voice</excited>`;

const App: React.FC = () => {
  const [text, setText] = useState<string>(DEFAULT_TEXT);
  const [voice, setVoice] = useState<VoiceName>(VoiceName.Kore);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [analyserState, setAnalyserState] = useState<AnalyserNode | null>(null);
  
  // Store the buffer and raw bytes so we can replay/download without regenerating
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const rawAudioRef = useRef<Uint8Array | null>(null);
  const [hasAudioBuffer, setHasAudioBuffer] = useState(false);

  // Initialize Audio Context lazily
  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = getAudioContext();
    }
    // Resume if suspended (browser policy)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  const stopAudio = useCallback(() => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch (e) {
        // Ignore errors if already stopped
      }
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const playAudio = useCallback((buffer: AudioBuffer) => {
    stopAudio(); // Stop any existing playback

    const ctx = initAudioContext();
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    
    // Setup Analyser
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;
    setAnalyserState(analyser); // Trigger re-render for visualizer

    source.connect(analyser);
    analyser.connect(ctx.destination);
    
    source.onended = () => {
      setIsPlaying(false);
    };

    sourceNodeRef.current = source;
    source.start(0);
    setIsPlaying(true);
  }, [stopAudio]);

  const handleGenerate = async () => {
    if (!text.trim()) return;

    setError(null);
    setIsLoading(true);
    stopAudio();
    setHasAudioBuffer(false);
    rawAudioRef.current = null;

    try {
      const base64Audio = await generateSpeech(text, voice);
      
      const ctx = initAudioContext();
      const rawBytes = decodeBase64(base64Audio);
      
      // Store raw bytes for download
      rawAudioRef.current = rawBytes;
      
      const audioBuffer = await decodeAudioData(rawBytes, ctx);
      
      audioBufferRef.current = audioBuffer;
      setHasAudioBuffer(true);
      playAudio(audioBuffer);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate speech. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplay = () => {
    if (audioBufferRef.current) {
      playAudio(audioBufferRef.current);
    }
  };

  const handleDownload = () => {
    if (rawAudioRef.current) {
      const wavBlob = createWavBlob(rawAudioRef.current, 24000); // 24kHz is standard for Gemini TTS
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gemini-speech-${voice}-${Date.now()}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sourceNodeRef.current) {
        try { sourceNodeRef.current.stop(); } catch(e) {}
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-4xl w-full flex flex-col gap-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-full mb-4">
            <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Gemini Speech Studio
          </h1>
          <p className="text-slate-400">
            Transform your text into lifelike speech with Google's Gemini 2.5
          </p>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Script Editor */}
          <div className="lg:col-span-2 flex flex-col">
             <ScriptEditor value={text} onChange={setText} />
          </div>

          {/* Right Column: Visualization & Status */}
          <div className="flex flex-col gap-6">
            
            {/* Visualizer Card */}
            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-xl">
              <div className="mb-3 flex justify-between items-center">
                 <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Audio Output</span>
                 {isPlaying && <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>}
              </div>
              <Visualizer analyser={analyserState} isPlaying={isPlaying} />
              <div className="mt-4 text-center">
                 {hasAudioBuffer ? (
                    <span className="inline-block px-3 py-1 bg-green-500/10 text-green-400 text-xs rounded-full font-medium border border-green-500/20">
                      Ready to Play
                    </span>
                 ) : (
                    <span className="inline-block px-3 py-1 bg-slate-700 text-slate-400 text-xs rounded-full font-medium">
                      No Audio Generated
                    </span>
                 )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            
            {/* Helpful Hint */}
             <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-2xl">
               <h3 className="text-blue-400 font-medium text-sm mb-1">Did you know?</h3>
               <p className="text-slate-400 text-xs leading-5">
                 You can now add instructions like <code>&lt;whisper&gt;</code> or <code>&lt;happy&gt;</code> to direct the style of the speech!
               </p>
             </div>

          </div>
        </div>

        {/* Bottom Controls */}
        <Controls
          selectedVoice={voice}
          onVoiceChange={setVoice}
          onGenerate={handleGenerate}
          isLoading={isLoading}
          isPlaying={isPlaying}
          hasAudio={hasAudioBuffer}
          onStop={stopAudio}
          onPlay={handleReplay}
          onDownload={handleDownload}
        />

      </div>
    </div>
  );
};

export default App;