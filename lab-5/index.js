class Task_1 {
    constructor(elementId) {
        this.elementId = elementId;
        this.isOn = false;
        this.type = 'звичайна';
        this.brightness = 100;
        this.autoOffTimer = null;
    }

    toggle() {
        this.isOn = !this.isOn;
        this.updateDOM();
        this.resetAutoOff();
    }

    setType(newType) {
        this.type = newType;
        console.log("Тип змінено на:", this.type);
        this.updateDOM();
    }

    setBrightness() {
        if (this.type === 'звичайна') {
            alert("Неможливо змінити яскравість для звичайної лампочки");
            return;
        }
        let level = prompt("Яскравість (0-100):", "100");
        if (level !== null && !isNaN(level)) {
            this.brightness = level;
            this.updateDOM();
        }
    }

    resetAutoOff() {
        clearTimeout(this.autoOffTimer);
        if (this.isOn) {
            this.autoOffTimer = setTimeout(() => {
                this.isOn = false;
                this.updateDOM();
                console.log("Автовимкнення");
            }, 300000);
        }
    }

    updateDOM() {
        const el = document.getElementById(this.elementId);
        if (!el) return;

        if (this.isOn) {
            el.className = 'bulb-on';
            el.style.opacity = this.brightness / 100;

            if (this.type === 'світлодіодна') {
                el.style.backgroundColor = '#00e5ff';
                el.style.boxShadow = '0 0 30px #00e5ff';
            } else {
                el.style.backgroundColor = '#ffeb3b';
                el.style.boxShadow = '0 0 30px #ffeb3b';
            }
        } else {
            el.className = 'bulb-off';
            el.style.opacity = 1;
            el.style.backgroundColor = '';
            el.style.boxShadow = '';
        }
    }
}

class Task_2 {
    constructor() {
        this.durations = { red: 5000, yellow: 3000, green: 7000 };
        this.currentState = 'red';
        this.timer = null;
    }

    setDurations() {
        this.durations.red = prompt("Червоний (мс):", 5000) || 5000;
        this.durations.yellow = prompt("Жовтий (мс):", 3000) || 3000;
        this.durations.green = prompt("Зелений (мс):", 7000) || 7000;
    }

    startTrafficLight() {
        this.switchState('green');
    }

    switchState(state) {
        clearTimeout(this.timer);
        this.currentState = state;
        this.render(state);

        let nextState, delay;
        switch (state) {
            case 'green': nextState = 'yellow'; delay = this.durations.green; break;
            case 'yellow': nextState = 'red'; delay = this.durations.yellow; break;
            case 'red': nextState = 'blinking-yellow'; delay = this.durations.red; break;
            case 'blinking-yellow':
                this.blinkYellow();
                this.timer = setTimeout(() => this.switchState('green'), 3000);
                return;
        }
        this.timer = setTimeout(() => this.switchState(nextState), delay);
    }

    blinkYellow() {
        let count = 0;
        let blinkInterval = setInterval(() => {
            let text = count % 2 === 0 ? "мигає" : "вимкнено";
            this.updateDOM(count % 2 === 0 ? 'yellow' : 'off');
            console.log(text);
            count++;
            if (count >= 6) {
                clearInterval(blinkInterval);
                this.updateDOM('off');
            }
        }, 500);
    }

    manualNext() {
        const sequence = { 'green': 'yellow', 'yellow': 'red', 'red': 'green', 'blinking-yellow': 'green' };
        this.switchState(sequence[this.currentState]);
    }

    render(state) {
        console.log(state);
        this.updateDOM(state);
    }

    updateDOM(state) {
        const red = document.getElementById('tl-red');
        const yellow = document.getElementById('tl-yellow');
        const green = document.getElementById('tl-green');
        if (!red || !yellow || !green) return;

        red.className = 'light';
        yellow.className = 'light';
        green.className = 'light';

        if (state === 'red') red.classList.add('light-red');
        if (state === 'yellow') yellow.classList.add('light-yellow');
        if (state === 'green') green.classList.add('light-green');
    }
}

class Task_3 {
    constructor() {
        this.clockInterval = null;
        this.countdownInterval = null;
    }

    startDigitalClock(elementId) {
        this.clockInterval = setInterval(() => {
            const el = document.getElementById(elementId);
            if (!el) return;

            const now = new Date();
            const h = now.getHours().toString().padStart(2, '0');
            const m = now.getMinutes().toString().padStart(2, '0');
            const s = now.getSeconds().toString().padStart(2, '0');
            const sep = now.getSeconds() % 2 === 0 ? ':' : ' ';
            el.innerText = `${h}${sep}${m}${sep}${s}`;
        }, 1000);
    }

    startCountdown(targetDateStr, elementId) {
        if(!targetDateStr) return;
        clearInterval(this.countdownInterval);
        this.countdownInterval = setInterval(() => {
            const el = document.getElementById(elementId);
            if (!el) return;

            const diff = new Date(targetDateStr).getTime() - new Date().getTime();
            if (diff < 0) {
                clearInterval(this.countdownInterval);
                el.innerText = "Кінець";
                return;
            }
            const d = Math.floor(diff / 86400000);
            const h = Math.floor((diff % 86400000) / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            el.innerText = `${d}д ${h}г ${m}хв ${s}с`;
        }, 1000);
    }

    calculateBirthday(dateStr) {
        if(!dateStr) return;
        const now = new Date();
        let bday = new Date(dateStr);
        bday.setFullYear(now.getFullYear());
        if (now > bday) bday.setFullYear(now.getFullYear() + 1);

        const diff = bday - now;
        const m = Math.floor(diff / 2629746000);
        const d = Math.floor((diff % 2629746000) / 86400000);
        console.log(`Залишилось: ${m} міс, ${d} днів`);
    }
}

class Task_4 {
    constructor() {
        this.products = new Map();
        this.orders = new Set();
        this.productHistory = new WeakMap();
        this.activeUsers = new WeakSet();
    }

    addProduct(id, name, price, quantity) {
        const p = { id, name, price, quantity };
        this.products.set(id, p);
        this.productHistory.set(p, [{action: 'add', time: new Date()}]);
        console.log("Додано:", name);
    }

    removeProduct(id) {
        this.products.delete(id);
        console.log("Видалено", id);
    }

    updateProduct(id, price, quantity) {
        if (this.products.has(id)) {
            let p = this.products.get(id);
            p.price = price;
            p.quantity = quantity;
            this.productHistory.get(p).push({action: 'update', time: new Date()});
            console.log("Оновлено:", p.name);
        }
    }

    searchByName(name) {
        for (let [id, p] of this.products) {
            if (p.name.toLowerCase() === name.toLowerCase()) return p;
        }
        return "Не знайдено";
    }

    placeOrder(id, user) {
        if (this.products.has(id)) {
            let p = this.products.get(id);
            if (p.quantity > 0) {
                p.quantity--;
                this.orders.add({ id, time: new Date() });
                this.activeUsers.add(user);
                console.log("Замовлено:", p.name);
            } else {
                console.log("Немає в наявності");
            }
        }
    }
}

window.task1 = new Task_1('bulb');
window.task2 = new Task_2();
window.task3 = new Task_3();
window.task4 = new Task_4();

window.onload = () => {
    window.task3.startDigitalClock('clock');
};

window.runTask4Demo = () => {
    window.task4.addProduct(1, "Ноутбук", 25000, 5);
    window.task4.updateProduct(1, 24000, 4);
    const user = { name: "Іван" };
    window.task4.placeOrder(1, user);
    console.log(window.task4.searchByName("Ноутбук"));
    console.log("Map:", window.task4.products);
    console.log("Set:", window.task4.orders);
};