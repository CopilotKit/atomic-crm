[English](Readme.md) · [Español](Readme.es-ES.md) · [Français](Readme.fr-FR.md)

# Composants d’administration

Les composants de ce répertoire proviennent de [Shadcn Admin Kit](https://marmelab.com/shadcn-admin-kit/). Ils servent de briques fonctionnelles pour répondre aux besoins courants des applications monopages, notamment :

- récupération des données ;
- listes et tableaux de données ;
- formulaires et validation ;
- authentification ;
- recherche et filtrage ;
- internationalisation (i18n) ;
- thèmes ;
- gestion des chargements et des erreurs ;
- génération rapide d’opérations CRUD ;
- gestion des relations ;
- rôles et autorisations ;
- interface optimiste ;
- annulation d’actions ;
- actions groupées ;
- préférences utilisateur ;
- notifications ;
- et bien d’autres fonctions.

Ces composants reposent sur [TanStack Query](https://tanstack.com/query/latest), [React Hook Form](https://react-hook-form.com/), [React Router](https://reactrouter.com/), [ra-core](https://marmelab.com/ra-core/), [Base UI](https://base-ui.com/) et [Shadcn UI](https://ui.shadcn.com/).

## Documentation

La documentation de ces composants est disponible sur le [site de Shadcn Admin Kit](https://marmelab.com/shadcn-admin-kit/docs).

## Personnalisation

Dans Atomic CRM, certains composants sont légèrement modifiés pour s’intégrer à l’apparence et au style de l’application. Vous pouvez les adapter davantage en modifiant les fichiers source de ce répertoire.

## Mises à jour

Les composants de Shadcn Admin Kit sont maintenus et mis à jour régulièrement. Pour les mettre à jour dans Atomic CRM, exécutez la commande suivante :

```
npx shadcn@latest add -o https://marmelab.com/shadcn-admin-kit/r/admin.json
```
