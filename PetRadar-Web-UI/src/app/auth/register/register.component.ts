import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, RegisterPayload } from '../auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class RegisterComponent implements OnInit {
  registroForm!: FormGroup;
  enviado = false;
  registroExitoso = false;
  mensajeExito = '';
  cargando = false;
  errorGeneral = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registroForm = this.fb.group(
      {
        nombreCompleto: [
          '',
          [Validators.required, Validators.minLength(1), Validators.maxLength(120)],
        ],
        correo: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [Validators.required, Validators.minLength(8), Validators.maxLength(128)],
        ],
        confirmarPassword: ['', [Validators.required]],
        telefono: [
          '',
          [
            // patrón
            Validators.pattern(/^\d{10,15}$/),
          ],
        ],
        aceptaPrivacidad: [false, [Validators.requiredTrue]],
      },
      {
        validators: [this.passwordsIgualesValidator],
      }
    );
  }

  get f(): { [key: string]: AbstractControl } {
    return this.registroForm.controls;
  }

  passwordsIgualesValidator(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmarPassword')?.value;
    if (pass && confirm && pass !== confirm) {
      group.get('confirmarPassword')?.setErrors({ passwordsNoCoinciden: true });
      return { passwordsNoCoinciden: true };
    }
    return null;
  }

  onSubmit(): void {
    this.enviado = true;
    this.errorGeneral = '';
    this.mensajeExito = '';

    if (this.registroForm.invalid) {
      return;
    }

    const payload: RegisterPayload = {
      nombreCompleto: this.f['nombreCompleto'].value,
      correo: this.f['correo'].value,
      password: this.f['password'].value,
      telefono: this.f['telefono'].value || null,
      aceptaPrivacidad: this.f['aceptaPrivacidad'].value,
    };

    this.cargando = true;
    this.authService.registrar(payload).subscribe({
      next: () => {
        this.cargando = false;
        this.registroExitoso = true;
        this.mensajeExito =
          'Tu cuenta ha sido creada. Te hemos enviado un correo para verificar tu cuenta.';
        // limpieza de formulario
        // this.registroForm.reset();
      },
      error: (err) => {
        this.cargando = false;
        console.error(err);
        this.errorGeneral =
          'Ocurrió un error al registrar tu cuenta. Inténtalo más tarde.';
      },
    });
  }

  irALogin(): void {
    this.router.navigate(['/']);
  }
}
