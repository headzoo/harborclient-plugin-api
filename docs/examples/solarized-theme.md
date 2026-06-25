# Solarized theme

This example registers a **Solarized Dark** appearance theme. The user selects it from **Settings → General → Appearance** alongside the built-in options.

## manifest.json

```json
{
  "id": "com.example.solarized",
  "name": "Solarized Theme",
  "version": "1.0.0",
  "engines": { "harborclient": ">=1.7.0" },
  "renderer": "dist/renderer.js",
  "permissions": ["ui"],
  "contributes": {
    "themes": [{ "id": "solarized", "title": "Solarized Dark", "type": "dark" }]
  }
}
```

## src/renderer.tsx

```tsx
import type { PluginContext } from '@harborclient/sdk';

export function activate(hc: PluginContext): void {
  hc.subscriptions.push(
    hc.themes.register({
      id: 'solarized',
      title: 'Solarized Dark',
      type: 'dark',
      colors: {
        surface: '#002b36',
        sidebar: '#073642',
        'sidebar-section': '#073642',
        control: '#073642',
        field: 'rgba(255, 255, 255, 0.06)',
        separator: 'rgba(255, 255, 255, 0.1)',
        text: '#839496',
        'text-secondary': '#93a1a1',
        muted: '#657b83',
        accent: '#268bd2',
        selection: 'rgba(38, 139, 210, 0.25)',
        danger: '#dc322f',
        warning: '#cb4b16',
        success: '#859900'
      }
    })
  );
}
```

For themes that need extra rules (custom scrollbars, plugin-specific selectors), ship a CSS file and reference it:

```typescript
hc.themes.register({
  id: 'solarized',
  title: 'Solarized Dark',
  type: 'dark',
  colors: {
    /* … */
  },
  stylesheet: 'dist/theme.css'
});
```

Include `dist/theme.css` in your `.hcp` package. The host injects it while the theme is registered and removes it on deactivation.

See [hc.themes](/renderer-data#hc-themes) for the full themes API reference.
