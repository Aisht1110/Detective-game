import { GoogleGenAI } from '@google/genai';
import { SuspectItem, ClueItem } from '../types';

let genAIInstance: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  if (genAIInstance) return genAIInstance;
  const apiKey = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_GEMINI_API_KEY ||
                 (import.meta as unknown as { env: Record<string, string> }).env?.GEMINI_API_KEY ||
                 '';
  if (apiKey) {
    genAIInstance = new GoogleGenAI({ apiKey });
  }
  return genAIInstance;
}

export async function interrogateSuspect(
  suspect: SuspectItem,
  questionText: string,
  presentedClue: ClueItem | null,
  allUnlockedClues: ClueItem[]
): Promise<string> {
  const genAI = getGenAI();

  const discoveredList = allUnlockedClues.map(c => `[CLUE #${c.markerNumber || 'DOC'} ${c.name}]: ${c.summary}`).join('\n');
  const recentHistory = suspect.chatHistory.slice(-6).map(m => `${m.sender.toUpperCase()}: ${m.text}`).join('\n');

  const systemInstruction = `
${suspect.systemPrompt}

CURRENT SITUATION:
- Suspect: ${suspect.name} (${suspect.role}, Age ${suspect.age})
- Current Heart-Rate/Stress: ${suspect.stress}%
- Evidence Bagged by Detective So Far:
${discoveredList}

RULES:
1. Stay firmly in character.
2. If evidence is presented that exposes a lie, react with shock, fear, or indignation based on your persona.
3. Keep response concise (2 to 4 dramatic sentences), cinematic, and gritty neo-noir.
`;

  const userPrompt = `
Conversation History:
${recentHistory}

Detective Action:
${presentedClue ? `[DETECTIVE SLAMS FORENSIC EVIDENCE ON TABLE: "${presentedClue.name}" - Forensic Report: ${presentedClue.forensicDetail}]` : '[No physical evidence presented; verbal questioning only]'}
Detective asks: "${questionText}"

Respond directly to the detective:
`;

  if (genAI) {
    try {
      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const reply = response.text?.trim();
      if (reply) return reply;
    } catch {
      // Fallback seamlessly to deterministic narrative logic
    }
  }

  // Deterministic realistic noir fallback
  return getDeterministicReply(suspect, questionText, presentedClue);
}

function getDeterministicReply(
  suspect: SuspectItem,
  questionText: string,
  presentedClue: ClueItem | null
): string {
  const q = questionText.toLowerCase();
  const cId = presentedClue ? presentedClue.id : '';

  if (suspect.id === 'suspect_rk') {
    if (cId === 'clue_broken_watch' || q.includes('watch') || q.includes('11:42')) {
      return "Fine! Yes, my watch broke at 11:42 PM! I went to Room 204 to beg Victor not to hand that audit docket to the federal prosecutor, and we struggled. But on my soul, Detective, Victor was already turning purple and choking on the floor before I even touched him!";
    }
    if (cId === 'clue_bloody_trophy' || cId === 'clue_financial_ledger' || q.includes('trophy') || q.includes('400')) {
      return "Yes, I picked up that brass trophy in a blind panic when he grabbed my lapel, and I swung it once! But check the coroner's report—there was almost no blood because his heart had already stopped! When I pulled up at 11:35 PM, Elena's silver Jaguar was tearing out of the lot!";
    }
    if (cId === 'clue_cctv_logs' || q.includes('cctv') || q.includes('camera')) {
      return "Your camera logs prove I didn't get there until 11:38 PM! Look who was there twenty minutes before me—Elena Vance was inside that room while Victor was pouring his scotch!";
    }
    return "I told you, Victor and I had financial friction, but I did not murder my partner of twelve years. Unless you have hard physical proof placing me in Room 204 at 11:42 PM, I am invoking my right to counsel.";
  }

  if (suspect.id === 'suspect_elena') {
    if (cId === 'clue_elena_search' || (q.includes('keycard') && q.includes('insurance'))) {
      return "You actually raided my Jaguar? Fine! At midnight, our divorce clause would have left me penniless after fourteen years of building Victor's empire. I poured him his final glass of scotch with Batch #88 at 11:25 PM—and that pathetic fool Robert King walked in minutes later and battered a dead man!";
    }
    if (cId === 'clue_whiskey_glass' || cId === 'clue_cyanide_vial' || q.includes('lipstick') || q.includes('cyanide')) {
      return "My Crimson Velvet lipstick was on a glass in my husband's room—since when is visiting one's spouse a capital offense? Unless you can prove I stole Potassium Cyanide from the restricted vault, you have nothing but circumstantial gossip.";
    }
    if (cId === 'clue_autopsy_report' || q.includes('autopsy') || q.includes('poison')) {
      return "Victor always had high blood pressure and an erratic heart, Detective. If he choked on his scotch, that is an unfortunate medical tragedy—not homicide.";
    }
    return "I was at the Grand Opera Charity Gala until after midnight, Detective. Why are you harassing a grieving widow when Robert King had four hundred thousand reasons to kill my husband?";
  }

  if (suspect.id === 'suspect_marcus') {
    if (cId === 'clue_whiskey_glass' || cId === 'clue_cyanide_vial' || cId === 'clue_cctv_logs' || q.includes('jaguar') || q.includes('500') || q.includes('woman') || q.includes('elena')) {
      return "Alright, alright, don't violate my parole! At 11:10 PM, Victor's wife Elena pulled up in a silver Jaguar and handed me a $500 bill to scrub Room 204 from the lobby book. She left at 11:30 PM carrying an empty leather clutch, eight minutes before Robert King ran in!";
    }
    if (cId === 'clue_broken_watch' || q.includes('watch') || q.includes('11:42')) {
      return "I heard a heavy thump in Room 204 right at 11:42 PM! Ten seconds later, Robert King ran through the breezeway holding his wrist, dropping his gold watch right by the curb before peeling out.";
    }
    return "I was at the front desk all night, Detective. I used the street payphone at 12:05 AM to report the body because if my name showed up on the precinct 911 tape, my parole officer would have hauled me straight back to Chino.";
  }

  return "I have answered all the questions I intend to answer without a defense attorney present.";
}
