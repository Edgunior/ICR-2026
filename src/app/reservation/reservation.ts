import { Component, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToyModel } from '../../models/toy.model';
import { ToyService } from '../../services/toy.service';
import { UserService } from '../../services/user.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Utils } from '../utils';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-reservation',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './reservation.html',
  styleUrl: './reservation.css'
})
export class Reservation {
  protected toy = signal<ToyModel | null>(null)
  protected form: FormGroup

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private builder: FormBuilder,
    private utils: Utils
  ) {
    this.route.params.subscribe(p => {
      if (p['path']) {
        const shortUrl = p['path']
        if (!UserService.hasAuth()) {
          localStorage.setItem(UserService.TO_KEY, `/toy/${shortUrl}/reservation`)
          this.router.navigateByUrl('/login')
          return
        }

        ToyService.getToyByPermalink(shortUrl)
          .then(rsp => this.toy.set(rsp.data))
      }
    })

    this.form = this.builder.group({
      quantity: ['1', [Validators.required, Validators.min(1)]]
    })
  }

  protected onSubmit() {
    if (!this.form.valid) {
      this.utils.showAlert('Invalid form data!')
      return
    }

    const t = this.toy()
    if (!t) {
      this.utils.showAlert('Toy has not been loaded yet!')
      return
    }

    UserService.createReservation({
      orderId: uuidv4(),
      toyId: t.toyId,
      toyName: t.name,             
      type: t.type?.name,                  
      age: t.ageGroup?.name || '',     
      group: t.ageGroup.name || '', 
      quantity: this.form.value.quantity,
      status: 'na',
      price: t.price,          
      description: t.description || ''
    })

    this.router.navigateByUrl('/profile')
  }
}
