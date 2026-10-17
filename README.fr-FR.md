[English](README.md) · [Español](README.es-ES.md) · [Français](README.fr-FR.md)

# Atomic CRM

Un CRM complet développé avec React, shadcn-admin-kit et Supabase.

<https://github.com/user-attachments/assets/0d7554b5-49ef-41c6-bcc9-a76214fc5c99>

Atomic CRM est gratuit et open source. Vous pouvez l'essayer en ligne sur <https://marmelab.com/atomic-crm-demo>.

## Fonctionnalités

- 📇 **Organisez vos contacts** : Retrouvez tous vos contacts dans un espace facile d'accès.
- ⏰ **Créez des tâches et définissez des rappels** : Gardez le suivi des relances et des échéances.
- 📝 **Prenez des notes** : Consignez facilement les détails et les informations importantes.
- ✉️ **Enregistrez les e-mails** : Mettez Atomic CRM en copie (CC) pour enregistrer automatiquement les échanges sous forme de notes.
- 📊 **Gérez les opportunités** : Visualisez et suivez votre pipeline commercial dans un tableau Kanban.
- 🔄 **Importez et exportez des données** : Transférez facilement vos contacts vers le système et depuis celui-ci.
- 🔐 **Contrôlez les accès** : Connectez-vous avec Google, Azure, Keycloak ou Auth0.
- 📜 **Consultez l'historique d'activité** : Retrouvez toutes les interactions dans des journaux d'activité regroupés.
- 🔗 **Intégrez l'API** : Connectez facilement le système à d'autres services grâce à notre API.
- 🛠️ **Personnalisez l'ensemble** : Ajoutez des champs personnalisés, changez de thème et remplacez n'importe quel composant selon vos besoins.

## Installation

Pour exécuter ce projet sur votre ordinateur, vous devez installer les outils suivants :

- Make
- Node 22 LTS
- Docker (requis par Supabase)

Créez un *fork* du dépôt [`marmelab/atomic-crm`](https://github.com/marmelab/atomic-crm) dans votre compte ou organisation, puis clonez-le sur votre ordinateur :

```sh
git clone https://github.com/[username]/atomic-crm.git
```

Installez les dépendances :

```sh
cd atomic-crm
make install
```

Cette commande installe les dépendances du frontend et du backend, ainsi qu'une instance locale de Supabase.

Une fois l'application configurée, démarrez-la localement avec :

```sh
make start
```

Le serveur de développement Vite du frontend, l'instance locale de Supabase pour l'API et une base PostgreSQL démarrent (grâce à Docker).

Ouvrez l'application à l'adresse [http://localhost:5173/](http://localhost:5173/). Vous serez invité à créer le premier utilisateur.

Pour déboguer le backend, vous pouvez accéder aux services suivants :

- Tableau de bord Supabase : [http://localhost:54323/](http://localhost:54323/)
- API REST : [http://127.0.0.1:54321](http://127.0.0.1:54321)
- Stockage des pièces jointes : [http://localhost:54323/project/default/storage/buckets/attachments](http://localhost:54323/project/default/storage/buckets/attachments)
- Service de test des e-mails Inbucket : [http://localhost:54324/](http://localhost:54324/)

## Assistant CopilotKit

L'assistant CopilotKit intégré est réparti entre trois services (voir `render.yaml`) :

- `atomic-crm-app` : le frontend statique (ce dépôt).
- `atomic-crm-copilot` : le runtime CopilotKit (serveur Hono dans `server/`).
- `atomic-crm-mcp` : l'analyseur de contrats MCP (également dans `server/mcp/`).

Deux variables d'environnement relient le frontend au runtime :

- `VITE_COPILOTKIT_RUNTIME_URL` : URL de base de l'endpoint de chat CopilotKit (par exemple, `https://atomic-crm-copilot.onrender.com/api/copilotkit`). Elle est lue lors de la compilation.
- `VITE_COPILOTKIT_API_URL` : URL de base des endpoints REST du runtime utilisés par les outils du frontend (`/api/contacts`, `/api/leads/top`, etc.). Elle est lue lors de la compilation.

### Développement local

Démarrez toute la pile locale (frontend, runtime Copilot et MCP). Un fournisseur de LLM doit être configuré dans `server/.env` :

```sh
pnpm run dev:all
```

Vous pouvez aussi démarrer uniquement le frontend contre le backend CopilotKit déployé (aucun serveur local n'est nécessaire) :

```sh
VITE_COPILOTKIT_API_URL=http://localhost:5173 \
COPILOTKIT_PROXY_TARGET=https://atomic-crm-copilot.onrender.com \
  pnpm run dev:demo
```

Le serveur de développement Vite redirige `/api/*` vers `COPILOTKIT_PROXY_TARGET`, afin que les appels des outils et le chat utilisent la même origine, sans configuration CORS.

## Documentation

La documentation destinée aux utilisateurs et aux développeurs est disponible dans le [répertoire `doc/`](./doc/). Vous pouvez également la consulter en ligne sur [https://marmelab.com/atomic-crm/doc/](https://marmelab.com/atomic-crm/doc/).

## Tests

Ce projet contient des tests unitaires exécutés avec Vitest. Lancez-les avec :

```sh
make test
```

Vous pouvez ajouter des tests unitaires n'importe où dans `src`. Les fichiers de test doivent s'appeler `*.test.tsx` ou `*.test.ts`.

## Registre de composants

Les composants Atomic CRM sont publiés dans un registre Shadcn :

- Le fichier `registry.json` est généré automatiquement par `scripts/generate-registry.mjs`, configuré comme *hook* de *pre-commit*.
- Le fichier `http://marmelab.com/atomic-crm/r/atomic-crm.json` est publié automatiquement par le pipeline CI/CD.

> [!WARNING]
> Si des modifications sont absentes de `registry.json`, vous DEVEZ mettre à jour `scripts/generate-registry.mjs` pour les inclure.

## Licence

Ce projet est distribué sous licence MIT, avec l'aimable autorisation de [Marmelab](https://marmelab.com). Consultez le fichier [LICENSE.md](./LICENSE.md) pour plus de détails.
