// =============================================================
//  GAMBLINGGGGG — Vanilla JS · EA2 Programación Web
// =============================================================

// ── Nav: resalta el enlace activo según la página actual ──────
(function markActiveNav() {
    const page = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav a').forEach(link => {
        if (link.getAttribute('href') === page) link.classList.add('active');
    });
})();

// =============================================================
//  Clase GameStorage — Persiste datos con LocalStorage
// =============================================================
class GameStorage {
    static #STATE_KEY = 'gambling_state';
    static #DRAFT_KEY = 'gambling_draft';

    static saveState(state) {
        localStorage.setItem(this.#STATE_KEY, JSON.stringify(state));
    }

    static loadState() {
        try { return JSON.parse(localStorage.getItem(this.#STATE_KEY)); }
        catch { return null; }
    }

    static clearState() { localStorage.removeItem(this.#STATE_KEY); }

    static saveDraft(draft) {
        localStorage.setItem(this.#DRAFT_KEY, JSON.stringify(draft));
    }

    static loadDraft() {
        try { return JSON.parse(localStorage.getItem(this.#DRAFT_KEY)); }
        catch { return null; }
    }

    static clearDraft() { localStorage.removeItem(this.#DRAFT_KEY); }
}

// =============================================================
//  Clase SlotMachine — Lógica de negocio del tragamonedas
// =============================================================
class SlotMachine {
    #symbols;
    #config;

    constructor(symbols, config, savedState = null) {
        this.#symbols = symbols;
        this.#config  = config;
        this.spinning  = false;

        if (savedState) {
            this.credits = savedState.credits;
            this.wins    = savedState.wins;
            this.spins   = savedState.spins;
        } else {
            this.credits = config.initialCredits;
            this.wins    = 0;
            this.spins   = 0;
        }
    }

    get canSpin()  { return this.credits >= this.#config.betAmount && !this.spinning; }
    get state()    { return { credits: this.credits, wins: this.wins, spins: this.spins }; }
    get symbols()  { return this.#symbols; }
    get config()   { return this.#config; }

    #randomSymbol() {
        return this.#symbols[Math.floor(Math.random() * this.#symbols.length)];
    }

    spin(onTick, onResult) {
        if (!this.canSpin) return;

        this.credits  -= this.#config.betAmount;
        this.spins++;
        this.spinning  = true;
        GameStorage.saveState(this.state);

        let ticks = 0;
        let last  = [];

        const timer = setInterval(() => {
            last = [this.#randomSymbol(), this.#randomSymbol(), this.#randomSymbol()];
            onTick(last);

            if (++ticks >= this.#config.spinTicks) {
                clearInterval(timer);
                this.spinning = false;

                const isWin = last[0].icon === last[1].icon && last[1].icon === last[2].icon;
                if (isWin) {
                    this.credits += last[0].prize;
                    this.wins++;
                }
                GameStorage.saveState(this.state);
                onResult({ win: isWin, prize: isWin ? last[0].prize : 0, symbols: last });
            }
        }, this.#config.tickInterval);
    }

    reset() {
        this.credits  = this.#config.initialCredits;
        this.wins     = 0;
        this.spins    = 0;
        this.spinning = false;
        GameStorage.clearState();
    }
}

// =============================================================
//  Módulo de UI — Manipulación del DOM (juegos.html)
// =============================================================
function updateGameUI(machine) {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('credits',     machine.credits);
    set('wins-count',  machine.wins);
    set('spins-count', machine.spins);
}

function flashCredits() {
    const el = document.getElementById('credits');
    if (!el) return;
    el.classList.remove('flash');
    void el.offsetWidth;          // forzar reflow para reiniciar animación
    el.classList.add('flash');
}

function setStatus(text, color = 'var(--text-muted)') {
    const el = document.getElementById('game-status');
    if (el) { el.textContent = text; el.style.color = color; }
}

// =============================================================
//  Inicialización del juego — Fetch + eventos
// =============================================================
async function initGame() {
    if (!document.getElementById('spin-btn')) return;

    // ── Evento 1: Fetch API — carga símbolos y config desde JSON ──
    let gameData;
    try {
        const res = await fetch('assets/data/games.json');
        if (!res.ok) throw new Error('fetch falló');
        gameData = await res.json();
    } catch {
        // Fallback cuando se abre vía file:// (sin servidor)
        gameData = {
            config: { initialCredits: 100, betAmount: 10, spinTicks: 15, tickInterval: 80 },
            symbols: [
                { icon: '7️⃣', prize: 150, name: 'Siete'    },
                { icon: '💎', prize: 100, name: 'Diamante'  },
                { icon: '🍀', prize:  80, name: 'Trébol'    },
                { icon: '🔔', prize:  60, name: 'Campana'   },
                { icon: '🍋', prize:  40, name: 'Limón'     },
                { icon: '🍒', prize:  30, name: 'Cereza'    },
            ],
        };
    }

    // Renderiza tabla de premios dinámicamente desde el JSON
    const grid = document.getElementById('symbols-grid');
    if (grid) {
        grid.innerHTML = gameData.symbols
            .map(s => `<div class="symbol-row">
                          <span>${s.icon} ${s.icon} ${s.icon}</span>
                          <span class="prize">+${s.prize} créditos</span>
                        </div>`)
            .join('');
    }

    // Restaura sesión anterior desde LocalStorage
    const savedState = GameStorage.loadState();
    const machine    = new SlotMachine(gameData.symbols, gameData.config, savedState);

    if (savedState) {
        const banner = document.getElementById('session-banner');
        const msg    = document.getElementById('session-msg');
        if (banner && msg) {
            msg.textContent = `Sesión anterior restaurada — ${savedState.credits} créditos · ${savedState.wins} victorias · ${savedState.spins} tiradas`;
            banner.style.display = 'flex';
        }
    }

    updateGameUI(machine);
    setStatus(`¡Haz clic en girar! — Apuesta: ${gameData.config.betAmount} créditos`);

    const reelEls  = ['reel1', 'reel2', 'reel3'].map(id => document.getElementById(id));
    const spinBtn  = document.getElementById('spin-btn');
    const resetBtn = document.getElementById('reset-btn');

    // ── Evento 2: click — botón Girar ────────────────────────
    spinBtn.addEventListener('click', () => {
        if (!machine.canSpin) return;

        spinBtn.disabled = true;
        setStatus('Girando...');
        reelEls.forEach(r => { r.classList.remove('winning'); r.classList.add('spinning'); });

        machine.spin(
            (current) => reelEls.forEach((r, i) => r.textContent = current[i].icon),
            (result)  => {
                reelEls.forEach(r => r.classList.remove('spinning'));
                updateGameUI(machine);

                if (result.win) {
                    reelEls.forEach(r => r.classList.add('winning'));
                    setStatus(`¡GANASTE! +${result.prize} créditos 🏆`, 'var(--accent-green)');
                    flashCredits();
                    spinBtn.disabled = false;
                } else if (!machine.canSpin) {
                    setStatus('Sin créditos — reinicia el juego.', '#ff4d4d');
                    spinBtn.disabled = true;
                } else {
                    setStatus(`Sigue intentando — apuesta: ${gameData.config.betAmount} créditos`);
                    spinBtn.disabled = false;
                }
            }
        );
    });

    // ── Evento 3: click — botón Reiniciar ────────────────────
    resetBtn.addEventListener('click', () => {
        machine.reset();
        reelEls.forEach(r => { r.textContent = '💎'; r.classList.remove('winning', 'spinning'); });
        setStatus(`¡Haz clic en girar! — Apuesta: ${gameData.config.betAmount} créditos`);
        spinBtn.disabled = false;
        updateGameUI(machine);
        const banner = document.getElementById('session-banner');
        if (banner) banner.style.display = 'none';
    });

    // ── Evento 4: click — cerrar banner de sesión ────────────
    const dismissBtn = document.getElementById('session-dismiss');
    if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
            document.getElementById('session-banner').style.display = 'none';
        });
    }

    // ── Evento 5: keydown — barra espaciadora para girar ─────
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !e.target.matches('input, textarea, select, button')) {
            e.preventDefault();
            if (machine.canSpin) spinBtn.click();
        }
    });
}

// =============================================================
//  Inicialización del formulario — LocalStorage para borradores
// =============================================================
function initSupport() {
    const form = document.querySelector('form');
    if (!form) return;

    const FIELDS    = ['username', 'subject', 'message'];
    const indicator = document.getElementById('draft-indicator');

    // Restaura borrador guardado
    const draft = GameStorage.loadDraft();
    if (draft) {
        FIELDS.forEach(id => {
            const el = document.getElementById(id);
            if (el && draft[id]) el.value = draft[id];
        });
        if (indicator) indicator.style.display = 'flex';
    }

    // ── Evento 6: input — guarda borrador automáticamente ────
    FIELDS.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('input', () => {
            const current = {};
            FIELDS.forEach(fid => {
                const fel = document.getElementById(fid);
                if (fel) current[fid] = fel.value;
            });
            GameStorage.saveDraft(current);
            if (indicator) indicator.style.display = 'flex';
        });
    });

    // ── Evento 7: submit — limpia borrador al enviar ──────────
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        GameStorage.clearDraft();
        const msg = document.getElementById('form-msg');
        if (msg) msg.style.display = 'block';
        if (indicator) indicator.style.display = 'none';
        form.reset();
    });
}

// =============================================================
//  Arranque
// =============================================================
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    initSupport();
});
