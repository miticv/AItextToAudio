
import React from 'react';
import { VoiceName, VOICE_LABELS } from '../types';

interface ControlsProps {
  selectedVoice: VoiceName;
  onVoiceChange: (voice: VoiceName) => void;
  onGenerate: () => void;
  isLoading: boolean;
  isPlaying: boolean;
  hasAudio: boolean;
  onStop: () => void;
  onPlay: () => void;
  onDownload: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  selectedVoice,
  onVoiceChange,
  onGenerate,
  isLoading,
  isPlaying,
  hasAudio,
  onStop,
  onPlay,
  onDownload
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
      <div className="flex flex-col w-full md:w-auto">
        <label className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wider">Voice</label>
        <div className="relative">
          <select
            value={selectedVoice}
            onChange={(e) => onVoiceChange(e.target.value as VoiceName)}
            className="appearance-none w-full md:min-w-[200px] bg-slate-900 text-white border border-slate-600 rounded-lg py-2 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-slate-500 transition-colors cursor-pointer font-medium"
          >
            {Object.values(VoiceName).map((voice) => (
              <option key={voice} value={voice}>
                {VOICE_LABELS[voice] || voice}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full flex items-end justify-end gap-3">
        {hasAudio && (
          <>
            <button
              onClick={onDownload}
              className="flex items-center justify-center px-4 py-2 rounded-lg font-semibold text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-600 hover:border-slate-500 transition-all duration-200"
              title="Download Audio (WAV)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="h-8 w-px bg-slate-700 mx-1 hidden md:block"></div>
            <button
              onClick={isPlaying ? onStop : onPlay}
              className={`flex items-center justify-center px-6 py-2 rounded-lg font-semibold transition-all duration-200 border-2 ${
                isPlaying 
                  ? 'bg-transparent border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white' 
                  : 'bg-transparent border-green-500 text-green-500 hover:bg-green-500 hover:text-white'
              }`}
            >
              {isPlaying ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Stop
                  </>
              ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Replay
                  </>
              )}
            </button>
          </>
        )}

        <button
          onClick={onGenerate}
          disabled={isLoading}
          className={`flex items-center justify-center px-6 py-2 rounded-lg font-semibold text-white transition-all duration-200 shadow-lg ${
            isLoading
              ? 'bg-slate-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/25 active:transform active:scale-95'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Synthesizing...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                 <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 01-1-1v-3a1 1 0 011-1h.5a1.5 1.5 0 000-3h-.5a1 1 0 01-1-1V4a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
              </svg>
              Generate Speech
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Controls;
