const ICONS = ['🍎', '🍌', '🍇', '🍓', '🍒', '🍍', '🥝', '🍉', '🍋', '🍐', '🥭', '🌽', '🥕', '🥑', '🥦', '🍄', '🍔', '🍕'];

let state = {
    config: {},
    round: 1,
    time: 0,
    timer: null,
    players: [],
    currentPlayerIdx: 0,
    matchedPairs: 0,
    flipped: [],
    history: []
};

const shuffle = (array) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};

const getInitialTime = (diff) => {
    const map = { easy: 180, normal: 120, hard: 60 };
    return map[diff] || 180;
};

const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

const switchScreen = (id) => {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
};

const createBoard = () => {
    const board = document.getElementById('game-board');
    const total = state.config.size;
    const iconsNeeded = ICONS.slice(0, total / 2);
    const deck = shuffle([...iconsNeeded, ...iconsNeeded]);

    board.innerHTML = '';
    board.style.gridTemplateColumns = `repeat(${state.config.size === 16 ? 4 : state.config.size === 36 ? 6 : 5}, 1fr)`;

    deck.forEach((icon, i) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.val = icon;
        card.dataset.id = i;
        card.textContent = icon;
        card.onclick = () => handleCardClick(card);
        board.appendChild(card);
    });
};

const handleCardClick = (card) => {
    if (state.flipped.length === 2 || card.classList.contains('flipped') || card.classList.contains('matched')) return;

    card.classList.add('flipped');
    state.flipped.push(card);

    if (state.flipped.length === 2) {
        state.players[state.currentPlayerIdx].moves++;
        const [a, b] = state.flipped;

        if (a.dataset.val === b.dataset.val) {
            a.classList.add('matched');
            b.classList.add('matched');
            state.matchedPairs++;
            state.players[state.currentPlayerIdx].score++;
            state.flipped = [];
            if (state.matchedPairs === state.config.size / 2) endRound();
        } else {
            setTimeout(() => {
                a.classList.remove('flipped');
                b.classList.remove('flipped');
                state.flipped = [];
                if (state.config.mode === 2) {
                    state.currentPlayerIdx = (state.currentPlayerIdx + 1) % 2;
                }
                updateStats();
            }, 1000);
        }
    }
    updateStats();
};

const updateStats = () => {
    document.getElementById('stat-round').textContent = `Раунд ${state.round}/${state.config.rounds}`;
    document.getElementById('stat-timer').textContent = `Час: ${formatTime(state.time)}`;
    const p = state.players[state.currentPlayerIdx];
    document.getElementById('stat-turn').textContent = state.config.mode === 2 ? `Хід: ${p.name}` : `Ходи: ${p.moves}`;
};

const startTimer = () => {
    clearInterval(state.timer);
    state.timer = setInterval(() => {
        state.time--;
        updateStats();
        if (state.time <= 0) endRound();
    }, 1000);
};

const endRound = () => {
    clearInterval(state.timer);
    state.history.push({
        round: state.round,
        results: state.players.map(p => ({ ...p, time: getInitialTime(state.config.diff) - state.time }))
    });

    if (state.round < state.config.rounds) {
        state.round++;
        initRound();
    } else {
        showFinalResults();
    }
};

const initRound = () => {
    state.time = getInitialTime(state.config.diff);
    state.matchedPairs = 0;
    state.flipped = [];
    state.players = state.players.map(p => ({ ...p, moves: 0, score: 0 }));
    createBoard();
    updateStats();
    startTimer();
};

const showFinalResults = () => {
    switchScreen('results-view');
    const container = document.getElementById('final-stats');
    const winnerHeading = document.getElementById('final-winner');
    let html = '<table><tr><th>Раунд</th><th>Гравець</th><th>Ходи</th><th>Піднято пар</th><th>Час</th></tr>';

    let totalP1 = 0;
    let totalP2 = 0;

    state.history.forEach(h => {
        h.results.forEach((r, idx) => {
            html += `<tr><td>${h.round}</td><td>${r.name}</td><td>${r.moves}</td><td>${r.score}</td><td>${formatTime(r.time)}</td></tr>`;
            if (state.config.mode === 2) {
                if (idx === 0) totalP1 += r.score;
                if (idx === 1) totalP2 += r.score;
            }
        });
    });
    html += '</table>';
    container.innerHTML = html;

    if (state.config.mode === 2) {
        if (totalP1 > totalP2) {
            winnerHeading.textContent = `Переможець: ${state.players[0].name} (${totalP1} пар)`;
        } else if (totalP2 > totalP1) {
            winnerHeading.textContent = `Переможець: ${state.players[1].name} (${totalP2} пар)`;
        } else {
            winnerHeading.textContent = `Нічия! (по ${totalP1} пар)`;
        }
    } else {
        winnerHeading.textContent = 'Гру завершено';
    }
};

document.getElementById('mode').onchange = (e) => {
    document.getElementById('p2-field').classList.toggle('hidden', e.target.value === '1');
};

document.getElementById('btn-start').onclick = () => {
    state.config = {
        size: parseInt(document.getElementById('grid-size').value),
        diff: document.getElementById('difficulty').value,
        mode: parseInt(document.getElementById('mode').value),
        rounds: parseInt(document.getElementById('rounds-count').value)
    };
    state.players = [{ name: document.getElementById('p1-name').value, moves: 0, score: 0 }];
    if (state.config.mode === 2) {
        state.players.push({ name: document.getElementById('p2-name').value, moves: 0, score: 0 });
    }
    state.round = 1;
    state.history = [];
    switchScreen('game-view');
    initRound();
};

document.getElementById('btn-reset').onclick = () => {
    document.getElementById('grid-size').value = '16';
    document.getElementById('difficulty').value = 'easy';
    document.getElementById('mode').value = '1';
    document.getElementById('rounds-count').value = '1';
    document.getElementById('p2-field').classList.add('hidden');
};

document.getElementById('btn-restart').onclick = initRound;
document.getElementById('btn-quit').onclick = () => {
    clearInterval(state.timer);
    switchScreen('settings-view');
};
document.getElementById('btn-new-game').onclick = () => switchScreen('settings-view');