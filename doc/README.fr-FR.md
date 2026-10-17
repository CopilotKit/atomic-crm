[English](README.md) · [Español](README.es-ES.md) · [Français](README.fr-FR.md)

# Documentation Atomic CRM

Ce répertoire contient le site de documentation Astro/Starlight pour Atomic CRM. La documentation publiée couvre les flux de travail des utilisateurs finaux, les fournisseurs, l'authentification, le déploiement, la personnalisation, l'API, le courrier électronique entrant et le serveur MCP.

## Structure

```text
doc/
├── src/content/docs/       # User and developer MDX documentation
├── src/content/images/     # Documentation images
├── public/                 # Static assets and logos
├── astro.config.mjs
└── package.json
```


## Commandes locales

Exécutez ces commandes depuis la racine du référentiel :

```bash
make doc-install            # Install documentation dependencies
make doc                    # Start Astro at localhost:4321
make doc-build              # Build the documentation site
make doc-preview            # Preview the production build
```

La documentation est déployée séparément de l'interface CRM. Lors de l'ajout d'une fonctionnalité, mettez à jour la page correspondante sous `doc/src/content/docs/` et conservez les liens et les captures d'écran cohérents avec le comportement actuel de l'application.
