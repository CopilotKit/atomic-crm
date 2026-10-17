[English](README.md) · [Español](README.es-ES.md) · [Français](README.fr-FR.md)

# Documentación de Atomic CRM

Este directorio contiene el sitio de documentación —basado en Astro/Starlight— para Atomic CRM. La documentación publicada abarca los flujos de trabajo del usuario final, proveedores, autenticación, despliegue, personalización, la API, el correo electrónico entrante y el servidor MCP.


## Estructura

```text
doc/
├── src/content/docs/       # User and developer MDX documentation
├── src/content/images/     # Documentation images
├── public/                 # Static assets and logos
├── astro.config.mjs
└── package.json
```


## Comandos locales

Ejecuta estos comandos desde la raíz del repositorio:

```bash
make doc-install            # Install documentation dependencies
make doc                    # Start Astro at localhost:4321
make doc-build              # Build the documentation site
make doc-preview            # Preview the production build
```

La documentación se despliega de forma independiente al frontend del CRM. Al añadir una funcionalidad, actualiza la página correspondiente en `doc/src/content/docs/` y asegúrate de que los enlaces y las capturas de pantalla sean coherentes con el comportamiento actual de la aplicación.
