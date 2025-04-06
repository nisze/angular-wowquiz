import { Component, OnInit, signal } from '@angular/core';
import { QuizService } from './quiz.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QuizData, QuizQuestion, QuizResult } from '../../models/quiz.model';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit {
  // Propriedades definidas como signals
  isLoading = signal<boolean>(true);
  quizData = signal<QuizData | null>(null);
  currentQuestionIndex = signal<number>(0);
  answers = signal<(number | null)[]>([]);

  constructor(
    private quizService: QuizService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadQuizData();
  }

  loadQuizData(): void {
    this.quizService.loadQuizData().subscribe({
      next: (data) => {
        this.quizData.set({
          ...data,
          questions: data.questions.map(question => ({
            ...question,
            options: question.options.map(option => ({
              ...option,
              factionBonus: option.factionBonus as "alliance" | "horde" | "neutral" | undefined
            }))
          }))
        });
        this.answers.set(new Array(data.questions.length).fill(null));
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading quiz data:', error);
        this.isLoading.set(false);
      }
    });
  }

  get currentQuestion(): QuizQuestion {
    return this.quizData()?.questions[this.currentQuestionIndex()] as QuizQuestion;
  }

  get progress(): number {
    return ((this.currentQuestionIndex() + 1) / (this.quizData()?.questions.length || 1)) * 100;
  }

  selectAnswer(optionId: number): void {
    this.answers.update(answers => {
      const newAnswers = [...answers];
      newAnswers[this.currentQuestionIndex()] = optionId;
      return newAnswers;
    });

    if (this.currentQuestionIndex() < (this.quizData()?.questions.length || 0) - 1) {
      setTimeout(() => {
        this.currentQuestionIndex.update(idx => idx + 1);
      }, 300);
    } else {
      this.submitQuiz();
    }
  }

  prevQuestion(): void {
    if (this.currentQuestionIndex() > 0) {
      this.currentQuestionIndex.update(idx => idx - 1);
    }
  }

  submitQuiz(): void {
    if (!this.quizData()) return;
    
    const result = this.quizService.calculateResult(
      this.answers().filter(a => a !== null) as number[],
      this.quizData()!
    );
    
    this.router.navigate(['/result'], { state: { result } });
  }
}