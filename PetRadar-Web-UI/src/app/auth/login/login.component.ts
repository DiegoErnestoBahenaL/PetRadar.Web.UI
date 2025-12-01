import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, LoginPayload } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  errorGeneral = '';
  mensajeInfo = '';
  cargando = false;
  mostrarPassword = false;

  // sección de recuperación
  mostrandoRecuperacion = false;
  recuperacionCorreo = '';
  mensajeRecuperacion = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const correoRecordado = localStorage.getItem('correoRecordado') || '';

    this.loginForm = this.fb.group({
      correo: [correoRecordado, [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      recordarCorreo: [!!correoRecordado],
    });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.loginForm.controls;
  }

  toggleMostrarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  onSubmit(): void {
    this.errorGeneral = '';
    this.mensajeInfo = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorGeneral = 'Por favor, completa correctamente el formulario.';
      return;
    }

    const payload: LoginPayload = this.loginForm.value as LoginPayload;

    // recordar/no recordar correo
    if (payload.recordarCorreo) {
      localStorage.setItem('correoRecordado', payload.correo);
    } else {
      localStorage.removeItem('correoRecordado');
    }

    this.cargando = true;

    this.authService.login(payload).subscribe({
      next: (resp) => {
        this.cargando = false;

        if (resp.requiereVerificacion) {
          this.mensajeInfo =
            'Tu cuenta aún no está verificada. Te hemos enviado un correo de verificación.';
          return;
        }

        this.mensajeInfo = 'Inicio de sesión exitoso.';
        this.router.navigate(['/registro']); 
      },
      error: (err) => {
        this.cargando = false;
        console.error(err);

        if (err?.message === 'CREDENCIALES_INVALIDAS') {
          this.errorGeneral = 'Correo o contraseña incorrectos.';
        } else {
          this.errorGeneral =
            'No fue posible iniciar sesión. Inténtalo de nuevo más tarde.';
        }
      },
    });
  }

  // RECUPERACION DE PASSWORD

  mostrarRecuperacionPassword(): void {
    this.mostrandoRecuperacion = true;
    this.mensajeRecuperacion = '';
    this.recuperacionCorreo = this.f['correo'].value || '';
  }

  cancelarRecuperacion(): void {
    this.mostrandoRecuperacion = false;
    this.mensajeRecuperacion = '';
  }

  enviarRecuperacion(): void {
    this.mensajeRecuperacion = '';

    const correo = this.recuperacionCorreo?.trim();
    if (!correo) {
      this.mensajeRecuperacion = 'Ingresa un correo válido.';
      return;
    }

    this.authService.recuperarPassword(correo).subscribe({
      next: () => {
        this.mensajeRecuperacion =
          'Si el correo está registrado, te enviaremos instrucciones para recuperar tu contraseña.';
      },
      error: () => {
        this.mensajeRecuperacion =
          'No fue posible procesar tu solicitud. Inténtalo más tarde.';
      },
    });
  }

  reenviarVerificacion(): void {
    const correo = this.f['correo'].value;
    if (!correo) {
      this.mensajeInfo = 'Ingresa tu correo para reenviar la verificación.';
      return;
    }

    this.authService.reenviarVerificacion(correo).subscribe({
      next: () => {
        this.mensajeInfo = 'Te hemos reenviado el correo de verificación.';
      },
      error: () => {
        this.mensajeInfo =
          'No fue posible reenviar la verificación. Inténtalo más tarde.';
      },
    });
  }

  irARegistro(): void {
    this.router.navigate(['/registro']);
  }
}
