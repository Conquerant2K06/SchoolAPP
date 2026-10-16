import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="text-align:center; padding: 4rem;">
      <h1>403</h1>
      <p>Accès non autorisé</p>
      <a routerLink="/dashboard">Retour au tableau de bord</a>
    </div>
  `,
})
export class UnauthorizedComponent {}
