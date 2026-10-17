[English](README.md) · [Español](README.es-ES.md) · [Français](README.fr-FR.md)

# Componentes de interfaz de usuario (UI)

Los componentes en este directorio provienen de [shadcn/ui](https://ui.shadcn.com/). Se trata de elementos básicos de bajo nivel para la creación de interfaces de usuario, que incluyen:

- Etiquetas (badges)
- Botones
- Tarjetas (cards)
- Diálogos
- Entradas de formulario
- Menús de navegación
- Tablas
- Pestañas (tabs)
- Información emergente (tooltips)
- Y más...

Estos componentes están construidos sobre [Base UI](https://base-ui.com/) y estilizados mediante [Tailwind CSS](https://tailwindcss.com/). Los elementos primitivos para el chat son:

- `MessageScroller` para el desplazamiento (scroll) de transcripciones en streaming con anclaje
- `Message` y `Bubble` para filas de mensajes y superficies visibles
- `Marker` para filas de estado, sistema y separadores
- `Attachment` para archivos e imágenes adjuntos
- `Questionnaire` para prompts guiados de varios pasos


## Documentación

Puedes encontrar la documentación de estos componentes en el [sitio web de shadcn/ui](https://ui.shadcn.com/docs).


## Personalización

En Atomic CRM, estos componentes a veces se modifican ligeramente para adaptarse a la estética y el estilo de la aplicación. Puedes personalizarlos aún más editando los archivos fuente en este directorio.


## Actualizaciones

Los componentes de shadcn/ui reciben mantenimiento y actualizaciones de forma activa. Para añadir o actualizar un componente de la interfaz de usuario (UI) en Atomic CRM, introduce el siguiente comando:

```
pnpm dlx shadcn@latest add [component-name]
```

El proyecto utiliza la configuración del registro Base UI shadcn en `components.json`. Antes de aceptar actualizaciones, revisa los archivos generados para comprobar si existen alias locales o personalizaciones previas en los componentes. El espacio de trabajo de Copilot es el consumidor principal de los elementos básicos (primitives) de chat, mientras que `NoteAttachments` es el consumidor principal de `Attachment`.

Los componentes de administración dependen de ciertos componentes de la interfaz de usuario; por lo tanto, al actualizar los componentes de administración, también se actualizarán los componentes de la interfaz de usuario. Consulta el archivo README de los componentes de administración ([../admin/Readme.md](../admin/Readme.md)) para conocer el comando necesario para realizar dicha actualización.
