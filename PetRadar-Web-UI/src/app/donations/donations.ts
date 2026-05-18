import { Component } from '@angular/core';

@Component({
  selector: 'app-donations',
  imports: [],
  templateUrl: './donations.html',
  styleUrl: './donations.css',
})
export class DonationsComponent {
  donate(amount: 20 | 50) {
    const links = {
      20: 'https://buy.stripe.com/test_aFa14m9AwcTidx6aoh2VG00',
      50: 'https://buy.stripe.com/test_5kQ6oG6ok5qQgJi7c52VG01',
    };
    window.open(links[amount], '_blank', 'noopener,noreferrer');
  }
}
