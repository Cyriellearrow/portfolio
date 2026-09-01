/**
 * script.js
 * Interactions de la page projet "CCPNMR v3 to Cyana Convertor"
 * - Révélation des sections au scroll (IntersectionObserver)
 * - Compteurs animés dans la section "En chiffres"
 * - Bouton "Copier" pour la commande git clone
 */

(function () {
    'use strict';

    const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    ).matches;

    /* -----------------------------------------
       1. Révélation des sections au scroll
    ----------------------------------------- */
    function initScrollReveal() {
        const sections = document.querySelectorAll('section');

        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            // Pas d'animation : tout est visible directement
            sections.forEach((section) => section.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
        );

        sections.forEach((section) => {
            section.classList.add('reveal');
            observer.observe(section);
        });
    }

    /* -----------------------------------------
       2. Compteurs animés (section "En chiffres")
    ----------------------------------------- */
    function animateCounter(el, duration) {
        const raw = el.textContent.trim();
        const match = raw.match(/^(\d+)(.*)$/); // sépare le nombre du suffixe (%, " mois"...)

        if (!match) return; // rien à animer (texte non numérique)

        const target = parseInt(match[1], 10);
        const suffix = match[2] || '';
        const start = performance.now();

        function step(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubique
            const value = Math.round(eased * target);
            el.textContent = value + suffix;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target + suffix;
            }
        }

        requestAnimationFrame(step);
    }

    function initCounters() {
        const statsGrid = document.querySelector('.stats-grid');
        if (!statsGrid) return;

        const numbers = statsGrid.querySelectorAll('.stat-number');

        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            return; // on laisse les valeurs statiques telles quelles
        }

        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        numbers.forEach((el) => animateCounter(el, 1200));
                        obs.disconnect();
                    }
                });
            },
            { threshold: 0.4 }
        );

        observer.observe(statsGrid);
    }

    /* -----------------------------------------
       3. Bouton "Copier" (commande git clone)
    ----------------------------------------- */
    function initCopyButton() {
        const copyBtn = document.getElementById('copy-btn');
        const cloneCmd = document.getElementById('clone-cmd');

        if (!copyBtn || !cloneCmd) return;

        let resetTimeout = null;

        copyBtn.addEventListener('click', async () => {
            const text = cloneCmd.textContent.trim();

            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(text);
                } else {
                    // Solution de repli pour les contextes non sécurisés / anciens navigateurs
                    const textarea = document.createElement('textarea');
                    textarea.value = text;
                    textarea.style.position = 'fixed';
                    textarea.style.opacity = '0';
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                }

                showCopyFeedback('✅ Copié !', true);
            } catch (err) {
                showCopyFeedback('❌ Erreur', false);
            }
        });

        function showCopyFeedback(message, success) {
            clearTimeout(resetTimeout);

            const original = '📋 Copier';
            copyBtn.textContent = message;
            copyBtn.classList.toggle('copied', success);
            copyBtn.setAttribute('aria-live', 'polite');

            resetTimeout = setTimeout(() => {
                copyBtn.textContent = original;
                copyBtn.classList.remove('copied');
            }, 2000);
        }
    }

    /* -----------------------------------------
       Initialisation
    ----------------------------------------- */
    document.addEventListener('DOMContentLoaded', () => {
        initScrollReveal();
        initCounters();
        initCopyButton();
    });
})();
