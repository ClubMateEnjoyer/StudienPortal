# StudienPortal

Dieses Projekt besteht aus einem **Backend** und einem **Frontend** eines
**Studienbewerbungsportals** im Rahmen des Moduls **Web Engineering 2**.

Das System stellt eine **REST-API** zur Verwaltung von **Nutzern**, **Studiengängen**
und **Bewerbungen** bereit und wird über eine **Single Page Application (SPA)**
bedient.


---

## Backend

Das Backend basiert auf **Node.js**, **Express**, **TypeScript** und **MongoDB**
und verwendet **JWT-basierte Authentifizierung**.

### Features

#### Authentifizierung & Sicherheit
- Login über **HTTP Basic Auth**
- Ausgabe eines **JWT (JSON Web Token)**
- Middleware zur Token-Validierung
- Rollenmodell:
  - Administrator
  - Normaler Nutzer
- HTTPS-Server mit Zertifikaten

#### Benutzerverwaltung
- Benutzer anlegen, lesen, aktualisieren und löschen (CRUD)
- Öffentliche User-API (Signup / öffentliche Infos)
- Passwort-Hashing mit **bcrypt**
- Rollenbasierte Zugriffsbeschränkung

#### Studiengänge
- CRUD-Operationen für Studiengänge
- Filter nach Hochschule
- Eindeutige Studiengänge pro Hochschule
- Schreibzugriffe nur für Administratoren

#### Bewerbungen
- Nutzer können sich auf Studiengänge bewerben
- Administratoren sehen alle Bewerbungen
- Nutzer sehen nur ihre eigenen Bewerbungen
- Keine doppelten Bewerbungen für denselben Studiengang im selben Semester

#### Datenbank
- MongoDB mit **Mongoose**
- Automatische Erstellung eines Standard-Admins:
  - **Benutzer:** `admin`
  - **Passwort:** `123`

### Technologie-Stack (Backend)
- Node.js
- Express (REST API)
- TypeScript
- MongoDB + Mongoose
- JSON Web Tokens (JWT)
- bcrypt
- Docker (MongoDB)
- HTTPS

---

## Frontend

Das Frontend ist eine **Single Page Application (SPA)** auf Basis von
**React**, **TypeScript** und **Redux Toolkit**.

### Features
- Single Page Application ohne Seitenreload
- Login über Dialog (Modal)
- JWT-Authentifizierung
- Rollenbasierte Oberfläche:
  - Normale Nutzer
  - Administratoren
- Benutzerverwaltung (nur Admin):
  - Benutzer anzeigen
  - Benutzer anlegen
  - Benutzer bearbeiten
  - Benutzer löschen
- Zentrale Zustandsverwaltung mit **Redux Toolkit**
- UI mit **React Bootstrap**

### Technologie-Stack (Frontend)
- React + TypeScript
- Redux Toolkit
- React Bootstrap / Bootstrap 5
- Vite (Dev Server & Build Tool)

---

## Nutzung / Ausführung

### Voraussetzungen
- Node.js
- Docker
- Laufendes Backend (HTTPS)

---

### Backend starten

```bash
cd backend
docker-compose up -d
```
MongoDB läuft dann unter: mongodb://localhost:27017
```bash
npm install
npm start
```
Backend läuft dann unter: https://127.0.0.1:443


### Frontend starten

```bash
cd frontend
npm install
npm start
```
Frontend läuft dann unter: http://localhost:3000

## Hinweis
- Das Projekt dient ausschließlich Lehr- und Übungszwecken

- Authentifizierung erfolgt über JWT im Authorization-Header

- Backend und Frontend werden lokal betrieben

