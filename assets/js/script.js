const symbols = ['🍒', '🍋', '🔔', '💎', '7️⃣', '🍀'];

function playGame() {
    const btn = document.getElementById('spin-btn');
    const status = document.getElementById('game-status');
    const reels = [
        document.getElementById('reel1'),
        document.getElementById('reel2'),
        document.getElementById('reel3')
    ];

    btn.disabled = true;
    status.innerText = "Girando...";

    let count = 0;
    const timer = setInterval(() => {
        reels.forEach(r => {
            r.innerText = symbols[Math.floor(Math.random() * symbols.length)];
        });
        
        if (++count >= 15) {
            clearInterval(timer);
            btn.disabled = false;
            
            const results = reels.map(r => r.innerText);
            if (results[0] === results[1] && results[1] === results[2]) {
                status.innerText = "¡GANASTE! 🏆";
                status.style.color = "#00e701";
            } else {
                status.innerText = "Sigue intentando";
                status.style.color = "#fff";
            }
        }
    }, 80);
}

function handleContact(e) {
    e.preventDefault();
    document.getElementById('form-msg').style.display = 'block';
    e.target.reset();
}