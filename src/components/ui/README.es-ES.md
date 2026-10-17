[English](README.md) · [Español](README.es-ES.md) · [Français](README.fr-FR.md)

# Componentes de interfaz de usuario

Los componentes de este directorio proceden de [shadcn/ui](https://ui.shadcn.com/). Son elementos básicos de bajo nivel para crear interfaces de usuario, entre ellos:

- insignias,
- botones,
- tarjetas,
- diálogos,
- campos de formulario,
- menús de navegación,
- tablas,
- pestañas,
- información emergente,
- y otros.

Estos componentes se basan en [Radix UI](https://www.radix-ui.com/) y usan estilos de [Tailwind CSS](https://tailwindcss.com/).

## Documentación

Puedes consultar la documentación en el [sitio web de shadcn/ui](https://ui.shadcn.com/docs).

## Personalización

En Atomic CRM, algunos componentes se modifican ligeramente para adaptarse al aspecto y estilo de la aplicación. Puedes personalizarlos editando los archivos fuente de este directorio.

## Actualizaciones

Los componentes de shadcn/ui se mantienen y actualizan con regularidad. Para añadir o actualizar un componente de interfaz en Atomic CRM, ejecuta:

```
npx shadcn@latest add [component-name]
```

Los componentes de administración dependen de algunos componentes de interfaz, por lo que al actualizarlos también se actualizarán estos componentes. Consulta el [README de los componentes de administración](../admin/Readme.md) para ver el comando correspondiente.
