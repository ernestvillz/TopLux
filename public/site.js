/* Top Lux — hero search + testimonial slider.
   Plain script, independent from the booking/login code: if it fails, the rest
   of the site keeps working. */
(function () {
    'use strict';

    // ---- Hero search: filters the collection by make, model or category ----
    try {
        var form = document.getElementById('heroSearch');
        var input = document.getElementById('heroSearchInput');
        var count = document.getElementById('inventoryCount');
        var empty = document.getElementById('searchEmpty');
        var allButton = document.querySelector('.filter[data-filter="all"]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.car-card'));
        var pills = document.querySelectorAll('.filter');

        var pad = function (n) { return (n < 10 ? '0' : '') + n; };

        var runSearch = function (query) {
            var tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
            var visible = 0;

            if (allButton) allButton.click(); // reset category pills first

            cards.forEach(function (card) {
                var text = (card.textContent + ' ' + (card.dataset.category || ''))
                    .toLowerCase().replace(/\s+/g, ' ');
                var show = tokens.every(function (token) { return text.indexOf(token) !== -1; });

                card.style.display = show ? '' : 'none';
                if (show) visible++;
            });

            if (count) count.textContent = pad(visible) + ' vehicles';
            if (empty) empty.hidden = visible !== 0;
        };

        if (form && input) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                runSearch(input.value.trim());

                var target = document.getElementById('collection');
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            });

            // Clearing the box brings every car back
            input.addEventListener('input', function () {
                if (input.value === '') runSearch('');
            });

            // Picking a category pill clears the "no results" note
            Array.prototype.forEach.call(pills, function (pill) {
                pill.addEventListener('click', function () {
                    if (empty) empty.hidden = true;
                });
            });
        }
    } catch (error) {
        console.warn('Search disabled:', error);
    }

    // ---- Testimonial slider --------------------------------------------------
    try {
        var slides = document.querySelectorAll('.t-slide');
        var dots = document.querySelectorAll('.t-dot');
        var prev = document.querySelector('[data-t-prev]');
        var next = document.querySelector('[data-t-next]');
        var section = document.getElementById('testimonials');

        if (slides.length > 1) {
            var current = 0;
            var timer = null;

            var show = function (index) {
                current = (index + slides.length) % slides.length;

                Array.prototype.forEach.call(slides, function (slide, i) {
                    slide.classList.toggle('active', i === current);
                });

                Array.prototype.forEach.call(dots, function (dot, i) {
                    dot.classList.toggle('active', i === current);
                });
            };

            var stop = function () {
                if (timer) { window.clearInterval(timer); timer = null; }
            };

            var start = function () {
                stop();
                var reduce = window.matchMedia &&
                    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

                if (!reduce) {
                    timer = window.setInterval(function () { show(current + 1); }, 7000);
                }
            };

            if (prev) prev.addEventListener('click', function () { show(current - 1); start(); });
            if (next) next.addEventListener('click', function () { show(current + 1); start(); });

            Array.prototype.forEach.call(dots, function (dot, i) {
                dot.addEventListener('click', function () { show(i); start(); });
            });

            if (section) {
                section.addEventListener('mouseenter', stop);
                section.addEventListener('mouseleave', start);
                section.addEventListener('focusin', stop);
                section.addEventListener('focusout', start);
            }

            start();
        }
    } catch (error) {
        console.warn('Slider disabled:', error);
    }
})();
