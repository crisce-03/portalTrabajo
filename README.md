# Portal de Trabajo

Sitio web de búsqueda de empleo: los candidatos buscan ofertas, se postulan, gestionan su perfil y participan en foros; las empresas publican vacantes y revisan postulaciones; los administradores gestionan y moderan el portal.

Proyecto del 2do periodo de **Desarrollo de Páginas Web Activas (DPWA)** — Facultad de Ingeniería y Arquitectura, UNICAES. Docente: Ing. Jose Emerson Aguilar.

| Integrante | Responsabilidad |
|---|---|
| Héctor García | Front-end completo (`public/`) y entregable de prototipos (`prototipos/`) |
| Axel | Backend y API (`backend/`) |
| Cris Cerritos | Configuración inicial (Express, Docker y PostgreSQL) y apoyo a ambos |

---

## Cómo correrlo

Requisitos: Node.js 18 o superior, Docker Desktop y Google Chrome (este último solo para las pruebas y las láminas).

```bash
npm install
docker compose up -d      # PostgreSQL en el puerto 5454
npm run dev               # servidor en http://localhost:3000
```

Antes, crea un archivo `.env` en la raíz (no se sube a git):

```
PORT=3000
DB_USER=admin
DB_PASSWORD=password1234
DB_HOST=localhost
DB_PORT=5454
DB_NAME=portalTrabajo
```

- **Prueba de conexión a la base de datos:** http://localhost:3000/prueba-bd.html (antes estaba en `index.html`, que ahora es la página de Inicio).
- **Si el puerto 3000 está ocupado**, usa otro sin tocar el `.env`:
  - PowerShell: `$env:PORT=3001; npm run dev`
  - Git Bash: `PORT=3001 npm run dev`
- **Sin servidor:** las pantallas también se abren con doble clic en `public/index.html`; todavía no dependen de la API.

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor Express con recarga automática (nodemon) |
| `npm test` | Prueba todo el front-end en Chrome sin ventana (187 revisiones) |
| `npm run laminas` | Genera el PDF de prototipos y las láminas para Figma |

---

## Estructura

```
backend/            Servidor Express y conexión a PostgreSQL (Axel)
public/             Front-end: lo que sirve Express
  css/estilos.css   Sistema de diseño "Azul Mar" sobre Bootstrap 5.3
  js/comun.js       Navbar, pie, sesión simulada, validación de formularios y utilidades
  js/datos.js       Datos de ejemplo (ofertas, empresas, hilos, postulantes...) → se reemplazan por la API
  js/app.js         Prueba de conexión a la BD (de prueba-bd.html)
  archivos/         CV de ejemplo en PDF
  *.html            Las 19 pantallas
prototipos/         Entregable de la primera etapa (PDF y láminas para Figma)
  contenido.json    Textos de cada lámina: objetivo, justificación y cuadritos
  *.mmd             Mapa del sitio y flujo de navegación (Mermaid)
  generar.mjs       Genera prototipos/salida/ (ignorado en git)
pruebas/
  frontend.mjs      Pruebas automáticas del front-end (npm test)
docker-compose.yml  PostgreSQL 15
```

---

## Pantallas

Nomenclatura uniforme `MOD-<módulo>-<NOMBRE>`, la misma en el código (comentario al inicio de cada HTML), en las láminas, en el mapa del sitio y en el flujo de navegación.

| Nomenclatura | Pantalla | Archivo | Tipo de usuario |
|---|---|---|---|
| **Módulo 01 — Inicio y Búsqueda** | | | |
| MOD-01-HOME | Inicio: búsqueda destacada con filtros, métricas, ofertas recientes, formulario de inicio de sesión en el encabezado | `index.html` | Todos |
| MOD-01-SIGNUP | Registro de candidato o empresa | `registro.html` | Visitante |
| MOD-01-RESULTS | Resultados de búsqueda con filtros a la izquierda | `resultados.html` | Visitante / Candidato |
| MOD-01-JOB-DETAIL | Descripción del trabajo, empresa, valoración y comentarios | `detalle-oferta.html?id=` | Visitante / Candidato |
| MOD-01-APPLY | Postulación (pide sesión de candidato) | `postulacion.html?id=` | Candidato |
| MOD-01-APPLY-OK | Confirmación de postulación | `postulacion-enviada.html?id=` | Candidato |
| **Módulo 02 — Comunidad y Candidato** | | | |
| MOD-02-RESOURCES | Centro de recursos profesionales | `recursos.html` | Todos |
| MOD-02-RESOURCE | Artículo / tutorial | `recurso.html?id=` | Todos |
| MOD-02-NEWS | Noticias laborales | `noticias.html` | Todos |
| MOD-02-FORUM | Foros de discusión, categorizados por los filtros de empleo | `foros.html` | Candidato |
| MOD-02-THREAD | Hilo de discusión y respuestas | `hilo.html?id=` | Candidato |
| MOD-02-REVIEWS | Valoraciones de empresas | `valoraciones.html` | Todos (leer) / Candidato (valorar) |
| MOD-02-USER-DASH | Perfil del candidato: datos, CV, estadísticas, alertas, valoraciones y solicitudes | `perfil-usuario.html` | Candidato |
| **Módulo 03 — Empresarial** | | | |
| MOD-03-COMPANY-DASH | Panel empresarial | `panel-empresa.html` | Empresa |
| MOD-03-POST-JOB | Publicar oferta con vista previa en vivo | `publicar-oferta.html` | Empresa |
| MOD-03-COMPANY-EDIT | Datos de la empresa (mantenimiento) | `datos-empresa.html` | Empresa |
| MOD-03-APPLICANTS | Postulaciones recibidas: filtros, orden y paginación | `postulaciones.html` | Empresa |
| MOD-03-CANDIDATE | Revisión de candidatura y evaluación | `perfil-candidato.html?id=` | Empresa |
| **Módulo 04 — Administración y Moderación** | | | |
| MOD-04-ADMIN-DASH | Consola: CRUD de usuarios/empresas/vacantes, moderación, estadísticas y configuración | `admin.html` | Administrador |

Las 9 pantallas de empresa, recursos y postulación replican los prototipos del grupo; Foros, Perfil y Admin replican los de Héctor. Inicio, Registro, Resultados, Valoraciones, Hilo, Artículo y Noticias se diseñaron con el mismo sistema para cubrir todo lo que pide el documento de requerimientos.

---

## Cómo recorrerlo

Usa **Iniciar Sesión** (arriba a la derecha), escribe cualquier correo y contraseña y elige **Ingresar como**:

- **Candidato** → perfil. Desde Búsqueda de trabajo: elegir oferta → Aplicar → Confirmación → aparece en «Mis solicitudes». En Foros: crear un tema y responderlo.
- **Empresa** → panel empresarial: publicar oferta, revisar postulaciones, ver perfiles y editar los datos de la empresa.
- **Administrador** → consola: CRUD, exportar a CSV, moderar reportes, estadísticas y configuración.

**Cerrar Sesión** vuelve a visitante. Si un visitante intenta postularse, se le pide iniciar sesión y regresa a la misma oferta.

> La sesión y lo que se crea (temas, respuestas, alertas, postulaciones) se guardan en `sessionStorage`: duran mientras la pestaña esté abierta. Es una simulación hasta que exista la API.

---

## Cómo está hecho el front-end

HTML, CSS y JavaScript sin frameworks, sobre **Bootstrap 5.3.3** y **Bootstrap Icons 1.11.3** (CDN), con las fuentes **Inter** y **Roboto** (Google Fonts).

### Sistema de diseño — `css/estilos.css`

Estética "Soft Neo-Brutalism" con la paleta Azul Mar: bordes de 1.5 px y sombras sólidas.

| Color | Uso |
|---|---|
| `#0369A1` azul mar | Acciones principales |
| `#1E3A8A` marino | Comunidad y foros |
| `#0F766E` verde mar | Estados activos y salarios |
| `#D97706` ámbar | Calificaciones |
| `#B91C1C` rojo | Moderación y acciones destructivas |
| `#1E293B` tinta | Texto, bordes y sombras |

Clases propias: `neo-card`, `neo-card-sm`, `neo-subbox`, `badge-neo-*`, `btn-neo-primary|secondary|accent|danger`, `nav-pills-neo`, `table-neo`, `dropzone-neo`, `metrica`, `estrellas`. Los botones usan las variables de Bootstrap (`--bs-btn-*`) para que `:hover` y `:active` mantengan sus colores.

### Código compartido — `js/comun.js`

Se carga en todas las páginas, después de `datos.js` y antes del script propio de cada página.

- **Navbar y pie:** cada `<body>` indica `data-usuario` (`visitante | candidato | empresa | admin`) y `data-activo` (el menú a resaltar). La navbar se arma con los enlaces y botones de ese rol.
- **Sesión simulada:** `leerSesion()` y `guardarSesion()` sobre `sessionStorage`. El formulario de login del encabezado manda a cada rol a su panel. Con `data-tras-login="aqui"` en `<body>`, la página se recarga en lugar de redirigir.
- **Formularios** con `class="needs-validation" novalidate`:
  - validan con HTML5 y muestran los errores de Bootstrap;
  - si todo está bien, disparan el evento **`enviado`** y luego van a `data-destino` o muestran `data-exito` en el `[role=status]` del formulario.
- **Errores en español:** si un campo no trae su propio `.invalid-feedback`, se crea un mensaje claro debajo («Este campo es obligatorio.», «Escribe un correo válido…», «Escribe al menos N caracteres…») con `aria-invalid` y `aria-describedby`. Se actualiza mientras el usuario corrige.
- **Atributos útiles:**
  - `data-espejo="campo"`: copia en vivo el valor de `name="campo"` (vistas previas).
  - `data-muestra="id"` en un `input[type=file]`: muestra el nombre del archivo y valida tipo (según `accept`) y tamaño (5 MB). La `.dropzone-neo` acepta arrastrar y soltar.
  - `data-guardar-oferta="id"`: guarda o quita una oferta (`data-solo-icono` muestra solo el ícono).
  - `data-abrir-login`: abre el login del encabezado.
- **Avisos:** `notificar(texto, 'exito' | 'info' | 'error')` muestra un toast de Bootstrap; los errores de formulario siguen apareciendo junto al formulario.
- **Automático en todas las páginas:**
  - botón para ver u ocultar contraseñas;
  - contador en los `textarea[maxlength]`;
  - enlace «Saltar al contenido»;
  - botón «Volver arriba»;
  - pie de página con enlaces.
- **Utilidades:**
  - `esc()`: escapa HTML; todo texto del usuario o de la API pasa por aquí antes de `innerHTML`.
  - `normalizar()`: búsqueda sin tildes ni mayúsculas.
  - `parametro()`, `formatoFecha()`, `formatoSalario()`, `estrellas()`, `insigniaEstado()`.
  - `guardados()` y `guardarEn()` (sessionStorage).
  - `ofertasGuardadas()` y `marcarGuardadas()` (localStorage).

### Datos de ejemplo — `js/datos.js`

`OFERTAS`, `EMPRESAS`, `HILOS`, `POSTULANTES`, `REGISTROS` (admin) y `RECURSOS`. Las páginas pintan sus listas a partir de estos arreglos. Los indicadores se calculan de los datos (por ejemplo, 18 postulantes: 7 pendientes, 8 en revisión y 3 contactados).

### Experiencia de usuario

| Mejora | Dónde |
|---|---|
| Barra de navegación fija arriba; los saltos a secciones no quedan tapados | Todas |
| Avisos flotantes (toasts) que confirman cada acción: guardar, publicar, reportar, cambiar estado, exportar | Todas |
| Mensajes de error en español debajo de cada campo y foco en el primero con error | Todos los formularios |
| Ver u ocultar contraseña | Login del encabezado y Registro |
| Contador de caracteres en textos largos | Postulación, foros, hilo y valoraciones |
| CV con arrastrar y soltar, y validación de tipo y tamaño al elegirlo | Mi perfil y Postulación |
| Tarjetas que se abren con un clic en cualquier parte, con efecto al pasar el mouse | Inicio, Resultados, Foros, Recursos y Postulaciones |
| Filtros activos como etiquetas que se quitan con un clic; la búsqueda queda en la URL (se puede compartir, guardar en favoritos y sobrevive al recargar) | Resultados |
| En celular los filtros se abren en un panel lateral, con contador de filtros aplicados | Resultados y Foros |
| Ofertas guardadas con el botón <i>marcador</i>, listadas en «Mi perfil → Ofertas guardadas» | Inicio, Resultados, Descripción y Perfil |
| Borrador real de la oferta: se guarda y se recupera al volver | Publicar oferta |
| Orden por más recientes o más respuestas; foco en el tema recién publicado | Foros |
| Vista previa de las estrellas al pasar el mouse | Valoraciones del perfil |
| Indicador del filtro aplicado en la tabla, con «Ver todos» | Admin |
| «Saltar al contenido», «Volver arriba», foco visible y respeto de «reducir movimiento» del sistema | Todas |

### Accesibilidad y seguridad del lado del cliente

- Todos los campos tienen etiqueta; los botones de solo ícono, `aria-label`; los mensajes usan `role="status"`.
- Los menús marcan la página actual con `aria-current`.
- No se usan `alert()` ni `confirm()`: las acciones destructivas piden confirmación en una ventana modal.
- La exportación a CSV neutraliza valores que Excel interpretaría como fórmulas.
- Las 19 pantallas se adaptan a celular sin scroll horizontal.

---

## Guía para conectar el backend (Axel)

Cada lugar que hoy usa datos de ejemplo tiene un comentario `// shortcut:` con la ruta sugerida. Para conectar:

1. Reemplazar el arreglo de `datos.js` por un `fetch` a la ruta.
2. En los formularios, hacer el `fetch` dentro del listener del evento `enviado` (antes de que la página siga a `data-destino`).

| Pantalla | Ahora | Ruta sugerida |
|---|---|---|
| Resultados / Inicio | Filtra `OFERTAS` en el navegador | `GET /api/ofertas?q=&ubicacion=&modalidad=&salario=&experiencia=&sector=&contrato=` |
| Descripción del trabajo | Busca en `OFERTAS` y `EMPRESAS` | `GET /api/ofertas/:id` |
| Postulación | Guarda en `sessionStorage` | `POST /api/postulaciones` (con el archivo del CV) |
| Mi perfil | Solicitudes de ejemplo; formularios sin guardar | `GET /api/candidatos/me/postulaciones`, `PUT` del perfil, `POST` de alertas y valoraciones |
| Registro | Simula la cuenta | `POST /api/registro` (devuelve el rol) |
| Login (encabezado) | Elige el rol en una lista | Autenticación real; el servidor decide el rol |
| Foros / Hilo | `HILOS` + `sessionStorage` | `GET /api/hilos?...`, `POST /api/hilos`, `POST /api/hilos/:id/respuestas` |
| Valoraciones | `EMPRESAS` | `GET /api/empresas`, `POST /api/reportes` |
| Publicar oferta | Mensaje de éxito; borrador en `localStorage` | `POST /api/ofertas` (estado publicada o borrador) |
| Ofertas guardadas | `localStorage` del navegador | `GET/POST/DELETE /api/candidatos/me/guardadas` |
| Datos de la empresa | Mensaje de éxito | `PUT /api/empresas/:id` |
| Postulaciones | Filtra y pagina `POSTULANTES` | `GET /api/ofertas/:id/postulaciones?buscar=&estado=&orden=&pagina=` |
| Revisión de candidatura | `POSTULANTES` | `GET /api/postulaciones/:id`, `PUT /api/postulaciones/:id { estado }` |
| Admin | `REGISTROS` en memoria | `POST/PUT/DELETE /api/admin/...` y moderación de reportes |

Importante para el servidor:

- La validación del navegador es solo para comodidad del usuario; el servidor debe volver a validar todo.
- El panel de administrador y los módulos de empresa deben protegerse por rol en el servidor; hoy cualquiera puede abrir el HTML.
- Las contraseñas se guardan con hash. El CV se valida por tipo (PDF o DOCX) y tamaño (5 MB).

---

## Entregable de prototipos (Figma / PDF)

```bash
npm run laminas
```

Toma capturas de las pantallas reales y genera en `prototipos/salida/` (no se sube a git, se regenera cuando haga falta):

- **`Prototipos-PortalTrabajo.pdf`** — 24 páginas en el orden que pide el documento:
  - portada;
  - nomenclatura uniforme de pantallas;
  - justificación del diseño y tipos de usuario;
  - mapa del sitio;
  - flujo de navegación;
  - una lámina por pantalla, ordenadas por módulo: encabezado con nomenclatura, tipo de usuario y módulo; cuadritos con línea y punto que explican la funcionalidad y la lógica; objetivo y justificación al pie.
- **`laminas/*.png`** — una imagen por lámina (1800×1200) para arrastrar a FigJam.
- **`laminas.html`** — todas las láminas en una página, para importarlas a Figma con el plugin html.to.design (los textos quedan como capas editables) o para revisarlas en el navegador.

Para cambiar textos, edita `prototipos/contenido.json` (cada cuadrito indica el selector CSS de la zona que explica). Los diagramas están en `prototipos/mapa-del-sitio.mmd` y `prototipos/flujo-de-navegacion.mmd`. Necesita Chrome (ruta configurable con la variable `CHROME`) e internet para las fuentes y Mermaid.

---

## Pruebas

`npm test` abre las 19 pantallas en Chrome sin ventana y revisa:

- **Cada pantalla:** barra de navegación, un solo `h1`, pie, sin enlaces rotos ni vacíos, botones con `type`, campos con etiqueta, sin errores en la consola y sin scroll horizontal en celular (390 px).
- **Flujo del candidato:**
  - Inicio → Resultados con los filtros aplicados → Detalle → Postulación;
  - sin sesión se abre el login y, al entrar, regresa a la misma oferta;
  - Confirmación → «Mis solicitudes».
- **Perfil:** valoraciones con estrellas, alertas nuevas (con texto escapado), cerrar sesión, registro de empresa y contraseñas que no coinciden.
- **Foros:** filtros, búsqueda sin tildes, crear un tema, abrirlo y responder; reportar respuestas.
- **Valoraciones y recursos:** búsqueda de empresas, reportar reseñas y artículos por `id`.
- **Empresa:** indicadores 18/7/8/3, paginación, filtros y orden, perfil del candidato, descartar, CV descargable, vista previa al publicar y validaciones; guardar y cancelar en los datos de la empresa.
- **Admin:** filtros del menú, crear, editar, suspender, deshabilitar, eliminar con confirmación, exportar CSV, moderar con confirmación y configuración.
- **Experiencia de usuario:**
  - «Saltar al contenido», barra fija, ver contraseña;
  - errores en español que aparecen y desaparecen al corregir;
  - «Volver arriba»;
  - filtros leídos de la URL, etiquetas de filtros y quitar un filtro;
  - tarjetas clicables;
  - guardar y quitar ofertas, y verlas en el perfil;
  - contador de caracteres y borrador recuperado;
  - orden de foros, indicador de filtro en admin y panel de filtros en celular.
- **Login** con cada uno de los tres roles.

Resultado actual: **187/187 OK**. Deja una captura de cada pantalla en `pruebas/capturas/` (ignorado en git).

---

## Decisiones respecto a los prototipos

- **Nomenclatura unificada:**
  - los recursos usaban `REC-01..03`; ahora son `MOD-02-RESOURCES`, `MOD-02-RESOURCE` y `MOD-02-NEWS`;
  - las pantallas nuevas siguen el mismo formato.
- **Etiquetas de tipografía:** se quitaron las etiquetas "Inter" y "Roboto" bajo los títulos; eran notas del prototipo, no contenido del sitio.
- **Foros:**
  - los filtros empiezan sin marcar (= todos los temas); con los valores marcados del diseño se ocultaban temas;
  - «Nuevo tema» abre un formulario y «Responder hilo» abre la conversación.
- **Mi perfil:**
  - se agregó «Guardar cambios» en la gestión de datos;
  - se agregó el selector de empresa en Valoraciones;
  - se agregó la sección «Mis solicitudes», que el menú y la confirmación ya enlazaban;
  - las alertas repetidas del ejemplo se cambiaron por otras distintas.
- **Admin:**
  - la bandeja muestra los 2 reportes que anuncia el contador;
  - se agregaron las secciones Estadísticas del sistema y Otros / Configuración, que el menú ya listaba.
- **Postulación:**
  - se llena con los datos del candidato que inició sesión;
  - exige sesión, como indica el flujo de navegación.

## Pendiente

- API real y autenticación (backend).
- Nombres completos de los integrantes en la portada del PDF (`prototipos/contenido.json` → `portada.integrantes`).
