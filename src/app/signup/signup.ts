import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { Utils } from '../utils';
import { RegisterModel } from '../../models/register.model';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
})
export class Signup {

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private utils: Utils
  ) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }

  onSubmit() {
    if (!this.form.valid) {
      this.utils.showAlert('Invalid form data!');
      return;
    }

    if (this.form.value.password !== this.form.value.confirmPassword) {
      this.utils.showAlert('Passwords do not match!');
      return;
    }

    const payload: RegisterModel = {
      firstName: this.form.value.firstName!,
      lastName: this.form.value.lastName!,
      email: this.form.value.email!,
      phone: this.form.value.phone!,
      password: this.form.value.password!
    };

    try {
      UserService.register(payload);
      this.router.navigateByUrl('/');
    } catch (e: any) {
      if (e.message === 'EMAIL_EXISTS') {
        this.utils.showAlert('Email already exists!');
      } else {
        this.utils.showAlert('Registration failed!');
      }
    }
  }
}
