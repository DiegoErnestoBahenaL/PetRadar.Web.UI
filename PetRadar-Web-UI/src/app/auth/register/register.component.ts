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
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  registroForm!: FormGroup;

  errorGeneral = '';
  mensajeInfo = '';
  cargando = false;
  mostrarPassword = false;
  mostrarConfirmarPassword = false;

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
            // 10–15 dígitos
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

  toggleMostrarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  toggleMostrarConfirmarPassword(): void {
    this.mostrarConfirmarPassword = !this.mostrarConfirmarPassword;
  }

  private passwordsIgualesValidator(
    group: AbstractControl
  ): ValidationErrors | null {
    const password = group.get('password');
    const confirmarPassword = group.get('confirmarPassword');

    if (!password || !confirmarPassword) {
      return null;
    }

    return password.value === confirmarPassword.value
      ? null
      : { passwordsNoCoinciden: true };
  }

  tieneErrorCampo(campo: string, tipoError: string): boolean {
    const control = this.f[campo];
    return !!(control && control.touched && control.hasError(tipoError));
  }

  onSubmit(): void {
    this.errorGeneral = '';
    this.mensajeInfo = '';

    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      this.errorGeneral = 'Por favor, corrige los errores en el formulario.';
      return;
    }

    const formValue = this.registroForm.value;

    const payload: RegisterPayload = {
      nombreCompleto: formValue['nombreCompleto'],
      correo: formValue['correo'],
      password: formValue['password'],
      telefono: formValue['telefono'] || null,
      aceptaPrivacidad: formValue['aceptaPrivacidad'],
    };

    this.cargando = true;

    this.authService.registrar(payload).subscribe({
      next: () => {
        this.cargando = false;
        this.mensajeInfo =
          'Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión.';
        // redirigir al login
         this.router.navigate(['/']);
      },
      error: (err) => {
      this.cargando = false;

      console.log('STATUS:', err.status);
      console.log('BACKEND ERROR:', err.error); 

      
      const backendMsg =
        err?.error?.title ||
        err?.error?.detail ||
        (typeof err?.error === 'string' ? err.error : null);

      this.errorGeneral = backendMsg ?? 'Ocurrió un error al registrar tu cuenta.';
    }

    });
  }

  irALogin(): void {
    this.router.navigate(['/']);
  }
}
