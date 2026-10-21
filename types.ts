
export enum Act {
  TRAINING = 'TRAINING',
  SECURITY_ARCHIVE = 'SECURITY_ARCHIVE',
  SERVER_BREACH = 'SERVER_BREACH',
  REFLECTION = 'REFLECTION'
}

export type ViewState = 'INTRO' | 'STUDY' | 'GAME' | 'FINISHED';

export interface FileSystem {
  [filename: string]: string;
}

export interface Level {
  id: number;
  act: Act;
  title: string;
  mission: string;
  driverInstructions: string;
  navigatorClue: string;
  hint: string;
  starterCode: string;
  targetFiles: FileSystem;
  validationRules: ValidationRule[];
  successMessage: string;
  clue?: string; // Specific item to be collected
}

export interface ValidationRule {
  type: 'function_call' | 'order' | 'parameter' | 'file_state' | 'output';
  params?: string[];
  message: string;
  check: (code: string, fs: FileSystem, output: string[]) => boolean;
}

export interface GameState {
  view: ViewState;
  currentLevelIndex: number;
  score: number;
  hintsUsed: number;
  startTime: number;
  isFinished: boolean;
  logs: string[];
  fileSystem: FileSystem;
  collectedClues: string[];
  levelCleared: boolean;
}
