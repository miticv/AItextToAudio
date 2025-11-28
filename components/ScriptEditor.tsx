import React, { useRef, useState } from 'react';

interface ScriptEditorProps {
  value: string;
  onChange: (value: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

interface ToolbarButtonProps {
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
  emoji?: string;
  variant?: 'default' | 'outline' | 'ghost'; 
  disabled?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ onClick, label, icon, emoji, variant = 'default', disabled = false }) => {
  const baseClasses = "flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap";
  const variants = {
    default: "bg-slate-700/50 hover:bg-slate-700 hover:text-white text-slate-300",
    outline: "border border-slate-600 hover:bg-slate-700 text-slate-300",
    ghost: "hover:bg-slate-700/50 text-slate-400 hover:text-white"
  };
  
  const disabledClasses = "opacity-50 cursor-not-allowed pointer-events-none";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${disabled ? disabledClasses : ''}`}
      type="button"
      title={label}
    >
      {emoji && <span>{emoji}</span>}
      {icon}
      <span>{label}</span>
    </button>
  );
};

const HelpModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
          <h3 className="text-xl font-bold text-white">SSML Tag Guide</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6 text-slate-300 text-sm leading-relaxed">
          
          <section>
            <h4 className="text-blue-400 font-bold mb-2 text-lg">Read As (Alias)</h4>
            <p className="mb-3">
              Use the <code>&lt;sub&gt;</code> tag to tell the model how to pronounce acronyms, abbreviations, or specific words.
            </p>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 font-mono text-xs">
              <div className="mb-2">
                <span className="text-slate-500">// Example: Reading "WWW" as "World Wide Web"</span><br/>
                &lt;sub alias="World Wide Web"&gt;WWW&lt;/sub&gt;
              </div>
              <div>
                <span className="text-slate-500">// Example: Clarifying "Dr." as "Doctor"</span><br/>
                &lt;sub alias="Doctor"&gt;Dr.&lt;/sub&gt; Smith
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-blue-400 font-bold mb-2 text-lg">IPA (Phonetics)</h4>
            <p className="mb-3">
              Use the <code>&lt;phoneme&gt;</code> tag with the International Phonetic Alphabet (IPA) to provide exact pronunciation instructions.
            </p>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 font-mono text-xs">
              <div className="mb-2">
                <span className="text-slate-500">// Example: "tomato" (US pronunciation)</span><br/>
                &lt;phoneme alphabet="ipa" ph="təˈmeɪtoʊ"&gt;tomato&lt;/phoneme&gt;
              </div>
              <div>
                <span className="text-slate-500">// Example: "pecan"</span><br/>
                &lt;phoneme alphabet="ipa" ph="pɪˈkɑːn"&gt;pecan&lt;/phoneme&gt;
              </div>
            </div>
          </section>
          
          <section>
            <h4 className="text-green-400 font-bold mb-2 text-lg">Emotions & Style</h4>
            <p className="mb-3">
              Wrap text in style tags to change the tone of the voice.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-900 p-3 rounded border border-slate-700">
                <code className="text-blue-300">Normal (Default)</code>
                <p className="text-xs mt-1 text-slate-500">Natural, balanced speaking tone.</p>
              </div>
              <div className="bg-slate-900 p-3 rounded border border-slate-700">
                <code className="text-yellow-300">&lt;whisper&gt;...&lt;/whisper&gt;</code>
                <p className="text-xs mt-1 text-slate-500">Soft, whispered speech.</p>
              </div>
              <div className="bg-slate-900 p-3 rounded border border-slate-700">
                <code className="text-yellow-300">&lt;happy&gt;...&lt;/happy&gt;</code>
                <p className="text-xs mt-1 text-slate-500">Cheerful and upbeat tone.</p>
              </div>
              <div className="bg-slate-900 p-3 rounded border border-slate-700">
                <code className="text-yellow-300">&lt;sad&gt;...&lt;/sad&gt;</code>
                <p className="text-xs mt-1 text-slate-500">Melancholic and slower pace.</p>
              </div>
              <div className="bg-slate-900 p-3 rounded border border-slate-700">
                 <code className="text-yellow-300">&lt;excited&gt;...&lt;/excited&gt;</code>
                 <p className="text-xs mt-1 text-slate-500">High energy and faster pace.</p>
              </div>
            </div>
          </section>

        </div>
        <div className="p-4 border-t border-slate-700 bg-slate-900/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

const ScriptEditor: React.FC<ScriptEditorProps> = ({ 
  value, 
  onChange, 
  onUndo, 
  onRedo, 
  canUndo = false, 
  canRedo = false 
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showHelp, setShowHelp] = useState(false);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Check for Ctrl+Z
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        // Ctrl+Shift+Z = Redo
        if (onRedo && canRedo) onRedo();
      } else {
        // Ctrl+Z = Undo
        if (onUndo && canUndo) onUndo();
      }
    }
    // Check for Ctrl+Y = Redo
    else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
      e.preventDefault();
      if (onRedo && canRedo) onRedo();
    }
  };

  return (
    <>
      <div className="flex flex-col h-full min-h-[500px] bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden flex-1 relative">
        <div className="bg-slate-900/50 p-2 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            
            {/* Undo/Redo Group */}
            <div className="flex bg-slate-800 rounded-lg p-1 gap-1 border border-slate-700">
               <ToolbarButton 
                  onClick={() => onUndo?.()} 
                  label="Undo" 
                  icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>}
                  disabled={!canUndo}
                />
               <ToolbarButton 
                  onClick={() => onRedo?.()} 
                  label="Redo" 
                  icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" /></svg>}
                  disabled={!canRedo}
                />
            </div>

            <div className="flex bg-slate-800 rounded-lg p-1 gap-1 border border-slate-700">
              <ToolbarButton 
                onClick={() => insertTag('<break time="1s" />')} 
                label="1s" 
                icon={<svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              />
               <ToolbarButton 
                onClick={() => insertTag('<break time="2s" />')} 
                label="2s" 
              />
            </div>

            <div className="flex bg-slate-800 rounded-lg p-1 gap-1 border border-slate-700">
              <ToolbarButton onClick={() => insertTag('<whisper>', '</whisper>')} label="Whisper" emoji="🤫" />
              <ToolbarButton onClick={() => insertTag('<happy>', '</happy>')} label="Happy" emoji="😊" />
              <ToolbarButton onClick={() => insertTag('<sad>', '</sad>')} label="Sad" emoji="😔" />
               <ToolbarButton onClick={() => insertTag('<excited>', '</excited>')} label="Excited" emoji="🤩" />
            </div>

            <div className="flex bg-slate-800 rounded-lg p-1 gap-1 border border-slate-700">
              <ToolbarButton 
                onClick={() => insertTag('<sub alias="pronunciation">', '</sub>')} 
                label="Alias" 
                emoji="🗣️" 
              />
              <ToolbarButton 
                onClick={() => insertTag('<phoneme alphabet="ipa" ph="ipa_string">', '</phoneme>')} 
                label="IPA" 
                emoji="🔤" 
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 shrink-0 mr-2 pt-1 sm:pt-0">
             <div className="hidden sm:block text-xs text-slate-500">
              {value.length} chars
            </div>
             <button
               onClick={() => setShowHelp(true)}
               className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
               title="Help & Examples"
             >
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
             </button>
          </div>
        </div>

        <textarea
          ref={textareaRef}
          className="flex-1 w-full bg-slate-800 p-4 text-slate-200 placeholder-slate-600 resize-none focus:outline-none font-mono text-sm leading-relaxed"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your script here. Use the toolbar to add speech instructions..."
          spellCheck={false}
        />
        
        <div className="sm:hidden px-4 py-2 bg-slate-900/30 text-xs text-slate-500 text-right border-t border-slate-700">
           {value.length} chars
        </div>
      </div>

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );
};

export default ScriptEditor;