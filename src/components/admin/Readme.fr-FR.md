[English](Readme.md) · [Español](Readme.es-ES.md) · [Français](Readme.fr-FR.md)

# Composants d'administration

Les composants de ce répertoire proviennent de [Shadcn Admin Kit](https://marmelab.com/shadcn-admin-kit/). Ce sont des briques fonctionnelles qui répondent aux besoins courants des applications monopages, notamment :

- récupération des données,
- listes et tableaux de données,
- formulaires et validation,
- authentification,
- recherche et filtrage,
- internationalisation (i18n),
- thèmes,
- gestion des chargements et des erreurs,
- génération rapide d'opérations CRUD,
- gestion des relations,
- rôles et autorisations,
- interface optimiste,
- annulation des actions,
- actions groupées,
- préférences utilisateur,
- notifications,
- et bien d'autres fonctions.

Ces composants reposent sur [TanStack Query](https://tanstack.com/query/latest), [React Hook Form](https://react-hook-form.com/), [React Router](https://reactrouter.com/), [ra-core](https://marmelab.com/ra-core/), [Radix UI](https://www.radix-ui.com/) et [Shadcn UI](https://ui.shadcn.com/).

## Documentation

La documentation est disponible sur le [site de Shadcn Admin Kit](https://marmelab.com/shadcn-admin-kit/docs).

## Personnalisation

Dans Atomic CRM, certains composants sont légèrement modifiés pour s'intégrer à l'apparence de l'application. Vous pouvez les personnaliser en modifiant les fichiers source de ce répertoire.

## Mises à jour

Les composants de Shadcn Admin Kit sont maintenus et mis à jour régulièrement. Pour les mettre à jour dans Atomic CRM, exécutez cette commande :

```
npx shadcn@latest add -o https://marmelab.com/shadcn-admin-kit/r/admin.json
```
