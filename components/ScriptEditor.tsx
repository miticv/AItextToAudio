import React, { useRef } from 'react';

interface ScriptEditorProps {
  value: string;
  onChange: (value: string) => void;
}

interface ToolbarButtonProps {
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
  emoji?: string;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ onClick, label, icon, emoji }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-700/50 hover:bg-slate-700 hover:text-white text-slate-300 text-xs font-medium transition-colors whitespace-nowrap"
    type="button"
    title={`Insert ${label}`}
  >
    {emoji && <span>{emoji}</span>}
    {icon}
    <span>{label}</span>
  </button>
);

const ScriptEditor: React.FC<ScriptEditorProps> = ({ value, onChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertTag = (startTag: string, endTag: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    const newText = before + startTag + selection + endTag + after;
    
    onChange(newText);

    // Defer focus restoration
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + startTag.length + selection.length + endTag.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className="flex flex-col h-full min-h-[500px] bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden flex-1">
      <div className="bg-slate-900/50 p-2 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide ml-2 mr-2 shrink-0">Insert:</span>
          
          <div className="flex bg-slate-800 rounded-lg p-1 gap-1 border border-slate-700">
            <ToolbarButton 
              onClick={() => insertTag('<break time="1s" />')} 
              label="Pause 1s" 
              icon={<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
             <ToolbarButton 
              onClick={() => insertTag('<break time="2s" />')} 
              label="2s" 
            />
          </div>

          <div className="w-px h-6 bg-slate-700 mx-1 shrink-0"></div>

          <div className="flex bg-slate-800 rounded-lg p-1 gap-1 border border-slate-700">
            <ToolbarButton onClick={() => insertTag('<whisper>', '</whisper>')} label="Whisper" emoji="🤫" />
            <ToolbarButton onClick={() => insertTag('<happy>', '</happy>')} label="Happy" emoji="😊" />
            <ToolbarButton onClick={() => insertTag('<sad>', '</sad>')} label="Sad" emoji="😔" />
             <ToolbarButton onClick={() => insertTag('<excited>', '</excited>')} label="Excited" emoji="🤩" />
          </div>

          <div className="w-px h-6 bg-slate-700 mx-1 shrink-0"></div>

          <div className="flex bg-slate-800 rounded-lg p-1 gap-1 border border-slate-700">
            <ToolbarButton 
              onClick={() => insertTag('<sub alias="pronunciation">', '</sub>')} 
              label="Read As" 
              emoji="🗣️" 
            />
            <ToolbarButton 
              onClick={() => insertTag('<phoneme alphabet="ipa" ph="ipa_string">', '</phoneme>')} 
              label="IPA" 
              emoji="🔤" 
            />
          </div>
        </div>
        
        <div className="hidden sm:block text-xs text-slate-500 mr-2 shrink-0">
          {value.length} chars
        </div>
      </div>

      <textarea
        ref={textareaRef}
        className="flex-1 w-full bg-slate-800 p-4 text-slate-200 placeholder-slate-600 resize-none focus:outline-none font-mono text-sm leading-relaxed"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your script here. Use the toolbar to add speech instructions..."
        spellCheck={false}
      />
      
      <div className="sm:hidden px-4 py-2 bg-slate-900/30 text-xs text-slate-500 text-right border-t border-slate-700">
         {value.length} chars
      </div>
    </div>
  );
};

export default ScriptEditor;