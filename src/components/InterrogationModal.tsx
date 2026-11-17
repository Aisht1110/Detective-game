import React, { useState } from 'react';
import { SuspectItem, ClueItem } from '../types';
import { interrogateSuspect } from '../services/geminiService';
import { audio } from '../services/audioService';

interface InterrogationModalProps {
  suspects: SuspectItem[];
  clues: ClueItem[];
  preselectedClueId?: string | null;
  onClose: () => void;
  onUpdateSuspectHistory: (suspectId: string, suspect: SuspectItem) => void;
}

export const InterrogationModal: React.FC<InterrogationModalProps> = ({
  suspects,
  clues,
  preselectedClueId,
  onClose,
  onUpdateSuspectHistory
}) => {
  const [activeSuspectId, setActiveSuspectId] = useState<string>(suspects[0]?.id || 'suspect_rk');
  const [selectedClueId, setSelectedClueId] = useState<string>(preselectedClueId || '');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const activeSuspect = suspects.find(s => s.id === activeSuspectId) || suspects[0];
  const unlockedClues = clues.filter(c => c.unlocked);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    const presentedClue = clues.find(c => c.id === selectedClueId) || null;

    if (!text && !presentedClue) return;

    audio.playPaperSlam();

    const detectiveMsgText = text || `Explain this ${presentedClue?.name} right now!`;
    const newChat = [
      ...activeSuspect.chatHistory,
      {
        sender: 'detective' as const,
        text: detectiveMsgText,
        evidenceName: presentedClue ? presentedClue.name : null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];

    // Spike stress if evidence is slammed on table
    const stressBump = presentedClue ? 20 : 6;
    const newStress = Math.min(99, activeSuspect.stress + stressBump);

    const updatedSuspect: SuspectItem = {
      ...activeSuspect,
      stress: newStress,
      chatHistory: newChat
    };

    onUpdateSuspectHistory(activeSuspect.id, updatedSuspect);
    setInputText('');
    setIsLoading(true);

    try {
      const reply = await interrogateSuspect(updatedSuspect, detectiveMsgText, presentedClue, unlockedClues);
      const withReply: SuspectItem = {
        ...updatedSuspect,
        chatHistory: [
          ...updatedSuspect.chatHistory,
          {
            sender: 'suspect' as const,
            text: reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      };
      onUpdateSuspectHistory(activeSuspect.id, withReply);
    } finally {
      setIsLoading(false);
    }
  };

  const stressColor = activeSuspect.stress > 70
    ? 'bg-red-500'
    : activeSuspect.stress > 45
    ? 'bg-amber-500'
    : 'bg-emerald-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90">
      <div className="w-full max-w-6xl h-[86vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/40 flex items-center justify-center text-red-400 font-mono font-bold text-xs">
              03
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                1-on-1 Suspect Interrogation Room
              </h2>
              <span className="text-[11px] font-mono text-slate-400">
                Homicide Division · Formal Questioning Transcript
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono transition"
          >
            Leave Room [ESC]
          </button>
        </div>

        {/* 2-Column Split: Suspect Roster & Vitals + Live Interrogation Chat */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          
          {/* Left Column: Suspect Roster & Vitals */}
          <div className="md:col-span-4 border-r border-slate-800 p-4 bg-slate-950/60 flex flex-col justify-between overflow-y-auto space-y-4">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider font-semibold block mb-2">
                  Select Person to Question
                </span>
                <div className="space-y-1.5">
                  {suspects.map(s => {
                    const isSelected = s.id === activeSuspectId;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setActiveSuspectId(s.id)}
                        className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 text-white shadow'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold">{s.name}</p>
                          <p className="text-[10px] font-mono text-slate-400">{s.role}</p>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-400">
                          Stress {s.stress}%
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Suspect Profile Card & Stress Gauge */}
              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    {activeSuspect.name} (Age {activeSuspect.age})
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-950 text-amber-300 border border-slate-800">
                    {activeSuspect.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong className="text-slate-300">Stated Alibi:</strong> {activeSuspect.alibi}
                </p>

                <div>
                  <div className="flex justify-between text-[10px] font-mono mb-1">
                    <span className="text-slate-400 uppercase">Vocal Agitation / Stress Index</span>
                    <span className="text-amber-400 font-bold">{activeSuspect.stress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full ${stressColor} transition-all duration-500`}
                      style={{ width: `${activeSuspect.stress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Evidence Slammer Selector */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <label className="block text-[11px] font-mono uppercase text-amber-400 font-bold">
                Confront With Physical Evidence
              </label>
              <select
                value={selectedClueId}
                onChange={e => setSelectedClueId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="">-- No Evidence (Verbal Question Only) --</option>
                {unlockedClues.map(c => (
                  <option key={c.id} value={c.id}>
                    [EVIDENCE #{c.markerNumber || 'DOC'}] {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right Column: Chat Transcript & Prompts */}
          <div className="md:col-span-8 flex flex-col h-full overflow-hidden bg-slate-900/40">
            
            {/* Transcript Messages */}
            <div className="flex-1 p-5 overflow-y-auto space-y-3.5">
              {activeSuspect.chatHistory.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === 'detective' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xl p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow ${
                      m.sender === 'detective'
                        ? 'bg-amber-500/15 border border-amber-500/40 text-slate-100 rounded-tr-none'
                        : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-[10px] font-mono font-bold uppercase mb-1">
                      <span className={m.sender === 'detective' ? 'text-amber-400' : 'text-emerald-400'}>
                        {m.sender === 'detective' ? 'Detective (You)' : activeSuspect.name}
                      </span>
                      {m.timestamp && <span className="text-slate-500 font-normal">{m.timestamp}</span>}
                    </div>

                    {m.evidenceName && (
                      <div className="mb-2 inline-flex items-center gap-1.5 bg-amber-500 text-slate-950 font-mono font-bold text-[10px] px-2 py-0.5 rounded">
                        <span>SLAPPED ON TABLE: {m.evidenceName}</span>
                      </div>
                    )}

                    <p>{m.text}</p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-950 border border-slate-800 text-slate-400 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs font-mono">
                    {activeSuspect.name} is sweating, considering response...
                  </div>
                </div>
              )}
            </div>

            {/* Quick Questions Bar */}
            <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold shrink-0">
                Quick Prompts:
              </span>
              {activeSuspect.quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1 rounded-lg transition shrink-0"
                >
                  "{q}"
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Ask anything or confront suspect..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm font-mono transition shadow-lg shrink-0 disabled:opacity-50"
              >
                {isLoading ? 'Interrogating...' : 'Cross-Examine'}
              </button>
            </form>

          </div>

        </div>

      </div>
    </div>
  );
};
