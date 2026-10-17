[English](README.md) · [Español](README.es-ES.md) · [Français](README.fr-FR.md)

# Kit de démarrage Starlight : notions de base

[![Créé avec Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)

```sh
npm create astro@latest -- --template starlight
```

> 🧑‍🚀 **Vous connaissez déjà Astro ?** Vous pouvez supprimer ce fichier. Bonne continuation !

## 🚀 Structure du projet

Votre projet Astro + Starlight contient les dossiers et fichiers suivants :

```
.
├── public/
├── src/
│   ├── assets/
│   ├── content/
│   │   └── docs/
│   └── content.config.ts
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

Starlight recherche les fichiers `.md` ou `.mdx` dans le répertoire `src/content/docs/`. Chaque fichier est publié à une URL dérivée de son nom.

Vous pouvez ajouter des images dans `src/assets/` et les intégrer au Markdown avec un lien relatif.

Les ressources statiques, comme les favicons, peuvent être placées dans le répertoire `public/`.

## 🧞 Commandes

Exécutez toutes les commandes depuis la racine du projet, dans un terminal :

| Commande | Action |
| :-- | :-- |
| `npm install` | Installe les dépendances |
| `npm run dev` | Démarre le serveur local à `localhost:4321` |
| `npm run build` | Génère le site de production dans `./dist/` |
| `npm run preview` | Prévisualise localement le site généré avant son déploiement |
| `npm run astro ...` | Lance des commandes CLI telles que `astro add` ou `astro check` |
| `npm run astro -- --help` | Affiche l'aide de la CLI Astro |

## 👀 Pour en savoir plus

Consultez la [documentation Starlight](https://starlight.astro.build/), la [documentation Astro](https://docs.astro.build) ou le [serveur Discord Astro](https://astro.build/chat).
