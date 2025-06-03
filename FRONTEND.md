
# FRONTEND - Documentation détaillée

## Vue d'ensemble
Cette documentation détaille chaque élément du frontend KIADISA et ses connexions avec le backend (Supabase ou mocks).

---

## 🏠 Pages principales

### 1. **Page d'accueil** (`src/pages/Index.tsx`)
- **État**: ✅ Fonctionnelle
- **Connexion**: Aucune (statique)
- **Éléments**:
  - Logo et titre KIADISA
  - Boutons de navigation vers Auth/Dashboard
  - AnimatedBackground (décoratif)

### 2. **Page d'authentification** (`src/pages/Auth.tsx`)
- **État**: ✅ Connectée Supabase
- **Connexion**: `useAuth` hook → Supabase Auth
- **Tables utilisées**:
  - `auth.users` (via Supabase Auth)
  - `profiles` (création automatique via trigger)
  - `user_stats` (création automatique via trigger)
- **Éléments**:
  - **Onglet Connexion**:
    - Input email → `auth.users.email`
    - Input password → `auth.users.encrypted_password`
  - **Onglet Inscription**:
    - Input pseudo → `profiles.pseudo`
    - Input email → `auth.users.email`
    - Input password → `auth.users.encrypted_password`
    - Avatar par défaut → `profiles.avatar`
  - **Onglet Invité**:
    - Input pseudo → localStorage uniquement
    - Mode fallback sans persistance

### 3. **Dashboard** (`src/pages/Dashboard.tsx`)
- **État**: ⚠️ Partiellement mockée
- **Connexion**: Mixte (Supabase + mocks)
- **Tables utilisées**:
  - `user_stats` → statistiques du joueur
  - `profiles` → informations du profil
- **Éléments**:
  - **Section Profil**:
    - Pseudo affiché → `profiles.pseudo`
    - Avatar affiché → `profiles.avatar`
    - Level → `user_stats.level`
    - XP → `user_stats.total_xp`
    - Coins → `user_stats.coins`
  - **Section Stats**:
    - Parties jouées → `user_stats.games_played`
    - Parties gagnées → `user_stats.games_won`
    - Meilleure série → `user_stats.best_streak`
    - Bluffs réussis → `user_stats.bluffs_successful`
  - **Boutons d'action**:
    - Créer une partie → Navigation vers CreateGame
    - Rejoindre une partie → Navigation vers JoinGame

### 4. **Création de partie** (`src/pages/CreateGame.tsx`)
- **État**: ⚠️ Mockée avec hooks Supabase
- **Connexion**: `useGameCreation` → Supabase
- **Tables utilisées**:
  - `games` → création de la partie
  - `game_players` → ajout de l'hôte
- **Éléments**:
  - **Sélection du mode** → `games.settings.mode`
  - **Sélection de l'ambiance** → `games.settings.ambiance`
  - **Mini-jeux sélectionnés** → `games.settings.miniGames`
  - **Nombre de rounds** → `games.total_rounds`
  - **Mode 2 joueurs** → `games.settings.twoPlayersOnly`
  - **Code généré** → `games.code`

### 5. **Rejoindre une partie** (`src/pages/JoinGame.tsx`)
- **État**: ⚠️ Mockée avec hooks Supabase
- **Connexion**: `useJoinGame` → Supabase
- **Tables utilisées**:
  - `games` → vérification du code
  - `game_players` → ajout du joueur
- **Éléments**:
  - **Input code** → recherche dans `games.code`
  - **Validation** → vérification `games.status = 'waiting'`

### 6. **Lobby** (`src/pages/Lobby.tsx`)
- **État**: ❌ Complètement mockée
- **Connexion**: À connecter avec Supabase
- **Tables nécessaires**:
  - `games` → informations de la partie
  - `game_players` + `profiles` → liste des joueurs
- **Éléments à connecter**:
  - Liste des joueurs → `game_players` JOIN `profiles`
  - Statut de la partie → `games.status`
  - Paramètres affichés → `games.settings`
  - Bouton démarrer (hôte) → `games.phase = 'intro'`

### 7. **Jeu** (`src/pages/Game.tsx`)
- **État**: ❌ Complètement mockée
- **Connexion**: À connecter avec Supabase
- **Tables nécessaires**:
  - `games` → état de la partie
  - `rounds` → manche actuelle
  - `questions` → question de la manche
  - `answers` → réponses des joueurs
  - `votes` → votes des joueurs
- **Éléments à connecter**:
  - Phase de jeu → `games.phase`
  - Question affichée → `questions.text` via `rounds.question_id`
  - Réponses des joueurs → `answers.content`
  - Interface de vote → `votes.vote_type`

---

## 🧩 Composants réutilisables

### 1. **AnimatedBackground** (`src/components/AnimatedBackground.tsx`)
- **État**: ✅ Fonctionnel
- **Connexion**: Aucune (décoratif)

### 2. **GlassCard** (`src/components/GlassCard.tsx`)
- **État**: ✅ Fonctionnel
- **Connexion**: Aucune (UI)

### 3. **LoadingStates** (`src/components/LoadingStates.tsx`)
- **État**: ✅ Fonctionnel
- **Connexion**: Aucune (UI)

### 4. **NetworkStatus** (`src/components/NetworkStatus.tsx`)
- **État**: ✅ Fonctionnel
- **Connexion**: Détection réseau

### 5. **Toast** (`src/components/Toast.tsx`)
- **État**: ✅ Fonctionnel
- **Connexion**: Système de notifications

---

## 🎮 Composants de jeu

### 1. **GamePhaseManager** (`src/components/games/GamePhaseManager.tsx`)
- **État**: ❌ Mock
- **Connexion**: À connecter avec `useGamePhase`
- **Tables nécessaires**: `games.phase`, `rounds`

### 2. **Mini-jeux** (`src/components/games/`)
- **KiKaDiGame.tsx**: ❌ Mock
- **KiDiVraiGame.tsx**: ❌ Mock
- **KiDeNousGame.tsx**: ❌ Mock
- **KiDejaGame.tsx**: ❌ Mock
- **Connexion**: À connecter avec `questions`, `answers`, `votes`

### 3. **RealScoreDisplay** (`src/components/games/RealScoreDisplay.tsx`)
- **État**: ❌ Mock
- **Connexion**: À connecter avec `game_players.score`

---

## 🔗 Hooks personnalisés

### ✅ **Hooks connectés Supabase**:
- `useAuth` → `auth.users`, `profiles`, `user_stats`
- `usePlayerStats` → `user_stats`
- `useGameCreation` → `games`, `game_players`
- `useJoinGame` → `games`, `game_players`
- `useGameAnswers` → `answers`
- `useGameVotes` → `votes`
- `useGamePhase` → `games`
- `useCurrentPlayer` → `game_players`

### ⚠️ **Hooks partiellement connectés**:
- `useGameData` → Fonctionnel mais peu utilisé
- `useGameStateFromSupabase` → Fonctionnel mais peu utilisé

### ❌ **Hooks à connecter**:
- `useRoundManagement` → `rounds`, `questions`

---

## 📊 Stores (Zustand)

### 1. **gameStore** (`src/stores/gameStore.ts`)
- **État**: ✅ Connecté Supabase
- **Tables**: `games`, `game_players`, `answers`, `votes`
- **Usage**: Alternative aux hooks pour la gestion d'état global

### 2. **uiStore** (`src/stores/uiStore.ts`)
- **État**: ✅ Fonctionnel
- **Connexion**: Local (toasts, modales)

### 3. **authStore** (`src/stores/authStore.ts`)
- **État**: ✅ Connecté Supabase
- **Tables**: `auth.users`, `profiles`

---

## 🚨 Points critiques à corriger

### 1. **Pages mockées à connecter**:
- Lobby (priorité haute)
- Game (priorité haute)

### 2. **Composants à finaliser**:
- Tous les mini-jeux
- GamePhaseManager
- RealScoreDisplay

### 3. **Intégrations manquantes**:
- Real-time updates pour les parties
- Gestion des erreurs réseau
- Synchronisation des scores

---

## ✅ Prochaines étapes recommandées

1. **Connecter le Lobby** avec `useGameData`
2. **Connecter la page Game** avec les hooks existants
3. **Implémenter le real-time** pour les parties multijoueur
4. **Tester end-to-end** le flow complet
