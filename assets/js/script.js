// ── Nav: marca el enlace activo según la página actual ──
(function () {
    const page = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav a').forEach(link => {
        if (link.getAttribute('href') === page) link.classList.add('active');
    });
})();

// ── Tragamonedas ──
const symbols = [
    { icon: '7️⃣', prize: 150 },
    { icon: '💎', prize: 100 },
    { icon: '🍀', prize: 80  },
    { icon: '🔔', prize: 60  },
    { icon: '🍋', prize: 40  },
    { icon: '🍒', prize: 30  },
];

let credits = 100;
let wins    = 0;
let spins   = 0;
const BET   = 10;

function updateUI() {
    const creditsEl = document.getElementById('credits');
    const winsEl    = document.getElementById('wins-count');
    const spinsEl   = document.getElementById('spins-count');
    if (creditsEl) creditsEl.textContent = credits;
    if (winsEl)    winsEl.textContent    = wins;
    if (spinsEl)   spinsEl.textContent   = spins;
}

function playGame() {
    const btn    = document.getElementById('spin-btn');
    const status = document.getElementById('game-status');
    const reels  = [
        document.getElementById('reel1'),
        document.getElementById('reel2'),
        document.getElementById('reel3'),
    ];

    if (!btn || credits < BET) {
        if (status) {
            status.textContent = 'Sin créditos — reinicia el juego.';
            status.style.color = '#ff4d4d';
        }
        return;
    }

    credits -= BET;
    spins++;
    updateUI();

    btn.disabled = true;
    status.textContent = 'Girando...';
    status.style.color = 'var(--text-muted)';
    reels.forEach(r => r.classList.remove('winning'));

    let ticks = 0;
    const timer = setInterval(() => {
        reels.forEach(r => {
            r.textContent = symbols[Math.floor(Math.random() * symbols.length)].icon;
        });

        if (++ticks >= 15) {
            clearInterval(timer);
            btn.disabled = false;

            const results = reels.map(r => r.textContent);
            const match   = symbols.find(s => s.icon === results[0]);

            if (results[0] === results[1] && results[1] === results[2] && match) {
                credits += match.prize;
                wins++;
                updateUI();
                reels.forEach(r => r.classList.add('winning'));
                status.textContent = `¡GANASTE! +${match.prize} créditos 🏆`;
                status.style.color = 'var(--accent-green)';
            } else {
                status.textContent = 'Sigue intentando — apuesta: 10 créditos';
                status.style.color = 'var(--text-muted)';
            }
        }
    }, 80);
}

function resetGame() {
    credits = 100;
    wins    = 0;
    spins   = 0;
    updateUI();

    const reels  = ['reel1', 'reel2', 'reel3'].map(id => document.getElementById(id));
    const status = document.getElementById('game-status');

    reels.forEach(r => { if (r) { r.textContent = '💎'; r.classList.remove('winning'); } });
    if (status) { status.textContent = '¡Haz clic en girar! — Apuesta: 10 créditos'; status.style.color = 'var(--text-muted)'; }

    const btn = document.getElementById('spin-btn');
    if (btn) btn.disabled = false;
}

// ── Formulario de soporte ──
function handleContact(e) {
    e.preventDefault();
    const msg = document.getElementById('form-msg');
    if (msg) msg.style.display = 'block';
    e.target.reset();
}
