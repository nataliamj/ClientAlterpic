import { Component } from "@angular/core";

// Crea un home.component.ts simple
@Component({
  standalone: true,
  template: `
    <div class="p-8">
      <h1>Bienvenido a Alterpic</h1>
      <a routerLink="/auth/login">Ir a Login</a>
    </div>
  `
})
export class HomeComponent {}