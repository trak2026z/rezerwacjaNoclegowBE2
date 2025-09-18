# Rezerwacja Noclegów - Backend API

![Node.js](https://img.shields.io/badge/Node.js-v20-green)
![Express](https://img.shields.io/badge/Express-v4.19-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-v7-green)
![Docker](https://img.shields.io/badge/Docker-ready-blue)

Backend API do systemu rezerwacji noclegów zbudowany w oparciu o **Express.js**, **MongoDB** i **JWT**.  
Aplikacja umożliwia zarządzanie użytkownikami, pokojami oraz rezerwacjami.

---

## 📋 Spis treści

- [Funkcjonalności](#-funkcjonalności)
- [Architektura aplikacji](#-architektura-aplikacji)
- [Wymagania](#-wymagania)
- [Uruchomienie aplikacji](#-uruchomienie-aplikacji)
  - [Uruchomienie z Docker Compose](#uruchomienie-z-docker-compose)
  - [Uruchomienie lokalne](#uruchomienie-lokalne)
- [Endpointy API](#-endpointy-api)
- [Skrypty pomocnicze](#-skrypty-pomocnicze)
- [Struktura projektu](#-struktura-projektu)
- [Modele danych](#-modele-danych)
- [Rozwój projektu](#-rozwój-projektu)

---

## 🚀 Funkcjonalności

- **Zarządzanie użytkownikami**:
  - Rejestracja i logowanie
  - Autentykacja z użyciem JWT
  - Profile użytkowników
  - Sprawdzanie dostępności nazw użytkowników i adresów email

- **Zarządzanie pokojami**:
  - Tworzenie, edycja i usuwanie pokoi
  - Przeglądanie dostępnych pokoi
  - System ocen (polubienia/niepolubienia)
  - Rezerwacja pokoi

- **Bezpieczeństwo**:
  - Hashowanie haseł z bcrypt
  - Autoryzacja oparta na tokenach JWT
  - Walidacja danych wejściowych

- **Inne**:
  - Zaawansowane logowanie z pino
  - Obsługa błędów
  - Endpoint health check

---

## 🏗 Architektura aplikacji

Aplikacja została zbudowana w oparciu o architekturę warstwową:

1. **Kontrolery** (`controllers/`) – obsługa żądań HTTP i odpowiedzi  
2. **Serwisy** (`services/`) – logika biznesowa aplikacji  
3. **Repozytoria** (`repositories/`) – warstwa dostępu do danych  
4. **Modele** (`models/`) – schematy danych MongoDB  
5. **Middleware** (`middleware/`) – funkcje pośredniczące Express  
6. **Trasy** (`routes/`) – definicje endpointów API  
7. **Narzędzia** (`utils/`) – funkcje pomocnicze  

---

## 📋 Wymagania

- Node.js **v20** lub nowszy  
- MongoDB **v7** lub nowszy  
- Docker i Docker Compose (opcjonalnie)  

---

## 🚀 Uruchomienie aplikacji

### Uruchomienie z Docker Compose

Najłatwiejszym sposobem uruchomienia aplikacji jest użycie Docker Compose:

```bash
# Uruchomienie środowiska deweloperskiego
docker-compose -f docker-compose.dev.yml up --build

# Zatrzymanie i usunięcie kontenerów
docker-compose -f docker-compose.dev.yml down -v

# Całkowity reset środowiska
docker-compose -f docker-compose.dev.yml down -v --remove-orphans
docker system prune -af --volumes
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up
```

### Uruchomienie lokalne

Jeśli wolisz uruchomić aplikację lokalnie:

```bash
# Instalacja zależności
npm install
```

Skonfiguruj plik `.env`:

```env
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/rezerwacje
JWT_SECRET=your_secret_key
PORT=3000
```

Uruchom aplikację:

```bash
# Tryb deweloperski z hot-reloadingiem
npm run dev

# Tryb produkcyjny
npm start
```

---

## 📡 Endpointy API

### 🔑 Autentykacja

- `POST /authentication/register` – Rejestracja nowego użytkownika  
- `POST /authentication/login` – Logowanie użytkownika  
- `GET /authentication/profile` – Pobranie profilu zalogowanego użytkownika  
- `GET /authentication/publicProfile/:username` – Publiczny profil użytkownika  
- `GET /authentication/checkEmail/:email` – Sprawdzenie dostępności email  
- `GET /authentication/checkUsername/:username` – Sprawdzenie dostępności nazwy  

### 🏠 Pokoje

- `GET /rooms` – Lista wszystkich pokoi  
- `GET /rooms/:id` – Szczegóły pokoju  
- `POST /rooms` – Utworzenie nowego pokoju  
- `PUT /rooms/:id` – Aktualizacja pokoju  
- `DELETE /rooms/:id` – Usunięcie pokoju  
- `POST /rooms/:id/like` – Polubienie pokoju  
- `POST /rooms/:id/dislike` – Niepolubienie pokoju  
- `POST /rooms/:id/reserve` – Rezerwacja pokoju  

### 🌡 Inne

- `GET /health` – Endpoint health check  

---

## 🛠 Skrypty pomocnicze

Katalog `scripts/` zawiera skrypty wspomagające testowanie i zarządzanie aplikacją:

- `reset-dev.sh` – Reset środowiska deweloperskiego  
- `test_flow.sh` – Pełny test przepływu aplikacji  
- `test_flow2.sh`, `test_flow3.sh` – Alternatywne wersje testu  
- `test_user.sh` – Test funkcjonalności użytkownika  
- `test_user2.sh`, `test_user3.sh` – Alternatywne wersje testu  
- `test_db.sh` – Podgląd bazy danych (kolekcje users i rooms)  

Przykłady użycia:

```bash
./scripts/test_flow.sh
./scripts/test_db.sh
```

---

## 📁 Struktura projektu

```
rezerwacjaNoclegowBE2/
├── scripts/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── app.js
│   └── server.js
├── .dockerignore
├── .env
├── .gitignore
├── docker-compose.dev.yml
├── Dockerfile.dev
├── jsconfig.json
├── package.json
└── README.md
```

---

## 📊 Modele danych

### 👤 User

- `email` – unikalny adres email  
- `username` – unikalna nazwa użytkownika  
- `password` – hasło (hashowane)  
- `createdAt`, `updatedAt` – daty utworzenia i aktualizacji  

### 🏠 Room

- `title` – tytuł oferty (5–50 znaków)  
- `body` – opis pokoju (5–500 znaków)  
- `city` – miasto  
- `imgLink` – link do zdjęcia pokoju  
- `createdBy` – referencja do autora  
- `createdAt` – data utworzenia  
- `likes`, `dislikes` – liczba polubień/niepolubień  
- `likedBy`, `dislikedBy` – listy użytkowników  
- `reserved` – status rezerwacji  
- `reservedBy` – referencja do użytkownika rezerwującego  
- `startAt`, `endsAt` – daty rezerwacji  

---

## 🔧 Rozwój projektu

### Uruchamianie testów

```bash
npm test
```

### Lintowanie kodu

```bash
npm run lint
```

### Logowanie

Aplikacja wykorzystuje bibliotekę **pino**. W trybie dev logi są formatowane z użyciem **pino-pretty**.

### Monitorowanie kontenerów

```bash
docker logs -f rezerwacja_api_dev
docker logs -f rezerwacja_db_dev
```

---

© 2023 **Rezerwacja Noclegów** – Wszelkie prawa zastrzeżone.
