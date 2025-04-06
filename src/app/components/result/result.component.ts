import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent {
  private router = inject(Router);
  
  result = history.state?.result
  ngOnInit() {
    console.log(this.result);
  }

  get factionClass() {
    return this.result.faction;
  }

  get factionImage() {
    return `assets/img/${this.result.faction}.png`;
  }

  restartQuiz() {
    this.router.navigate(['/']);
  }
}