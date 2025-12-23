# StudyBook – Reserva de Salas (UCV)

Aplicación académica desarrollada para la **Universidad César Vallejo (UCV)** con el objetivo de **reservar salas de estudio en biblioteca** verificando **disponibilidad por fecha y horario**.  
Este proyecto se conectaba a **Firebase** (Auth + Firestore) para gestionar usuarios y la disponibilidad de salas.

> Proyecto universitario / primer portafolio (Ionic + Angular + Firebase).

## ✨ Funcionalidades principales

- **Inicio de sesión** (Firebase Auth – Email/Password)
- **Gestión de usuario** (perfil básico)
- **Listado de salas**
- **Horarios y disponibilidad**
- **Reservas / solicitudes**
- **Historial**
- Secciones informativas (Acerca de)

## 🧰 Tecnologías

- **Ionic Framework** + **Angular**  
- **Firebase**:
  - Authentication
  - Firestore Database
- **Capacitor** (config incluido) para despliegue móvil

## 📁 Estructura rápida

- `src/app/pages/login` → login + recuperación
- `src/app/pages/main` → módulo principal
  - `salas/`, `horarios/`, `reserva/`, `solicitudes/`, `historial/`, `perfiluser/`, `acerca/`
- `src/app/services/firebase.service.ts` → lógica de Auth/Firestore
- `src/environments/` → configuración por entorno

## ✅ Requisitos

- Node.js (recomendado **18+**)
- Angular CLI (opcional)
- Ionic CLI (recomendado)

Instalar Ionic CLI (si no lo tienes):
```bash
npm i -g @ionic/cli
```

## 🚀 Cómo ejecutar en local

1) Instalar dependencias
```bash
npm install
```

2) Configurar Firebase (IMPORTANTE)  
Por seguridad, este repo incluye **valores placeholder** en:

- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`

Reemplaza:
```ts
firebaseConfig: {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
}
```

3) Ejecutar la app
```bash
npm start
# o
ionic serve
```

## 🔥 Configuración mínima en Firebase

En tu proyecto de Firebase:

1. **Authentication → Sign-in method**
   - Habilitar **Email/Password**
2. **Firestore Database**
   - Crear base de datos (modo prueba para desarrollo)
3. Colecciones usadas por el proyecto (según el código):
   - `users`
   - `disabledSlots` (para marcar bloques de tiempo ocupados por sala/fecha/horario)

> Nota: las reglas de seguridad dependen del alcance académico y el tipo de usuarios.  
> Para producción se recomienda ajustar reglas y validaciones.

## 📦 Build (opcional)

Build web:
```bash
npm run build
```

Capacitor (si deseas Android/iOS):
```bash
npx cap add android
npx cap sync
npx cap open android
```

## 📌 Autor

Proyecto académico desarrollado por **Rodrigo** (UCV).

Si quieres, puedes abrir un issue con sugerencias o mejoras. 🙂
