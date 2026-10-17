[English](README.md) · [Español](README.es-ES.md) · [Français](README.fr-FR.md)

# Kit de inicio de Starlight: conceptos básicos

[![Creado con Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)

```sh
npm create astro@latest -- --template starlight
```

> 🧑‍🚀 **¿Ya tienes experiencia con Astro?** Puedes eliminar este archivo. ¡Que lo disfrutes!

## 🚀 Estructura del proyecto

Dentro de tu proyecto de Astro + Starlight encontrarás estas carpetas y archivos:

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

Starlight busca archivos `.md` o `.mdx` en el directorio `src/content/docs/`. Cada archivo se publica como una ruta basada en su nombre.

Puedes añadir imágenes en `src/assets/` e insertarlas en Markdown mediante un enlace relativo.

Los recursos estáticos, como los iconos de página, se pueden guardar en el directorio `public/`.

## 🧞 Comandos

Ejecuta todos los comandos desde la raíz del proyecto, en una terminal:

| Comando | Acción |
| :-- | :-- |
| `npm install` | Instala las dependencias |
| `npm run dev` | Inicia el servidor local en `localhost:4321` |
| `npm run build` | Compila el sitio para producción en `./dist/` |
| `npm run preview` | Previsualiza localmente el sitio compilado antes de desplegarlo |
| `npm run astro ...` | Ejecuta comandos de CLI, como `astro add` y `astro check` |
| `npm run astro -- --help` | Muestra la ayuda de la CLI de Astro |

## 👀 Más información

Consulta la [documentación de Starlight](https://starlight.astro.build/), la [documentación de Astro](https://docs.astro.build) o el [servidor de Discord de Astro](https://astro.build/chat).
