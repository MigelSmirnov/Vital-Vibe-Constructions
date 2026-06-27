# Vital Vibe Constructions — sitio web

Sitio estático listo para desplegar (GitHub Pages, Netlify, Vercel, etc.).

## Estructura
- `index.html` — página principal
- `galeria-economica.dc.html`, `galeria-estandar.dc.html`, `galeria-premium.dc.html` — galerías
- `aviso-legal.dc.html` — aviso legal (enlazado desde el footer)
- `support.js` — runtime necesario (no borrar)
- `VVC_primary_logo.svg` — logo
- `estandar/`, `premium/`, `proyecto-1/`, `proyecto-2/`, `smart/` — imágenes

## Desplegar en GitHub Pages
1. Crea un repositorio y sube **el contenido de esta carpeta** a la raíz (o a `/docs`).
2. En **Settings → Pages**, elige la rama y la carpeta (`/root` o `/docs`).
3. El sitio se publica en `https://<usuario>.github.io/<repo>/`.

El archivo `.nojekyll` evita que GitHub Pages procese los archivos con Jekyll.

Idiomas: español, inglés y ruso (selector en la cabecera). El formulario de contacto está oculto hasta que el backend esté listo; los botones de WhatsApp ya funcionan.
