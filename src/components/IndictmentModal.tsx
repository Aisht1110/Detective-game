import React, { useState } from 'react';
import { ClueItem } from '../types';
import { audio } from '../services/audioService';

interface IndictmentModalProps {
  clues: ClueItem[];
  onClose: () => void;
}

export const IndictmentModal: React.FC<IndictmentModalProps> = ({ clues, onClose }) => {
  const [killer, setKiller] = useState('');
  const [method, setMethod] = useState('');
  const [evidenceId, setEvidenceId] = useState('');
  const [motive, setMotive] = useState('');
  const [verdict, setVerdict] = useState<{
    status: 'success' | 'trap' | 'invalid';
    title: string;
    body: string;
  } | null>(null);

  const unlockedClues = clues.filter(c => c.unlocked);

  const handleExecuteArrest = () => {
    if (!killer || !method || !evidenceId || !motive) {
      setVerdict({
        status: 'invalid',
        title: 'INCOMPLETE INDICTMENT APPLICATION',
        body: 'The District Attorney will not review an incomplete petition. Please select all 4 fields.'
      });
      return;
    }

    const validEvidenceIds = ['clue_elena_search', 'clue_autopsy_report', 'clue_cyanide_vial', 'clue_whiskey_glass'];

    if (
      killer === 'suspect_elena' &&
      method === 'cyanide_whiskey' &&
      motive === 'insurance_divorce' &&
      validEvidenceIds.includes(evidenceId)
    ) {
      audio.playGavelStrike(true);
      setVerdict({
        status: 'success',
        title: 'CASE #409 SOLVED // FIRST-DEGREE MURDER INDICTMENT CONFIRMED',
        body: 'District Attorney Indictment Approved! You saw straight through the staged blunt-force trauma trap. Elena Vance poisoned Victor Vance’s scotch with Potassium Cyanide (Batch #88) at 11:25 PM so he would die before their 12:00 AM midnight divorce voided her $2,000,000 life insurance claim. Robert King was indicted separately for corporate embezzlement and post-mortem tampering. Outstanding forensic work, Detective!'
      });
    } else if (killer === 'suspect_rk') {
      audio.playGavelStrike(false);
      setVerdict({
        status: 'trap',
        title: 'INDICTMENT REJECTED BY MEDICAL EXAMINER & DISTRICT ATTORNEY',
        body: 'You attempted to indict Robert King for murder based on the brass trophy strike at 11:42 PM—falling for the staged surface clue! Look at the minimal blood volume on the body (#1), the lipstick whiskey tumbler with bitter almond scent (#3), and file the Coroner Autopsy Warrant to prove Victor was already deceased before Robert King even touched him.'
      });
    } else {
      audio.playGavelStrike(false);
      setVerdict({
        status: 'invalid',
        title: 'CONTRADICTORY OR INSUFFICIENT CHARGES',
        body: 'The Grand Jury dismissed these charges due to conflicting forensic evidence. Cross-reference the autopsy toxicology report, the 12:00 AM insurance deadline, and the laboratory keycard logs.'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90">
      <div className="w-full max-w-3xl max-h-[88vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/40 flex items-center justify-center text-red-400 font-mono font-bold text-xs">
              05
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                District Attorney Formal Indictment & Arrest Warrant
              </h2>
              <span className="text-[11px] font-mono text-slate-400">
                County Prosecutor's Office · Grand Jury Presentment
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono transition"
          >
            Cancel [ESC]
          </button>
        </div>

        {/* Content Form */}
        <div className="p-6 overflow-y-auto space-y-5">
          <p className="text-xs text-slate-300 leading-relaxed">
            Before the District Attorney authorizes a capital murder warrant for the death of{' '}
            <strong className="text-white">Victor Vance</strong> in Room 204, your indictment must establish
            the primary killer, true cause of death, decisive physical evidence, and motive without contradiction.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-amber-400 font-bold mb-1.5">
                1. Primary Suspect (Who murdered Victor Vance?)
              </label>
              <select
                value={killer}
                onChange={e => setKiller(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Select Primary Accused --</option>
                <option value="suspect_rk">Robert King (Business Partner & CFO)</option>
                <option value="suspect_elena">Elena Vance (Estranged Wife & Beneficiary)</option>
                <option value="suspect_marcus">Marcus Cole (Night Desk Clerk)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-amber-400 font-bold mb-1.5">
                2. True Cause of Death (How was Victor Vance killed?)
              </label>
              <select
                value={method}
                onChange={e => setMethod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Select Murder Method --</option>
                <option value="blunt_trophy">Blunt Force Trauma via Heavy Brass Trophy</option>
                <option value="cyanide_whiskey">
                  Lethal Potassium Cyanide Poisoning in Scotch (Staged with Blunt Blow)
                </option>
                <option value="gunshot">Silenced Gunshot from Exterior Balcony</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-amber-400 font-bold mb-1.5">
                3. Decisive Physical Evidence Linking Killer to Poison / Weapon
              </label>
              <select
                value={evidenceId}
                onChange={e => setEvidenceId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Select Corroborating Physical Evidence --</option>
                {unlockedClues.map(c => (
                  <option key={c.id} value={c.id}>
                    #{c.markerNumber || 'DOC'} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-amber-400 font-bold mb-1.5">
                4. Primary Motive for the Murder
              </label>
              <select
                value={motive}
                onChange={e => setMotive(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Select Motive --</option>
                <option value="embezzlement">Cover up $400,000 corporate embezzlement</option>
                <option value="insurance_divorce">
                  Collect $2,000,000 Life Insurance before 12:00 AM Midnight Divorce Finalization
                </option>
                <option value="robbery">Motel Room Extortion & Robbery</option>
              </select>
            </div>
          </div>

          {verdict && (
            <div
              className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed space-y-1.5 ${
                verdict.status === 'success'
                  ? 'bg-emerald-950/90 border-emerald-500 text-emerald-100 shadow-xl'
                  : 'bg-red-950/90 border-red-600 text-red-200'
              }`}
            >
              <div className="font-mono font-bold uppercase tracking-wider text-xs">
                {verdict.title}
              </div>
              <p>{verdict.body}</p>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleExecuteArrest}
              className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm font-mono shadow-lg transition"
            >
              Execute Capital Arrest Warrant
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
