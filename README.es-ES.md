[English](README.md) · [Español](README.es-ES.md) · [Français](README.fr-FR.md)

# Atomic CRM

Un CRM completo creado con React, shadcn-admin-kit y Supabase.

<https://github.com/user-attachments/assets/0d7554b5-49ef-41c6-bcc9-a76214fc5c99>

Atomic CRM es gratuito y de código abierto. Puedes probarlo en línea en <https://marmelab.com/atomic-crm-demo>.

## Funcionalidades

- 📇 **Organiza tus contactos**: Mantén todos tus contactos en un lugar de fácil acceso.
- ⏰ **Crea tareas y configura recordatorios**: No pierdas de vista ningún seguimiento ni fecha límite.
- 📝 **Toma notas**: Registra con facilidad los detalles y la información importante.
- ✉️ **Captura correos electrónicos**: Añade Atomic CRM en copia (CC) para guardar automáticamente las comunicaciones como notas.
- 📊 **Gestiona oportunidades**: Visualiza y sigue tu embudo de ventas en un tablero Kanban.
- 🔄 **Importa y exporta datos**: Transfiere contactos dentro y fuera del sistema con facilidad.
- 🔐 **Controla el acceso**: Inicia sesión con Google, Azure, Keycloak o Auth0.
- 📜 **Consulta la actividad**: Revisa todas las interacciones en registros de actividad consolidados.
- 🔗 **Integra mediante la API**: Conecta fácilmente el sistema con otros servicios usando nuestra API.
- 🛠️ **Personaliza todo**: Añade campos personalizados, cambia el tema y reemplaza cualquier componente para adaptarlo a tus necesidades.

## Instalación

Para ejecutar este proyecto en tu equipo, necesitas tener instaladas estas herramientas:

- Make
- Node 22 LTS
- Docker (necesario para Supabase)

Haz un *fork* del repositorio [`marmelab/atomic-crm`](https://github.com/marmelab/atomic-crm) en tu cuenta u organización y clónalo en tu equipo:

```sh
git clone https://github.com/[username]/atomic-crm.git
```

Instala las dependencias:

```sh
cd atomic-crm
make install
```

Esto instalará las dependencias del frontend y del backend, incluida una instancia local de Supabase.

Cuando la aplicación esté configurada, iníciala localmente con:

```sh
make start
```

Se iniciarán el servidor de desarrollo Vite para el frontend, la instancia local de Supabase para la API y una base de datos PostgreSQL (mediante Docker).

Abre la aplicación en [http://localhost:5173/](http://localhost:5173/). Se te pedirá que crees el primer usuario.

Para depurar el backend, puedes acceder a estos servicios:

- Panel de Supabase: [http://localhost:54323/](http://localhost:54323/)
- API REST: [http://127.0.0.1:54321](http://127.0.0.1:54321)
- Almacenamiento de archivos adjuntos: [http://localhost:54323/project/default/storage/buckets/attachments](http://localhost:54323/project/default/storage/buckets/attachments)
- Servicio de correo de prueba Inbucket: [http://localhost:54324/](http://localhost:54324/)

## Asistente de CopilotKit

El asistente de CopilotKit integrado se distribuye en tres servicios (consulta `render.yaml`):

- `atomic-crm-app`: el frontend estático (este repositorio).
- `atomic-crm-copilot`: el runtime de CopilotKit (servidor Hono en `server/`).
- `atomic-crm-mcp`: el analizador de contratos MCP (también en `server/mcp/`).

Dos variables de entorno conectan el frontend con el runtime:

- `VITE_COPILOTKIT_RUNTIME_URL`: URL base del endpoint de chat de CopilotKit (por ejemplo, `https://atomic-crm-copilot.onrender.com/api/copilotkit`). Se lee durante la compilación.
- `VITE_COPILOTKIT_API_URL`: URL base de los endpoints REST del runtime que usan las herramientas del frontend (`/api/contacts`, `/api/leads/top`, etc.). Se lee durante la compilación.

### Flujos de desarrollo local

Inicia toda la pila local (frontend, runtime de Copilot y MCP); necesitas configurar un proveedor de LLM en `server/.env`:

```sh
npm run dev:all
```

O ejecuta solo el frontend contra el backend de CopilotKit ya desplegado (no hace falta iniciar un servidor local):

```sh
VITE_COPILOTKIT_API_URL=http://localhost:5173 \
COPILOTKIT_PROXY_TARGET=https://atomic-crm-copilot.onrender.com \
  npm run dev:demo
```

El servidor de desarrollo de Vite redirige `/api/*` a `COPILOTKIT_PROXY_TARGET`, de modo que las llamadas a las herramientas y el chat usan el mismo origen y no necesitan CORS.

## Documentación

La documentación para usuarios y desarrolladores está disponible en el [directorio `doc/`](./doc/). También puedes consultarla en línea en [https://marmelab.com/atomic-crm/doc/](https://marmelab.com/atomic-crm/doc/).

## Pruebas

Este proyecto incluye pruebas unitarias con Vitest. Ejecútalas con:

```sh
make test
```

Puedes añadir pruebas unitarias en cualquier parte de `src`. Los archivos de prueba deben llamarse `*.test.tsx` o `*.test.ts`.

## Registro de componentes

Los componentes de Atomic CRM se publican como un registro de Shadcn:

- El archivo `registry.json` se genera automáticamente mediante `scripts/generate-registry.mjs` como *hook* de *pre-commit*.
- El archivo `http://marmelab.com/atomic-crm/r/atomic-crm.json` se publica automáticamente mediante el flujo de CI/CD.

> [!WARNING]
> Si faltan algunos de tus cambios en `registry.json`, DEBES actualizar `scripts/generate-registry.mjs` para incluirlos.

## Licencia

Este proyecto está disponible bajo la licencia MIT, gracias a [Marmelab](https://marmelab.com). Consulta el archivo [LICENSE.md](./LICENSE.md) para obtener más información.
