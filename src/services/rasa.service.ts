import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface RasaMessage {
  text?: string;
  image?: string;
  buttons?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class RasaService {

  private readonly RASA_URL = 'http://localhost:5005/webhooks/rest/webhook';
  private readonly SENDER_ID = 'toyster-user';

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<string[]> {
    const payload = {
      sender: this.SENDER_ID,
      message
    };

    return this.http.post<RasaMessage[]>(this.RASA_URL, payload).pipe(
      map((responses) =>
        responses
          .filter(r => r.text)
          .map(r => r.text as string)
      )
    );
  }
}
