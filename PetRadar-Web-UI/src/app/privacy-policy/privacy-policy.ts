import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  imports: [RouterLink],
  templateUrl: './privacy-policy.html',
  styleUrl: './privacy-policy.css',
})
export class PrivacyPolicyComponent {
  readonly lastUpdated = '28 de abril de 2026';
  readonly contactEmail = 'business@petradar-qa.org';
}
