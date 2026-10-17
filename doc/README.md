[English](README.md) · [Español](README.es-ES.md) · [Français](README.fr-FR.md)

# Atomic CRM Documentation

This directory contains the Astro/Starlight documentation site for Atomic CRM. The published documentation covers end-user workflows, providers, authentication, deployment, customization, the API, inbound email, and the MCP server.

## Structure

```text
doc/
├── src/content/docs/       # User and developer MDX documentation
├── src/content/images/     # Documentation images
├── public/                 # Static assets and logos
├── astro.config.mjs
└── package.json
```

## Local commands

Run these commands from the repository root:

```bash
make doc-install            # Install documentation dependencies
make doc                    # Start Astro at localhost:4321
make doc-build              # Build the documentation site
make doc-preview            # Preview the production build
```

The documentation is deployed separately from the CRM frontend. When adding a feature, update the relevant page under `doc/src/content/docs/` and keep links and screenshots consistent with the current application behavior.
