[English](README.md) · [Español](README.es-ES.md) · [Français](README.fr-FR.md)

# Atomic CRM

Un CRM complet construit avec React, Vite+, shadcn-admin-kit/Base UI et un backend natif Cloudflare.

<https://github.com/user-attachments/assets/0d7554b5-49ef-41c6-bcc9-a76214fc5c99>

Atomic CRM est gratuit et open source. Vous pouvez le tester en ligne sur <https://marmelab.com/atomic-crm-demo>.


## Fonctionnalités

- 📇 **Organiser les contacts** : conservez tous vos contacts dans un seul endroit facilement accessible.
- ⏰ **Créez des tâches et définissez des rappels** : ne manquez jamais un suivi ou une date limite.
- 📝 **Prendre des notes** : capturez des détails et des informations importants sans effort.
- ✉️ **Capturer les e-mails** : CC Atomic CRM pour enregistrer automatiquement les communications sous forme de notes.
- 📊 **Gérer les transactions** : visualisez et suivez votre pipeline de ventes dans un tableau Kanban.
- 🔄 **Importer et exporter des données** : transférez facilement des contacts vers et hors du système.
- 🔐 **Contrôler l'accès** : Connectez-vous avec Google, Azure, Keycloak et Auth0.
- 📜 **Suivre l'historique des activités** : affichez toutes les interactions dans les journaux d'activité agrégés.
- 🔗 **Intégrer via API** : Connectez-vous de manière transparente à d'autres systèmes à l'aide de notre API.
- 🛠️ **Tout personnaliser** : ajoutez des champs personnalisés, modifiez le thème et remplacez n'importe quel composant pour répondre à vos besoins.


## Installation et développement local

Pour exécuter ce projet localement, vous aurez besoin des outils suivants installés sur votre ordinateur :

- Faire
- Node 22 LTS
- Docker (facultatif ; nécessaire uniquement pour les outils locaux non liés)

Forkez le référentiel [`marmelab/atomic-crm`](https://github.com/marmelab/atomic-crm) vers votre utilisateur/organisation, puis clonez-le localement :

```sh
git clone https://github.com/[username]/atomic-crm.git
```

Installer les dépendances avec Vite+ :

```sh
cd atomic-crm
make install
```

Cela installera les dépendances pour le frontend et le backend, pour Cloudflare Worker et le D1 local.

Démarrez localement l'application basée sur Cloudflare :

```sh
make start
```

Cela démarre l'interface Vite et Cloudflare Worker contre le D1 local.

Vous pouvez ensuite accéder à l'application via [http://localhost:5173/](http://localhost:5173/). Vous serez invité à créer le premier utilisateur.

Pour le fournisseur de démonstration, utilisez `vp run dev:demo`. Pour exécuter ensemble l'interface native Cloudflare, Worker et le serveur MCP, utilisez `vp run dev:all` ou `vp run dev:cloudflare`. Cloudflare D1 et Better Auth sont le seul backend d'application ; FakeRest est disponible pour les démos.

Si vous avez besoin de déboguer le backend, vous pouvez accéder aux services suivants :

- Travailleur Cloudflare : [http://localhost:8787/](http://localhost:8787/)
- API REST : [http://127.0.0.1:54321](http://127.0.0.1:54321)
- Les pièces jointes R2 locales sont gérées par le runtime Worker local de Wrangler.
- Le courrier électronique entrant local utilise le gestionnaire Worker `email()` ; itinéraires d'étape
`crm@atomic-crm.asomba.com` via le routage des e-mails Cloudflare.


## Assistant CopilotKit

L'assistant CopilotKit intégré à l'application utilise le runtime Cloudflare Worker lors de la préparation et
production, le runtime Node étant conservé uniquement pour la restauration locale et MCP
développement :

- `atomic-crm-app` — l'interface statique (ce dépôt)
- `atomic-crm-copilot` — le runtime CopilotKit local/rollback (serveur Hono dans `server/`)
- `atomic-crm-mcp` — l'analyseur de contrat MCP (également dans `server/mcp/`)

L'interface utilisateur de chat utilise les primitives de l'interface utilisateur de base shadcn pour les lignes de messages, les bulles, les marqueurs de streaming, le défilement de transcription ancré, les pièces jointes et les briefs Copilot guidés.

Les outils Copilot communiquent avec les mêmes API CRM authentifiées que le reste de l'application
(D1 sur Cloudflare, FakeRest en démo). `VITE_COPILOTKIT_API_URL` est facultatif et
n'est pas nécessaire en mode Cloudflare.

- `VITE_COPILOTKIT_RUNTIME_URL` — point de terminaison CopilotKit alternatif en option. Laissez cette option non définie pour utiliser la route Worker de même origine, `/api/copilotkit`.


### Workflows de développement locaux

La pile locale par défaut est l'interface Vite plus Cloudflare Worker :

```sh
pnpm run d1:migrate:local
vp run dev:cloudflare
```

Configurez `BETTER_AUTH_SECRET` dans `.dev.vars` avant de vous connecter. CopilotKit
s'exécute nativement sur le Worker ; MCP est facultatif :

```sh
vp run dev:all
```

La démo FakeRest dans le navigateur (sans Worker) est :

```sh
vp run dev:demo
```

Le serveur de développement Vite transmet `/api` au travailleur à l'adresse
`http://localhost:8787` (remplacement par `COPILOTKIT_PROXY_TARGET`). Utiliser
`COPILOTKIT_RUNTIME_MODE=proxy` et `make start-server` uniquement pour le Node
exécution de restauration.


### Flux de travail Cloudflare Worker

Le runtime Cloudflare par étapes peut être démarré avec :

```sh
vp run dev:cloudflare
```

Cela exécute ensemble l'interface Vite et Wrangler Worker. Cloudflare D1 et
Une meilleure authentification est sélectionnée automatiquement. Configurez `BETTER_AUTH_SECRET` dans
`.dev.vars` avant d'utiliser l'authentification. Postuler localement
Migrations D1 avec `pnpm run d1:migrate:local`.
Le travailleur de préparation sert CopilotKit de manière native via l'IA TanStack
Usine CopilotKit et sa fixation `AI`. Définissez `CLOUDFLARE_AI_MODEL` si vous avez besoin d'un
différents modèles d'IA pour les travailleurs ; aucun identifiant de compte ou jeton API AI n'est requis. Utiliser
`COPILOTKIT_RUNTIME_MODE=proxy` uniquement pour le chemin de restauration du Node local.
Créez l'interface de préparation avec `vp run build:staging` ; cela sélectionne le
Fournisseurs de données/d'authentification Cloudflare et API Worker de même origine avant le déploiement.


### Acceptation de la mise en scène

Définissez `STAGING_TEST_EMAIL` et `STAGING_TEST_PASSWORD` localement, puis exécutez :

```sh
pnpm run smoke:staging
pnpm run sso:register:staging
```

Le test de fumée authentifié crée et supprime un contact, une note, une tâche et
pièce jointe. Pour les e-mails entrants, envoyez-les depuis une adresse d'utilisateur commercial CRM vers un CRM
contact pendant la mise en CC `crm@atomic-crm.asomba.com` ; le Travailleur associe le
expéditeur avec l'utilisateur commercial et un destinataire To/Cc/Bcc avec le contact.


### Routeur

TanStack Router est l'application canonique et le routeur de test. Ensemble
`VITE_ROUTER=tanstack` pour un test de fumée local explicite ; `vp run build:staging`
l’active automatiquement. URL, chaînes de requête, itinéraires de ressources et ra-core
la récupération des données reste inchangée.

`react-router` et `react-router-dom` restent des dépendances de compatibilité directe
car la version actuelle de `ra-core` importe statiquement son React Router
adaptateur même lorsqu'un fournisseur de routeur personnalisé est configuré. Le CRM n'a pas
application ou test des importations de React Router. Ces packages de compatibilité peuvent
être supprimé après la mise à niveau vers une version `ra-core` qui ne nécessite plus cela
adaptateur.

## Documents

La documentation utilisateur et développeur de ce projet est disponible [dans le répertoire `doc/`](./doc/). Vous pouvez également le lire en ligne sur [https://marmelab.com/atomic-crm/doc/](https://marmelab.com/atomic-crm/doc/).


## Tests et builds

Ce projet contient des tests unitaires et de navigateur Vitest. Exécutez-les avec la commande suivante :

```sh
vp test
```

Utilisez `vp check` pour le formatage, le peluchage et la vérification de type, `make typecheck` pour ignorer le formatage/peluchage et `vp build` pour une version de production. Vous pouvez ajouter des tests n'importe où dans `src` ; utilisez `*.test.tsx` ou `*.test.ts`.


## Diagnostics de build Vite+

Le projet racine utilise Vite+ 0.2.8 pour l'installation, la vérification, les tests, le développement et les versions de production. Les sourcesmaps de production restent activés. Les versions actuelles signalent de gros morceaux d'application, car les définitions de ressources CRM sont enregistrées avec impatience par le shell d'administration ; le morceau d'application principale mesuré est d'environ 2,7 Mo réduit (812 Ko gzip). Cet avertissement est conservé afin que la répartition future au niveau de l'itinéraire soit motivée par une amélioration mesurée de la charge utile plutôt que masquée par une limite d'avertissement plus élevée.

Le post-traitement Tailwind CSS et Vite CSS peut signaler des avertissements `SOURCEMAP_BROKEN`, car ces transformations en amont n'émettent pas de mappages sources. Ces avertissements sont documentés ici et ne sont pas supprimés par la désactivation des sourcesmaps de production.


## Registre

Les composants Atomic CRM sont publiés sous forme de fichier Shadcn Registry :

- Le fichier `registry.json` est automatiquement généré par le script `scripts/generate-registry.mjs` en tant que hook de pré-validation.
- Le fichier `http://marmelab.com/atomic-crm/r/atomic-crm.json` est automatiquement publié par le pipeline CI/CD

> [!AVERTISSEMENT]
> Si le `registry.json` manque certaines modifications que vous avez apportées, vous DEVEZ mettre à jour le `scripts/generate-registry.mjs` pour inclure ces modifications.


## Licence

Ce projet est sous licence MIT, avec l'aimable autorisation de [Marmelab](https://marmelab.com). Voir le fichier [LICENSE.md](./LICENSE.md) pour plus de détails.


### Compatibilité des dépendances

`query-string` 7 reste compatible avec les importations nommées de React-admin. Le suivi
Le patch pnpm adapte son importation de décodeur CommonJS à l'exportation par défaut dans
`decode-uri-component` 0.5, qui corrige le déni de service en cas d'entrée mal formée. Supprimer
ce correctif lors de la mise à niveau de React-admin vers une version prenant en charge la version la plus récente
API de chaîne de requête. Les contrôles d'éligibilité de React Compiler sont signalés sous forme d'avertissements ;
les règles de hook d'exécution et les vérifications de type restent des erreurs. Le compilateur React n'est pas activé.
