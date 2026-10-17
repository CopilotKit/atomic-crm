[English](Readme.md) · [Español](Readme.es-ES.md) · [Français](Readme.fr-FR.md)

# Componentes de administración

Los componentes de este directorio proceden de [Shadcn Admin Kit](https://marmelab.com/shadcn-admin-kit/). Son bloques funcionales que resuelven necesidades habituales de las aplicaciones de una sola página, entre ellas:

- obtención de datos,
- listas y tablas de datos,
- formularios y validación,
- autenticación,
- búsqueda y filtrado,
- internacionalización (i18n),
- temas,
- gestión de carga y errores,
- generación rápida de operaciones CRUD,
- gestión de relaciones,
- roles y permisos,
- interfaz optimista,
- posibilidad de deshacer acciones,
- acciones en lote,
- preferencias de usuario,
- notificaciones,
- entre otras.

Estos componentes se basan en [TanStack Query](https://tanstack.com/query/latest), [React Hook Form](https://react-hook-form.com/), [React Router](https://reactrouter.com/), [ra-core](https://marmelab.com/ra-core/), [Radix UI](https://www.radix-ui.com/) y [Shadcn UI](https://ui.shadcn.com/).

## Documentación

Puedes consultar la documentación en el [sitio web de Shadcn Admin Kit](https://marmelab.com/shadcn-admin-kit/docs).

## Personalización

En Atomic CRM, algunos componentes se modifican ligeramente para adaptarse al aspecto y estilo de la aplicación. Puedes personalizarlos editando los archivos fuente de este directorio.

## Actualizaciones

Los componentes de Shadcn Admin Kit se mantienen y actualizan con regularidad. Para actualizarlos en Atomic CRM, ejecuta este comando:

```
npx shadcn@latest add -o https://marmelab.com/shadcn-admin-kit/r/admin.json
```
