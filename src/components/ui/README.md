[English](README.md) · [Español](README.es-ES.md) · [Français](README.fr-FR.md)

# UI Components

The components in this directory come from [shadcn/ui](https://ui.shadcn.com/). They are low-level building blocks for creating user interfaces, including:

- Badges
- Buttons
- Cards
- Dialogs
- Forms Inputs
- Navigation MMenus
- Tables
- Tabs
- Tooltips
- And more...

These components are built on top of [Base UI](https://base-ui.com/) and styled using [Tailwind CSS](https://tailwindcss.com/). The chat primitives are:

- `MessageScroller` for anchored, streaming transcript scrolling
- `Message` and `Bubble` for message rows and visible surfaces
- `Marker` for status, system, and separator rows
- `Attachment` for files and image attachments
- `Questionnaire` for guided multi-step prompts

## Documentation

You can find the documentation for these components on the [shadcn/ui website](https://ui.shadcn.com/docs).

## Customization

In Atomic CRM, these components are sometimes slightly modified to fit the look and feel of the application. You can customize them further by editing the source files in this directory.

## Updates

Shadcn/ui components are actively maintained and updated. To add or update a UI component in Atomic CRM, type the following command:

```
pnpm dlx shadcn@latest add [component-name]
```

The project uses the Base UI shadcn registry configuration in `components.json`. Review generated files for local aliases and existing component customizations before accepting updates. The Copilot workspace is the canonical consumer for the chat primitives, while `NoteAttachments` is the canonical consumer for `Attachment`.

The admin components have a dependency on some ui components, so if you update the admin components, this will also update the ui components. Check [the admin components readme](../admin/Readme.md) for the command to update them.
