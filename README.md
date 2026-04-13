# GAMBLINGGGGG 🎲

**EA2 — Sitio Web Dinámico con JavaScript**  
Materia: Programación Web | 4to Semestre  
Universidad Autónoma de Guadalajara  
Autores: Miguel Cortés & Anton Olguín

## Tema

Sitio web de entretenimiento con tragamonedas virtual. Los créditos son completamente ficticios — no hay dinero real involucrado.

## Funcionalidades implementadas

### Interactividad y DOM (5+ eventos)
- **click** — botón Girar y botón Reiniciar
- **click** — cierre del banner de sesión restaurada
- **keydown** — barra espaciadora como atajo para girar
- **input** — guardado automático de borradores en el formulario
- **submit** — envío del formulario de soporte

### Almacenamiento (LocalStorage)
- El estado del juego (créditos, victorias, tiradas) se persiste automáticamente entre sesiones.
- Al regresar a la página de juegos se muestra un banner con los datos de la sesión anterior.
- Los borradores del formulario de soporte se guardan campo por campo mientras el usuario escribe.

### Fetch API + JSON
- Los símbolos y la configuración del juego se cargan desde `assets/data/games.json`.
- La tabla de premios se renderiza dinámicamente desde ese JSON (no está hardcodeada en el HTML).
- Incluye fallback automático si el archivo se abre vía `file://` sin servidor.

### Lógica Modular (Clases)
- `GameStorage` — encapsula todas las operaciones de LocalStorage.
- `SlotMachine` — contiene la lógica de negocio (apuesta, giro, resultado) separada de la UI.
- `initGame()` / `initSupport()` — módulos de inicialización por página.

### Diseño y Animaciones (CSS)
- Animación de blur en los carretes mientras giran (`.reel.spinning`).
- Pulso verde en los carretes ganadores (`.reel.winning`).
- Flash en el contador de créditos al ganar (`.credits-value.flash`).
- Slide-down en el banner de sesión y el indicador de borrador.

## Estructura del proyecto

```
gambling/
├── index.html          # Página de inicio
├── juegos.html         # Tragamonedas
├── soporte.html        # Formulario de contacto y FAQ
├── README.md
└── assets/
    ├── css/
    │   └── styles.css
    ├── js/
    │   └── script.js
    └── data/
        └── games.json  # Configuración y símbolos
```

## Desafíos resueltos

- **fetch() con file://**: los navegadores bloquean fetch desde `file://` por CORS. Se implementó un bloque `try/catch` con datos de respaldo para que el juego funcione incluso sin servidor local.
- **Animación reel**: reiniciar una animación CSS en el mismo elemento requiere forzar un reflow (`void el.offsetWidth`) antes de re-añadir la clase.
- **Persistencia selectiva**: se separó el estado del juego del borrador del formulario usando claves distintas en LocalStorage para evitar colisiones.
