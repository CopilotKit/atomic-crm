[English](README.md) · [Español](README.es-ES.md) · [Français](README.fr-FR.md)

# Atomic CRM

Un CRM con todas las funciones, desarrollado con React, Vite+, shadcn-admin-kit/Base UI y un backend nativo de Cloudflare.

<https://github.com/user-attachments/assets/0d7554b5-49ef-41c6-bcc9-a76214fc5c99>

Atomic CRM es gratuito y de código abierto. Puedes probarlo en línea en <https://marmelab.com/atomic-crm-demo>.


## Características

- 📇 **Organiza tus contactos**: Mantén todos tus contactos en un único lugar de fácil acceso.
- ⏰ **Crea tareas y establece recordatorios**: No pierdas de vista ningún seguimiento ni fecha límite.
- 📝 **Toma notas**: Registra detalles e información importante sin esfuerzo.
- ✉️ **Captura correos electrónicos**: Incluye a Atomic CRM en copia (CC) para guardar automáticamente las comunicaciones como notas.
- 📊 **Gestiona oportunidades de venta**: Visualiza y realiza un seguimiento de tu embudo de ventas mediante un tablero Kanban.
- 🔄 **Importa y exporta datos**: Transfiere contactos hacia y desde el sistema con facilidad.
- 🔐 **Controla el acceso**: Inicia sesión mediante Google, Azure, Keycloak o Auth0.
- 📜 **Consulta el historial de actividad**: Visualiza todas las interacciones en registros de actividad consolidados.
- 🔗 **Integra mediante API**: Conecta el sistema con otras plataformas sin complicaciones a través de nuestra API.
- 🛠️ **Personalízalo todo**: Añade campos personalizados, cambia el tema y sustituye cualquier componente para adaptarlo a tus necesidades.

## Instalación y desarrollo local

Para ejecutar este proyecto de forma local, necesitarás tener instaladas las siguientes herramientas en tu equipo:

- Make
- Node 22 LTS
- Docker (opcional; solo es necesario para herramientas locales adicionales)

Realiza un *fork* del repositorio [`marmelab/atomic-crm`](https://github.com/marmelab/atomic-crm) en tu usuario u organización y, a continuación, clónalo en tu equipo:

```sh
git clone https://github.com/[username]/atomic-crm.git
```

Instala las dependencias mediante Vite+:

```sh
cd atomic-crm
make install
```

Esto instalará las dependencias tanto para el *frontend* como para el *backend*, incluyendo las necesarias para Cloudflare Worker y la base de datos local D1.

Inicia la aplicación (basada en Cloudflare) de forma local:

```sh
make start
```

Este comando pone en marcha el *frontend* de Vite y el Cloudflare Worker, conectados a la base de datos local D1.

Una vez hecho esto, podrás acceder a la aplicación a través de [http://localhost:5173/](http://localhost:5173/). Se te solicitará crear el primer usuario.

Para el proveedor de demostración, utiliza `vp run dev:demo`. Para ejecutar conjuntamente el *frontend* nativo de Cloudflare, el Worker y el servidor MCP, utiliza `vp run dev:all` o `vp run dev:cloudflare`. El *backend* de la aplicación se compone exclusivamente de Cloudflare D1 y Better Auth; FakeRest está disponible para realizar demostraciones. Si necesitas depurar el backend, puedes acceder a los siguientes servicios:

- Cloudflare Worker: [http://localhost:8787/](http://localhost:8787/)
- API REST: [http://127.0.0.1:54321](http://127.0.0.1:54321)
- Los adjuntos en R2 (entorno local) son gestionados por el runtime de Worker local de Wrangler.
- El correo electrónico entrante en entorno local utiliza el manejador de Worker `email()`; en el entorno de preproducción (staging), se enruta a través de Cloudflare Email Routing mediante `crm@atomic-crm.asomba.com`.


## Asistente CopilotKit

El asistente CopilotKit integrado en la aplicación utiliza el runtime de Cloudflare Worker tanto en preproducción como en producción. El runtime de Node solo se conserva para casos de reversión (rollback) local y desarrollo de MCP:

- `atomic-crm-app`: el frontend estático (este repositorio).
- `atomic-crm-copilot`: el runtime de CopilotKit para entorno local/reversión (servidor Hono en `server/`).
- `atomic-crm-mcp`: el analizador de contratos MCP (también en `server/mcp/`).

La interfaz de chat utiliza los componentes base de shadcn (shadcn Base UI) para las filas de mensajes, burbujas de chat, indicadores de transmisión (streaming), desplazamiento anclado de la transcripción, archivos adjuntos y resúmenes guiados de Copilot.

Las herramientas de Copilot interactúan con las mismas API de CRM autenticadas que el resto de la aplicación (D1 en Cloudflare, FakeRest en la versión de demostración). `VITE_COPILOTKIT_API_URL` es opcional y no es necesario cuando se utiliza el modo Cloudflare.

- `VITE_COPILOTKIT_RUNTIME_URL`: endpoint alternativo opcional para CopilotKit. Déjalo sin configurar para utilizar la ruta del Worker del mismo origen, `/api/copilotkit`.


### Flujos de trabajo de desarrollo local

La pila (stack) local predeterminada consiste en el frontend de Vite junto con el Worker de Cloudflare:

```sh
pnpm run d1:migrate:local
vp run dev:cloudflare
```

Configura `BETTER_AUTH_SECRET` en `.dev.vars` antes de iniciar sesión. CopilotKit
se ejecuta de forma nativa en el Worker; MCP es opcional:

```sh
vp run dev:all
```

La demostración de FakeRest que se ejecuta en el navegador (sin Worker) es:

```sh
vp run dev:demo
```

El servidor de desarrollo de Vite actúa como proxy para `/api` hacia el Worker en
`http://localhost:8787` (sustituir por `COPILOTKIT_PROXY_TARGET`). Utilice
`COPILOTKIT_RUNTIME_MODE=proxy` y `make start-server` únicamente para el entorno de ejecución
de reversión (rollback) a Node.


### Flujo de trabajo de Cloudflare Worker

El entorno de ejecución de Cloudflare en fase de preproducción (staging) puede iniciarse con:

```sh
vp run dev:cloudflare
```

Esto ejecuta simultáneamente el frontend de Vite y el Worker de Wrangler. Cloudflare D1 y
Better Auth se seleccionan automáticamente. Configure `BETTER_AUTH_SECRET` en
`.dev.vars` antes de utilizar la autenticación. Aplique las migraciones locales
de D1 mediante `pnpm run d1:migrate:local`.
El Worker en fase de preproducción sirve a CopilotKit de forma nativa a través de la factoría TanStack AI
CopilotKit y su enlace (binding) `AI`. Defina `CLOUDFLARE_AI_MODEL` si necesita un
modelo de Workers AI diferente; no se requiere un ID de cuenta ni un token de API de IA. Utilice
`COPILOTKIT_RUNTIME_MODE=proxy` únicamente para la ruta de reversión (rollback) local a Node.
Compile el frontend de preproducción con `vp run build:staging`; esto selecciona los
proveedores de datos/autenticación de Cloudflare y la API del Worker del mismo origen (same-origin) antes del despliegue.


### Aceptación en preproducción (staging)

Defina `STAGING_TEST_EMAIL` y `STAGING_TEST_PASSWORD` localmente y, a continuación, ejecute:

```sh
pnpm run smoke:staging
pnpm run sso:register:staging
```

La prueba de humo (smoke test) autenticada crea y elimina un contacto, una nota, una tarea y
un archivo adjunto. Para el correo electrónico entrante, realice un envío desde una dirección de usuario de ventas del CRM a un contacto del CRM, incluyendo a `crm@atomic-crm.asomba.com` en copia (CC); el *Worker* (proceso en segundo plano) asocia al remitente con el usuario de ventas y a cualquier destinatario (en los campos To, Cc o Bcc) con el contacto correspondiente.


### Router

TanStack Router es el *router* (enrutador) canónico tanto para la aplicación como para las pruebas. Utilice `VITE_ROUTER=tanstack` para realizar una prueba de humo (*smoke test*) local explícita; `vp run build:staging` permite realizarla de forma automática. Las URL, las cadenas de consulta (*query strings*), las rutas de recursos y la obtención de datos mediante `ra-core` permanecen sin cambios.

`react-router` y `react-router-dom` siguen siendo dependencias de compatibilidad directa, ya que la versión actual de `ra-core` importa de forma estática su adaptador para React Router, incluso cuando se ha configurado un proveedor de enrutamiento personalizado. El CRM no contiene importaciones de React Router, ni en la aplicación ni en las pruebas. Estos paquetes de compatibilidad podrán eliminarse tras actualizar a una versión (`ra-core`) que ya no requiera dicho adaptador.


## Documentación

La documentación para usuarios y desarrolladores de este proyecto se encuentra disponible [en el directorio `doc/`](./doc/). También puede consultarla en línea en [https://marmelab.com/atomic-crm/doc/](https://marmelab.com/atomic-crm/doc/).


## Pruebas y compilaciones

Este proyecto incluye pruebas unitarias y pruebas en navegador mediante Vitest. Ejecútalos con el siguiente comando:

```sh
vp test
```

Utiliza `vp check` para el formateo, el *linting* y la verificación de tipos; `make typecheck` para omitir el formateo o el *linting*; y `vp build` para realizar una compilación de producción. Puedes añadir pruebas en cualquier parte de `src`; utiliza `*.test.tsx` o `*.test.ts`.


## Diagnóstico de compilación con Vite+

El proyecto raíz utiliza Vite+ 0.2.8 para la instalación, verificación, pruebas, desarrollo y compilación de producción. Los *sourcemaps* (mapas de código fuente) permanecen habilitados en la versión de producción. Las compilaciones actuales muestran fragmentos (*chunks*) de aplicación de gran tamaño, debido a que las definiciones de recursos del CRM se registran de forma anticipada (*eagerly*) por el *shell* de administración; el fragmento principal de la aplicación mide aproximadamente 2,7 MB una vez minificado (812 kB comprimido con gzip). Se mantiene esta advertencia para garantizar que cualquier futura división a nivel de ruta (*route-level splitting*) esté motivada por una mejora real en el tamaño de la carga útil (*payload*), en lugar de quedar oculta simplemente aumentando el límite de la advertencia.

El procesamiento posterior de CSS mediante Tailwind CSS y Vite puede generar advertencias del tipo `SOURCEMAP_BROKEN`, ya que dichas transformaciones previas no generan *sourcemaps*. Estas advertencias están documentadas aquí y no desaparecen al desactivar los *sourcemaps* en la versión de producción.


## Registro

Los componentes atómicos del CRM se publican como un archivo de registro (*Registry*) de Shadcn:

- El archivo `registry.json` es generado automáticamente por el script `scripts/generate-registry.mjs`, configurado como un *hook* de *pre-commit*.
- El archivo `http://marmelab.com/atomic-crm/r/atomic-crm.json` es publicado automáticamente por el pipeline de CI/CD.

> [!WARNING]
> Si al archivo `registry.json` le faltan algunos cambios que has realizado, DEBES actualizar el archivo `scripts/generate-registry.mjs` para incluir dichos cambios.


## Licencia

Este proyecto está bajo la licencia MIT, por cortesía de [Marmelab](https://marmelab.com). Consulta el archivo [LICENSE.md](./LICENSE.md) para obtener más detalles.


### Compatibilidad de dependencias

`query-string` 7 sigue siendo compatible con las importaciones con nombre de react-admin. El parche de `pnpm` aplicado adapta su importación del decodificador de CommonJS a la exportación por defecto en
`decode-uri-component` 0.5, lo cual soluciona una vulnerabilidad de denegación de servicio provocada por entradas malformadas. Elimina
este parche al actualizar `react-admin` a una versión que sea compatible con la API más reciente de `query-string`. Las comprobaciones de elegibilidad para el compilador de React (React Compiler) se muestran como advertencias; las reglas de los *hooks* en tiempo de ejecución y las comprobaciones de tipos siguen siendo errores. El compilador de React no está habilitado.
