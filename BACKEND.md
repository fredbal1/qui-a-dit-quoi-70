
# BACKEND - Documentation détaillée

## Vue d'ensemble
Cette documentation détaille chaque table Supabase, ses colonnes, et les éléments frontend qui les utilisent.

---

## 🔐 Authentification et profils

### 1. **Table `auth.users`** (Supabase natif)
- **Gestion**: Automatique par Supabase Auth
- **Colonnes principales**:
  - `id` (uuid) → Référence dans toutes les autres tables
  - `email` → Input email (page Auth)
  - `encrypted_password` → Input password (page Auth)
  - `raw_user_meta_data` → Métadonnées (pseudo, avatar)
- **Éléments frontend connectés**:
  - Page Auth : inputs email/password
  - Hook `useAuth` : gestion des sessions
- **RLS**: Géré automatiquement par Supabase

### 2. **Table `profiles`**
```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  pseudo text NOT NULL,
  email text,
  avatar text DEFAULT '🎮',
  created_at timestamp DEFAULT now()
);
```
- **Colonnes et connexions frontend**:
  - `id` → ID utilisateur (automatique)
  - `pseudo` → Input pseudo (page Auth, Dashboard)
  - `email` → Email affiché (Dashboard)
  - `avatar` → Avatar affiché (Dashboard, Lobby)
  - `created_at` → Date d'inscription
- **Éléments frontend connectés**:
  - Page Auth : création du profil
  - Dashboard : affichage du pseudo et avatar
  - Lobby : liste des joueurs
- **RLS**: ✅ Configuré
  - Lecture : tous les utilisateurs authentifiés
  - Écriture : propriétaire uniquement

### 3. **Table `user_stats`**
```sql
CREATE TABLE user_stats (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  level integer DEFAULT 1,
  total_xp integer DEFAULT 0,
  coins integer DEFAULT 0,
  games_played integer DEFAULT 0,
  games_won integer DEFAULT 0,
  best_streak integer DEFAULT 0,
  bluffs_successful integer DEFAULT 0,
  bluffs_detected integer DEFAULT 0,
  achievements text[] DEFAULT '{}',
  titles text[] DEFAULT '{}'
);
```
- **Colonnes et connexions frontend**:
  - `user_id` → Référence utilisateur
  - `level` → Badge level (Dashboard)
  - `total_xp` → Barre d'XP (Dashboard)
  - `coins` → Solde coins (Dashboard, Shop)
  - `games_played` → Stat parties jouées (Dashboard)
  - `games_won` → Stat parties gagnées (Dashboard)
  - `best_streak` → Meilleure série (Dashboard)
  - `bluffs_successful` → Bluffs réussis (Dashboard)
  - `bluffs_detected` → Bluffs détectés (Dashboard)
  - `achievements` → Liste des achievements (Dashboard)
  - `titles` → Titres débloqués (Shop)
- **Éléments frontend connectés**:
  - Hook `usePlayerStats`
  - Dashboard : section statistiques complète
- **RLS**: ✅ Configuré
  - Lecture/Écriture : propriétaire uniquement

---

## 🎮 Gestion des parties

### 4. **Table `games`**
```sql
CREATE TABLE games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code varchar(6) UNIQUE NOT NULL,
  host uuid REFERENCES auth.users(id),
  status text DEFAULT 'waiting',
  phase text DEFAULT 'intro',
  current_round integer DEFAULT 1,
  total_rounds integer DEFAULT 5,
  current_game text,
  settings jsonb NOT NULL,
  created_at timestamp DEFAULT now()
);
```
- **Colonnes et connexions frontend**:
  - `id` → ID unique de la partie
  - `code` → Code de la partie (CreateGame, JoinGame, Lobby)
  - `host` → ID de l'hôte (permissions spéciales)
  - `status` → 'waiting', 'playing', 'finished' (Lobby, Game)
  - `phase` → 'intro', 'answer', 'vote', 'reveal', 'results' (Game)
  - `current_round` → Round actuel (Game)
  - `total_rounds` → Nombre total de rounds (CreateGame, Game)
  - `current_game` → Mini-jeu actuel (Game)
  - `settings` → Configuration JSON (CreateGame, Lobby)
    - `settings.mode` → Mode de jeu
    - `settings.ambiance` → Ambiance sélectionnée
    - `settings.miniGames` → Liste des mini-jeux
    - `settings.twoPlayersOnly` → Mode 2 joueurs
- **Éléments frontend connectés**:
  - CreateGame : création avec settings
  - JoinGame : recherche par code
  - Lobby : affichage des paramètres
  - Game : gestion des phases et rounds
- **RLS**: ✅ Configuré
  - Lecture : participants uniquement
  - Création : utilisateur authentifié
  - Modification : hôte uniquement

### 5. **Table `game_players`**
```sql
CREATE TABLE game_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id),
  user_id uuid REFERENCES auth.users(id),
  is_host boolean DEFAULT false,
  score integer DEFAULT 0,
  level integer DEFAULT 1,
  xp integer DEFAULT 0,
  coins integer DEFAULT 0
);
```
- **Colonnes et connexions frontend**:
  - `id` → ID unique du joueur dans la partie
  - `game_id` → Référence à la partie
  - `user_id` → Référence au joueur
  - `is_host` → Statut hôte (permissions interface)
  - `score` → Score actuel (Game, scoreboard)
  - `level` → Level du joueur (affichage)
  - `xp` → XP du joueur (affichage)
  - `coins` → Coins du joueur (affichage)
- **Éléments frontend connectés**:
  - Lobby : liste des joueurs connectés
  - Game : scores en temps réel
  - Hook `useCurrentPlayer`
- **RLS**: ✅ Configuré
  - Lecture/Écriture : propriétaire uniquement

---

## 🎯 Gameplay

### 6. **Table `rounds`**
```sql
CREATE TABLE rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id),
  round_number integer NOT NULL,
  mini_game_id text NOT NULL,
  question_id text REFERENCES questions(id),
  status text DEFAULT 'waiting',
  started_at timestamp,
  completed_at timestamp
);
```
- **Colonnes et connexions frontend**:
  - `id` → ID unique du round
  - `game_id` → Référence à la partie
  - `round_number` → Numéro du round (Game header)
  - `mini_game_id` → Type de mini-jeu (Game interface)
  - `question_id` → Question à afficher
  - `status` → Statut du round
  - `started_at` → Heure de début
  - `completed_at` → Heure de fin
- **Éléments frontend connectés**:
  - Game : composants de mini-jeux
  - Hook `useRoundManagement`
- **RLS**: ✅ Configuré
  - Lecture : participants de la partie

### 7. **Table `questions`**
```sql
CREATE TABLE questions (
  id text PRIMARY KEY,
  text text NOT NULL,
  game_type text NOT NULL,
  ambiance text NOT NULL,
  category text
);
```
- **Colonnes et connexions frontend**:
  - `id` → ID unique de la question
  - `text` → Texte affiché (Game)
  - `game_type` → 'kikadi', 'kidivrai', 'kidenous', 'kideja'
  - `ambiance` → 'safe', 'intime', 'nofilter'
  - `category` → Catégorie optionnelle
- **Éléments frontend connectés**:
  - Composants de mini-jeux
  - Hook `useGameQuestions`
- **RLS**: ✅ Configuré (lecture publique)

### 8. **Table `answers`**
```sql
CREATE TABLE answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES auth.users(id),
  round_id uuid REFERENCES rounds(id),
  content text NOT NULL,
  is_bluff boolean DEFAULT false,
  timestamp timestamp DEFAULT now()
);
```
- **Colonnes et connexions frontend**:
  - `id` → ID unique de la réponse
  - `player_id` → Auteur de la réponse
  - `round_id` → Round concerné
  - `content` → Texte de la réponse (Game)
  - `is_bluff` → Marqueur bluff (gameplay)
  - `timestamp` → Heure de soumission
- **Éléments frontend connectés**:
  - Game : phase answer, affichage des réponses
  - Hook `useGameAnswers`
- **RLS**: ✅ Configuré
  - Lecture : participants de la partie
  - Écriture : auteur uniquement

### 9. **Table `votes`**
```sql
CREATE TABLE votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES auth.users(id),
  round_id uuid REFERENCES rounds(id),
  target_player_id uuid REFERENCES auth.users(id),
  answer_id uuid REFERENCES answers(id),
  vote_type text NOT NULL,
  timestamp timestamp DEFAULT now()
);
```
- **Colonnes et connexions frontend**:
  - `id` → ID unique du vote
  - `player_id` → Votant
  - `round_id` → Round concerné
  - `target_player_id` → Joueur ciblé
  - `answer_id` → Réponse votée
  - `vote_type` → 'guess', 'bluff', 'truth'
  - `timestamp` → Heure du vote
- **Éléments frontend connectés**:
  - Game : phase vote, interface de vote
  - Hook `useGameVotes`
- **RLS**: ✅ Configuré
  - Lecture : participants de la partie
  - Écriture : votant uniquement

---

## 🏆 Historique et récompenses

### 10. **Table `game_history`**
```sql
CREATE TABLE game_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id),
  player_id uuid REFERENCES auth.users(id),
  final_score integer NOT NULL,
  final_position integer NOT NULL,
  coins_gained integer DEFAULT 0,
  xp_gained integer DEFAULT 0,
  completed_at timestamp DEFAULT now()
);
```
- **Colonnes et connexions frontend**:
  - `id` → ID unique de l'historique
  - `game_id` → Partie concernée
  - `player_id` → Joueur concerné
  - `final_score` → Score final
  - `final_position` → Position finale (1er, 2ème, etc.)
  - `coins_gained` → Coins gagnés
  - `xp_gained` → XP gagnée
  - `completed_at` → Date de fin
- **Éléments frontend connectés**:
  - Dashboard : historique des parties
  - Game : écran de fin de partie
- **RLS**: ❌ À configurer

### 11. **Table `shop_items`**
```sql
CREATE TABLE shop_items (
  id text PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL,
  emoji text,
  description text,
  price integer NOT NULL,
  rarity text DEFAULT 'common'
);
```
- **Colonnes et connexions frontend**:
  - `id` → ID unique de l'item
  - `name` → Nom affiché (Shop)
  - `type` → 'avatar', 'title', 'effect'
  - `emoji` → Emoji/icône
  - `description` → Description (Shop)
  - `price` → Prix en coins (Shop)
  - `rarity` → Rareté (couleur, tri)
- **Éléments frontend connectés**:
  - Shop : catalogue d'items
- **RLS**: ❌ À configurer (lecture publique)

### 12. **Table `user_purchases`**
```sql
CREATE TABLE user_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  item_id text REFERENCES shop_items(id),
  price integer NOT NULL,
  purchased_at timestamp DEFAULT now()
);
```
- **Colonnes et connexions frontend**:
  - `id` → ID unique de l'achat
  - `user_id` → Acheteur
  - `item_id` → Item acheté
  - `price` → Prix payé
  - `purchased_at` → Date d'achat
- **Éléments frontend connectés**:
  - Shop : items possédés
  - Profile : items équipés
- **RLS**: ❌ À configurer

### 13. **Table `achievements`**
```sql
CREATE TABLE achievements (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  emoji text,
  rarity text DEFAULT 'common'
);
```
- **Colonnes et connexions frontend**:
  - `id` → ID unique de l'achievement
  - `name` → Nom affiché
  - `description` → Description
  - `emoji` → Emoji/icône
  - `rarity` → Rareté
- **Éléments frontend connectés**:
  - Dashboard : liste des achievements
  - Notifications : achievements débloqués
- **RLS**: ❌ À configurer (lecture publique)

---

## 🔐 État des politiques RLS

### ✅ **Tables sécurisées**:
- `game_players` → Accès propriétaire uniquement
- `games` → Lecture participants, écriture hôte
- `profiles` → Lecture publique, écriture propriétaire
- `user_stats` → Accès propriétaire uniquement
- `rounds` → Lecture participants
- `answers` → Lecture participants, écriture auteur
- `votes` → Lecture participants, écriture auteur

### ❌ **Tables à sécuriser**:
- `game_history` → RLS à implémenter
- `shop_items` → Lecture publique à configurer
- `user_purchases` → Accès propriétaire uniquement
- `achievements` → Lecture publique à configurer

---

## 🔄 Fonctions et triggers

### ✅ **Fonctions SECURITY DEFINER créées**:
- `can_access_game_player(uuid)` → Vérification propriétaire
- `can_access_game(uuid)` → Vérification participation
- `is_game_host(uuid)` → Vérification hôte

### ✅ **Triggers configurés**:
- `handle_new_user()` → Création automatique du profil
- `handle_new_user_stats()` → Création automatique des stats

---

## 🚨 Points critiques

### 1. **RLS manquant**:
- Tables du shop et achievements
- Historique des parties

### 2. **Index à optimiser**:
- `games.code` pour les recherches rapides
- `game_players(game_id, user_id)` composite
- `answers.round_id` et `votes.round_id`

### 3. **Contraintes manquantes**:
- Validation des types de vote
- Validation des phases de jeu
- Validation des statuts

---

## ✅ Prochaines étapes

1. **Compléter les politiques RLS** manquantes
2. **Ajouter les index** de performance
3. **Implémenter les contraintes** de validation
4. **Tester les permissions** sur chaque table
5. **Optimiser les requêtes** complexes
