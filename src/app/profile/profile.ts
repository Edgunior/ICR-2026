import { Component, signal } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { UserModel } from '../../models/user.model';
import { OrderModel } from '../../models/order.model';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
protected activeUser = signal<UserModel | null>(null)

protected statusMap = {
    'na': 'Ceka se...',
    'paid': 'Placeno',
    'canceled': 'Otkazano',
    'liked': 'Svidja mi se!',
    'disliked': 'Ne svidja mi se!'
  }

  constructor(private router: Router) {
    if (!UserService.hasAuth()) {
      localStorage.setItem(UserService.TO_KEY, '/profile')
      this.router.navigateByUrl('/login')
      return
    }
    this.activeUser.set(UserService.getActiveUser())
  }
  
  protected pay(order: OrderModel) {
    UserService.updateOrder(order.orderId, 'paid')
    this.activeUser.set(UserService.getActiveUser())
  }

  protected cancel(order: OrderModel) {
    UserService.updateOrder(order.orderId, 'canceled')
    this.activeUser.set(UserService.getActiveUser())
  }

  protected like(order: OrderModel) {
    UserService.updateOrder(order.orderId, 'liked')
    this.activeUser.set(UserService.getActiveUser())
  }

  protected dislike(order: OrderModel) {
    UserService.updateOrder(order.orderId, 'disliked')
    this.activeUser.set(UserService.getActiveUser())
  }
  
}
