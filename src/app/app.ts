import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UserService } from '../services/user.service';
import { Utils } from './utils';
import { RasaService } from '../services/rasa.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    FormsModule,
    CommonModule
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected year = new Date().getFullYear();

  chatOpen = false;
  inputText = '';
  messages: { text: string; user: boolean }[] = [];
  isLoading = false;

  private greeted = false;

  constructor(
    private router: Router,
    private utils: Utils,
    private rasaService: RasaService
  ) {}

  // Otvori / zatvori chat
  toggleChat() {
    this.chatOpen = !this.chatOpen;

    if (this.chatOpen && !this.greeted) {
      this.messages.push({
        text: 'Zdravo! Kako vam mogu pomoći danas?',
        user: false
      });
      this.greeted = true;
    }
  }

  sendMessage() {
    if (!this.inputText.trim() || this.isLoading) return;

    const userMessage = this.inputText;
    this.inputText = '';

    this.messages.push({ text: userMessage, user: true });
    this.isLoading = true;

    this.rasaService.sendMessage(userMessage).subscribe({
      next: (responses) => {
        if (responses.length === 0) {
          this.messages.push({
            text: 'Izvinjavamo se, trenutno nemamo odgovor na to pitanje.',
            user: false
          });
        } else {
          responses.forEach(text => {
            this.messages.push({ text, user: false });
          });
        }
        this.isLoading = false;
      },
      error: () => {
        this.messages.push({
          text: 'Došlo je do greške prilikom slanja vaše poruke. Molimo pokušajte ponovo kasnije.',
          user: false
        });
        this.isLoading = false;
      }
    });
  }

  getUserName() {
    const user = UserService.getActiveUser();
    return `${user.firstName} ${user.lastName}`;
  }

  hasAuth() {
    return UserService.hasAuth();
  }

  doLogout() {
    this.utils.showDialog(
      'Da li ste sigurni da zelite da se izlogujete?',
      () => {
        UserService.logout();
        this.router.navigateByUrl('/login');
      },
      'Izloguj se',
      "Otkaži"
    );
  }

  private resizing = false;
  private startX = 0;
  private startY = 0;
  private startWidth = 0;
  private startHeight = 0;

  startResize(event: MouseEvent) {
    event.preventDefault();

    const chat = (event.target as HTMLElement).parentElement!;
    this.resizing = true;

    this.startX = event.clientX;
    this.startY = event.clientY;
    this.startWidth = chat.offsetWidth;
    this.startHeight = chat.offsetHeight;

    document.addEventListener('mousemove', this.resize);
    document.addEventListener('mouseup', this.stopResize);
  }

  resize = (event: MouseEvent) => {
    if (!this.resizing) return;

    const dx = this.startX - event.clientX;
    const dy = this.startY - event.clientY;

    const chat = document.querySelector('.chat-modal') as HTMLElement;

    chat.style.width = this.startWidth + dx + 'px';
    chat.style.height = this.startHeight + dy + 'px';
  };

  stopResize = () => {
    this.resizing = false;
    document.removeEventListener('mousemove', this.resize);
    document.removeEventListener('mouseup', this.stopResize);
  };
}
