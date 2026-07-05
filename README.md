# 💣 [BoomSweeper](https://coiponorte.github.io/BoomSweeper/)

Buscaminas con poderes especiales para la generación Z. Construido con React + Vite + Tailwind CSS.

![BoomSweeper](public/view.png)

## 🎮 Jugar

**[▶ Jugar ahora](https://coiponorte.github.io/BoomSweeper/)**

## ✨ Características

- 🛡️ **Casillas especiales** — Escudo, Visión, Freeze, X-Ray, Suerte, Doble puntos
- 📱 **Responsivo** — Funciona en móvil y escritorio
- 🔊 **Efectos de sonido** — Web Audio API
- 💥 **Juicy feedback** — Screen shake, partículas, animaciones
- 💾 **Persistencia** — High scores guardados en IndexedDB
- 🚀 **Single file** — Todo el juego en un solo HTML

## 🚀 Desarrollo local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Preview del build
npm run preview
```

## 📦 Deploy a GitHub Pages

### Pasos:

**1. Clona el repo:**
```bash
git clone https://github.com/CoipoNorte/BoomSweeper.git
cd BoomSweeper
npm install
```

**2. Agrega el script de deploy en `package.json`:**

Abre `package.json` y en la sección `"scripts"` agrega la línea `deploy`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

**3. Despliega:**
```bash
npm run deploy
```

Esto compila el proyecto y sube la carpeta `dist/` a la rama `gh-pages`.

**4. Configura GitHub Pages:**

- Ve a tu repo en GitHub → **Settings** → **Pages**
- En **Source** selecciona la rama `gh-pages` y carpeta `/ (root)`
- Guarda y espera ~1 minuto

Tu juego estará en: **https://coiponorte.github.io/BoomSweeper/**

### ⚠️ Nota sobre rutas

Como usamos `vite-plugin-singlefile`, todo (JS + CSS) queda incrustado en `index.html`. El único archivo externo es `logo.png` (favicon). Si el favicon no carga en GitHub Pages, cambia en `index.html`:

```html
<!-- De esto: -->
<link rel="icon" type="image/png" href="/logo.png" />

<!-- A esto (ruta relativa): -->
<link rel="icon" type="image/png" href="./logo.png" />
```

## 🎮 Controles

| Plataforma | Revelar casilla | Poner bandera 🚩 |
|------------|----------------|-------------------|
| 📱 Móvil   | Tap            | Mantener presionado |
| 🖥️ Desktop | Click          | Click derecho      |

**Atajos de teclado:**
- `ESC` — Pausar / Reanudar
- `R` — Reiniciar (en game over)
- `F` — Alternar modo bandera

## 🛠️ Stack

- **React 19** — UI
- **Vite 7** — Build
- **Tailwind CSS 4** — Estilos
- **TypeScript** — Tipos
- **IndexedDB** — Persistencia local
- **Web Audio API** — Sonidos
- **vite-plugin-singlefile** — Bundle en un solo HTML

## 📄 Licencia

MIT
