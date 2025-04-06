import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

interface QuizQuestion {
  id: number;
  question: string;
  options: {
    id: number;
    name: string;
    alias: string;
    factionBonus?: string;
  }[];
  comment?: string;
}

interface QuizResult {
  faction: string;
  factionText: string;
  race: string;
  raceDescription: string;
}

interface QuizData {
  title: string;
  questions: QuizQuestion[];
  results: {
    factionLogic: {
      alliance: string;
      horde: string;
      neutral: string;
    };
    Aliança: {
      [key: string]: {
        desc: string;
        match: string[];
      };
    };
    Horda: {
      [key: string]: {
        desc: string;
        match: string[];
      };
    };
  };
  scoring: {
    description: string;
    thresholds: {
      alliance: number;
      horde: number;
      neutral: string;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private http = inject(HttpClient);
  private quizData!: QuizData;

  loadQuizData() {
    return this.http.get<QuizData>('assets/data/quiz_questions.json').pipe(
      map(data => {
        this.quizData = data;
        return data;
      })
    );
  }

  calculateResult(answers: number[], quizData: QuizData): QuizResult {
    if (!this.quizData) {
      return this.getDefaultResult();
    }

    // Lógica de cálculo da facção
    const factionPoints = { alliance: 0, horde: 0 };
    
    answers.forEach((answerId, index) => {
      const option = this.quizData.questions[index].options.find(o => o.id === answerId);
      if (option?.factionBonus === 'alliance') factionPoints.alliance++;
      if (option?.factionBonus === 'horde') factionPoints.horde++;
    });

    var faction: string
    if (factionPoints.alliance == factionPoints.horde) {
        faction = 'neutral'
    } else {
        faction = factionPoints.alliance >= this.quizData.scoring.thresholds.alliance ? 'alliance' : 'horde';
    }

    // Lógica para determinar raça específica
    const answerPattern = answers.map((answerId, i) => {
      return this.quizData.questions[i].options.find(o => o.id === answerId)?.alias || '';
    });

    const factionRaces = faction === 'alliance' ? 
      this.quizData.results.Aliança : 
      this.quizData.results.Horda;

    const races = Object.entries(factionRaces);
    let bestMatch = { race: '', score: -1, desc: '' };
    
    for (const [race, data] of races) {
      const score = data.match.reduce((acc, val, i) => 
        acc + (val === answerPattern[i] ? 1 : 0), 0);
      
      if (score > bestMatch.score) {
        bestMatch = { race, score, desc: data.desc };
      }
    }

    const firstRace = races[0]?.[1] || { desc: 'Descrição não disponível' };

    return {
      faction,
      factionText: this.quizData.results.factionLogic[faction as keyof typeof this.quizData.results.factionLogic],
      race: bestMatch.race || races[0]?.[0] || 'Pandarén',
      raceDescription: bestMatch.desc || firstRace.desc
    };
  }

  private getDefaultResult(): QuizResult {
    return {
      faction: 'neutral',
      factionText: '⚖️ Você é Pandarén!',
      race: 'Pandarén',
      raceDescription: 'Pacíficos mestres das artes marciais que valorizam harmonia e boa comida.'
    };
  }
}43