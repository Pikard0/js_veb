class Slider {
    constructor(containerSelector, config) {
        this.container = document.querySelector(containerSelector);

        this.config = {
            images: [],
            duration: 500,
            autoplay: false,
            autoplayDelay: 3000,
            showArrows: true,
            showDots: true,
            ...config
        };

        this.currentIndex = 0;
        this.isPaused = false;
        this.timer = null;

        this.init();
    }

    init() {
        if (!this.config.images.length) return;

        this.render();
        this.track = this.container.querySelector('.slider-track');
        this.dots = this.container.querySelectorAll('.dot');

        this.track.style.transitionDuration = `${this.config.duration}ms`;

        this.addEventListeners();
        if (this.config.autoplay) this.startAutoplay();
    }

    render() {
        let arrowsHTML = this.config.showArrows ? `
            <button class="slider-arrow prev" aria-label="Назад">&#10094;</button>
            <button class="slider-arrow next" aria-label="Вперед">&#10095;</button>
        ` : '';

        let dotsHTML = this.config.showDots ? `
            <div class="slider-dots">
                ${this.config.images.map((_, i) => `<div class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`).join('')}
            </div>
        ` : '';

        let slidesHTML = this.config.images.map(img => `
            <div class="slide">
                <img src="${img.src}" alt="${img.alt}">
                ${img.caption ? `<div class="slide-caption">${img.caption}</div>` : ''}
            </div>
        `).join('');

        this.container.innerHTML = `
            <div class="slider-wrapper">
                <div class="slider-track">${slidesHTML}</div>
                ${arrowsHTML}
                ${dotsHTML}
            </div>
        `;
    }

    goTo(index) {
        const total = this.config.images.length;

        if (index >= total) {
            this.currentIndex = 0;
        } else if (index < 0) {
            this.currentIndex = total - 1;
        } else {
            this.currentIndex = index;
        }

        this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;

        if (this.config.showDots) {
            this.dots.forEach(dot => dot.classList.remove('active'));
            this.dots[this.currentIndex].classList.add('active');
        }
    }

    next() { this.goTo(this.currentIndex + 1); }
    prev() { this.goTo(this.currentIndex - 1); }

    startAutoplay() {
        this.timer = setInterval(() => {
            if (!this.isPaused) this.next();
        }, this.config.autoplayDelay);
    }

    addEventListeners() {
        if (this.config.showArrows) {
            this.container.querySelector('.next').onclick = () => this.next();
            this.container.querySelector('.prev').onclick = () => this.prev();
        }

        if (this.config.showDots) {
            this.container.querySelector('.slider-dots').onclick = (e) => {
                if (e.target.classList.contains('dot')) {
                    this.goTo(parseInt(e.target.dataset.index));
                }
            };
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') this.next();
            if (e.key === 'ArrowLeft') this.prev();
        });

        this.container.addEventListener('mouseenter', () => this.isPaused = true);
        this.container.addEventListener('mouseleave', () => this.isPaused = false);
    }
}