/**
 * Biodata Book – Single-Page Flip Controller
 * Each page is an independent card that flips from the left edge.
 * Supports: touch swipe, click/tap, keyboard, nav buttons, dot indicators.
 */
(function () {
    'use strict';

    const pages = document.querySelectorAll('.page');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const swipeHint = document.getElementById('swipeHint');
    const book = document.getElementById('book');

    const totalPages = pages.length; // 8 pages (index 0–7)
    let currentPage = 0;            // index of the top visible (unflipped) page
    let isAnimating = false;
    const ANIM_MS = 900;            // matches CSS transition duration

    // Touch
    let touchStartX = 0;
    let touchStartY = 0;
    const SWIPE_THRESHOLD = 45;

    /* ---------- Init ---------- */
    function init() {
        updateUI();
        bindEvents();
        // Auto-dismiss hint after 3.5s
        setTimeout(dismissHint, 3500);
    }

    /* ---------- Hint ---------- */
    function dismissHint() {
        if (swipeHint) swipeHint.classList.add('hidden');
    }

    /* ---------- Flip Logic ---------- */
    function flipForward() {
        if (isAnimating || currentPage >= totalPages - 1) return;
        dismissHint();
        isAnimating = true;

        pages[currentPage].classList.add('flipped');
        currentPage++;
        updateUI();

        setTimeout(() => { isAnimating = false; }, ANIM_MS);
    }

    function flipBackward() {
        if (isAnimating || currentPage <= 0) return;
        dismissHint();
        isAnimating = true;

        currentPage--;
        pages[currentPage].classList.remove('flipped');
        updateUI();

        setTimeout(() => { isAnimating = false; }, ANIM_MS);
    }

    function goToPage(target) {
        if (isAnimating || target === currentPage) return;
        dismissHint();

        if (target > currentPage) {
            const step = () => {
                if (currentPage < target) {
                    pages[currentPage].classList.add('flipped');
                    currentPage++;
                    updateUI();
                    setTimeout(step, 120);
                }
            };
            step();
        } else {
            const step = () => {
                if (currentPage > target) {
                    currentPage--;
                    pages[currentPage].classList.remove('flipped');
                    updateUI();
                    setTimeout(step, 120);
                }
            };
            step();
        }
    }

    /* ---------- UI State ---------- */
    function updateUI() {
        // Dots
        dots.forEach((d, i) => d.classList.toggle('active', i === currentPage));

        // Arrows
        prevBtn.classList.toggle('disabled', currentPage === 0);
        nextBtn.classList.toggle('disabled', currentPage >= totalPages - 1);
    }

    /* ---------- Events ---------- */
    function bindEvents() {
        // Touch
        book.addEventListener('touchstart', onTouchStart, { passive: true });
        book.addEventListener('touchend', onTouchEnd, { passive: true });

        // Click on book halves
        book.addEventListener('click', onBookClick);

        // Nav buttons
        prevBtn.addEventListener('click', (e) => { e.stopPropagation(); flipBackward(); });
        nextBtn.addEventListener('click', (e) => { e.stopPropagation(); flipForward(); });

        // Dots
        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                goToPage(parseInt(dot.dataset.page, 10));
            });
        });

        // Keyboard
        document.addEventListener('keydown', onKey);

        // Dismiss hint on first interaction
        document.addEventListener('touchstart', dismissHint, { once: true });
        document.addEventListener('click', dismissHint, { once: true });
    }

    function onTouchStart(e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }

    function onTouchEnd(e) {
        const dx = touchStartX - e.changedTouches[0].screenX;
        const dy = Math.abs(e.changedTouches[0].screenY - touchStartY);

        if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > dy) {
            dx > 0 ? flipForward() : flipBackward();
        }
    }

    function onBookClick(e) {
        const rect = book.getBoundingClientRect();
        const x = e.clientX - rect.left;
        x > rect.width / 2 ? flipForward() : flipBackward();
    }

    function onKey(e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') flipForward();
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') flipBackward();
    }

    /* ---------- Music Controller ---------- */
    const bgMusic = document.getElementById('bgMusic');
    const musicToggle = document.getElementById('musicToggle');
    const musicIcon = document.getElementById('musicIcon');
    const musicLabel = document.getElementById('musicLabel');
    let isMusicPlaying = false;

    function setupMusic() {
        if (!bgMusic || !musicToggle) return;

        // Set comfortable background volume
        bgMusic.volume = 0.4;

        musicToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMusic();
        });
    }

    function toggleMusic() {
        if (!bgMusic) return;

        if (isMusicPlaying) {
            bgMusic.pause();
            musicIcon.textContent = '🔇';
            musicIcon.classList.remove('playing');
            musicIcon.classList.add('muted');
            musicLabel.textContent = 'Play Music';
            isMusicPlaying = false;
        } else {
            bgMusic.play().then(() => {
                musicIcon.textContent = '🎵';
                musicIcon.classList.remove('muted');
                musicIcon.classList.add('playing');
                musicLabel.textContent = 'Pause';
                isMusicPlaying = true;
            }).catch(() => {
                // Autoplay blocked — will work on next user interaction
                musicLabel.textContent = 'Tap again';
            });
        }
    }

    /* ---------- Start ---------- */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { init(); setupMusic(); });
    } else {
        init();
        setupMusic();
    }
})();
