[English](README.md) · [Español](README.es-ES.md) · [Français](README.fr-FR.md)

# Composants de l'interface utilisateur

Les composants de ce répertoire proviennent de [shadcn/ui](https://ui.shadcn.com/). Il s'agit d'éléments de base de bas niveau permettant de créer des interfaces utilisateur, notamment :

- Insignes
- Boutons
- Cartes
- Dialogues
- Entrées de formulaires
- Menus de navigation
- Tableaux
- Onglets
- Info-bulles
- Et plus encore...

Ces composants sont construits sur [Base UI](https://base-ui.com/) et stylisés à l'aide de [Tailwind CSS](https://tailwindcss.com/). Les primitives de chat sont :

- `MessageScroller` pour le défilement de transcription en streaming ancré
- `Message` et `Bubble` pour les lignes de messages et les surfaces visibles
- `Marker` pour les lignes d'état, de système et de séparation
- `Attachment` pour les fichiers et les pièces jointes d'images
- `Questionnaire` pour des invites guidées en plusieurs étapes

## Documents

Vous pouvez trouver la documentation de ces composants sur le [site Web shadcn/ui](https://ui.shadcn.com/docs).


## Personnalisation

Dans Atomic CRM, ces composants sont parfois légèrement modifiés pour s'adapter à l'apparence de l'application. Vous pouvez les personnaliser davantage en éditant les fichiers sources dans ce répertoire.


## Mises à jour

Les composants Shadcn/ui sont activement maintenus et mis à jour. Pour ajouter ou mettre à jour un composant d'interface utilisateur dans Atomic CRM, tapez la commande suivante :

```
pnpm dlx shadcn@latest add [component-name]
```

Le projet utilise la configuration du registre shadcn de l'interface utilisateur de base dans `components.json`. Examinez les fichiers générés pour les alias locaux et les personnalisations de composants existants avant d'accepter les mises à jour. L'espace de travail Copilot est le consommateur canonique pour les primitives de discussion, tandis que `NoteAttachments` est le consommateur canonique pour `Attachment`.

Les composants d'administration dépendent de certains composants de l'interface utilisateur, donc si vous mettez à jour les composants d'administration, cela mettra également à jour les composants de l'interface utilisateur. Vérifiez [le fichier readme des composants d'administration](../admin/Readme.md) pour la commande permettant de les mettre à jour.
