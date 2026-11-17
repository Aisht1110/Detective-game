export type FlashlightMode = 'off' | 'normal' | 'uv';

export type CameraZoneId = 'overview' | 'desk' | 'bed' | 'door' | 'fps';

export type GameScreen = 'homescreen' | 'crime_scene';

export type ModalTab =
  | 'none'
  | 'inspect'
  | 'evidence'
  | 'warrants'
  | 'interrogate'
  | 'archive'
  | 'hints'
  | 'map'
  | 'solve';

export interface ClueItem {
  id: string;
  markerNumber?: number;
  name: string;
  category: string;
  location: string;
  unlocked: boolean;
  promptKey?: string;
  summary: string;
  forensicDetail: string;
  uvFluorescentNote?: string;
  accentColor: string;
  modelType: 'body' | 'watch' | 'glass' | 'trophy' | 'ledger' | 'vial' | 'document';
  cameraAngleId: CameraZoneId;
  capturedPhoto?: string; // Real WebGL forensic snapshot captured by player
}

export interface WarrantItem {
  id: string;
  title: string;
  authority: string;
  description: string;
  requiredClues: [string, string];
  hint: string;
  unlocksClueId: string;
  approved: boolean;
}

export interface ChatMessage {
  sender: 'detective' | 'suspect';
  text: string;
  evidenceName?: string | null;
  timestamp?: string;
}

export interface SuspectItem {
  id: string;
  name: string;
  role: string;
  age: number;
  status: string;
  stress: number;
  alibi: string;
  systemPrompt: string;
  quickQuestions: string[];
  chatHistory: ChatMessage[];
}

export interface PastCaseItem {
  id: string;
  code: string;
  title: string;
  status: string;
  promptKey: string;
  summary: string;
  connection: string;
  accentColor: string;
}

export interface DetectiveHint {
  id: string;
  level: number;
  title: string;
  lead: string;
  hint: string;
  conditionDescription: string;
  revealed: boolean;
}

export interface MapLocation {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  tab: ModalTab | 'crime_scene';
  status: string;
  badgeLabel: string;
  coordinates: { x: number; y: number };
}

export interface ProjectedMarker {
  clueId: string;
  markerNumber: number;
  label: string;
  x: number;
  y: number;
  visible: boolean;
  unlocked: boolean;
}
