export interface QuizOption {
    id: number;
    name: string;
    alias: string;
    factionBonus?: 'alliance' | 'horde' | 'neutral';
  }
  
  export interface QuizQuestion {
    id: number;
    question: string;
    options: QuizOption[];
    comment?: string;
  }
  
  export interface RaceResult {
    desc: string;
    match: string[];
  }
  
  export interface QuizResults {
    factionLogic: {
      alliance: string;
      horde: string;
      neutral: string;
    };
    Aliança: {
      [race: string]: RaceResult;
    };
    Horda: {
      [race: string]: RaceResult;
    };
  }
  
  export interface QuizScoring {
    description: string;
    thresholds: {
      alliance: number;
      horde: number;
      neutral: string;
    };
  }
  
  export interface QuizData {
    title: string;
    questions: QuizQuestion[];
    results: QuizResults;
    scoring: QuizScoring;
  }
  
  export interface QuizResult {
    faction: 'alliance' | 'horde' | 'neutral';
    factionText: string;
    race: string;
    raceDescription: string;
  }