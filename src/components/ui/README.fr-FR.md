[English](README.md) · [Español](README.es-ES.md) · [Français](README.fr-FR.md)

# Composants d'interface utilisateur

Les composants de ce répertoire proviennent de [shadcn/ui](https://ui.shadcn.com/). Ce sont des éléments de base de bas niveau qui permettent de créer des interfaces utilisateur, notamment :

- badges,
- boutons,
- cartes,
- boîtes de dialogue,
- champs de formulaire,
- menus de navigation,
- tableaux,
- onglets,
- info-bulles,
- et bien d'autres.

Ces composants reposent sur [Radix UI](https://www.radix-ui.com/) et utilisent [Tailwind CSS](https://tailwindcss.com/) pour leur style.

## Documentation

La documentation est disponible sur le [site de shadcn/ui](https://ui.shadcn.com/docs).

## Personnalisation

Dans Atomic CRM, certains composants sont légèrement modifiés pour s'intégrer à l'apparence de l'application. Vous pouvez les personnaliser en modifiant les fichiers source de ce répertoire.

## Mises à jour

Les composants shadcn/ui sont maintenus et mis à jour régulièrement. Pour ajouter ou mettre à jour un composant d'interface dans Atomic CRM, exécutez :

```
npx shadcn@latest add [component-name]
```

Certains composants d'interface sont utilisés par les composants d'administration. Leur mise à jour entraîne donc également celle des composants d'interface. Consultez le [README des composants d'administration](../admin/Readme.md) pour connaître la commande à utiliser.
