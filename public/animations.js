/* Top Lux — motion layer (progressive enhancement).
   If anything here fails, the site simply stays as it was: nothing is hidden
   until this script has finished setting up successfully. */
(function () {
    'use strict';

    try {
        var reduceMotion = window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (reduceMotion || !('IntersectionObserver' in window)) {
            return;
        }

        var root = document.documentElement;
        var header = document.querySelector('.site-header');

        // ---- 1. Scroll progress bar + header shadow + image parallax ------

        var bar = document.createElement('div');
        bar.className = 'scroll-progress';
        bar.setAttribute('aria-hidden', 'true');
        document.body.appendChild(bar);

        var parallaxBox = document.querySelector('.manifesto-image');

        if (parallaxBox) {
            parallaxBox.classList.add('parallax');
        }

        var ticking = false;

        function update() {
            ticking = false;

            var y = window.pageYOffset || root.scrollTop;
            var max = root.scrollHeight - window.innerHeight;

            bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';

            if (header) {
                header.classList.toggle('is-scrolled', y > 8);
            }

            if (parallaxBox) {
                var rect = parallaxBox.getBoundingClientRect();
                var vh = window.innerHeight;

                if (rect.bottom > 0 && rect.top < vh) {
                    var progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
                    progress = Math.max(-1, Math.min(1, progress));
                    parallaxBox.style.setProperty('--py', (progress * -5).toFixed(2));
                }
            }
        }

        function onScroll() {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(update);
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        update();

        // ---- 2. Scroll reveals ---------------------------------------------
        // Only elements that start below the fold are hidden, so there is
        // never a flash on load and anything already visible is left alone.

        var groups = [
            { selector: '.section-heading', step: 0 },
            { selector: '.benefits-head', step: 0 },
            { selector: '.benefit-card', step: 0.1, columns: 4 },
            { selector: '.testimonial-card', step: 0 },
            { selector: '.testimonial-head > *', step: 0.1 },
            { selector: '.filter-row', step: 0 },
            { selector: '.car-card', step: 0.11, columns: 3 },
            { selector: '.collection-footer', step: 0 },
            { selector: '.manifesto-image', step: 0, wipe: true },
            { selector: '.manifesto-copy > :not(.stats)', step: 0.1 },
            { selector: '.stats > div', step: 0.12 },
            { selector: '.journal-grid article', step: 0.12 },
            { selector: '.contact > *', step: 0.14 }
        ];

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

        groups.forEach(function (group) {
            var nodes = document.querySelectorAll(group.selector);

            Array.prototype.forEach.call(nodes, function (node, index) {
                if (node.getBoundingClientRect().top < window.innerHeight) {
                    return; // already on screen at load — leave it as is
                }

                var slot = group.columns ? index % group.columns : index;

                node.classList.add(group.wipe ? 'reveal-wipe' : 'reveal');
                node.style.setProperty('--d', (slot * group.step).toFixed(2) + 's');
                observer.observe(node);
            });
        });

        // ---- 3. Count-up for the statistics ---------------------------------

        var counters = document.querySelectorAll('.stats strong');

        var counterObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;

                counterObserver.unobserve(entry.target);
                countUp(entry.target);
            });
        }, { threshold: 0.6 });

        function countUp(el) {
            var original = el.getAttribute('data-final');
            var match = /^(\d+)(\D*)$/.exec(original);

            if (!match) return;

            var target = parseInt(match[1], 10);
            var width = match[1].length;
            var suffix = match[2];
            var duration = 1400;
            var start = null;

            function frame(now) {
                if (start === null) start = now;

                var t = Math.min((now - start) / duration, 1);
                var eased = 1 - Math.pow(1 - t, 3);
                var value = String(Math.round(target * eased));

                while (value.length < width) value = '0' + value;

                el.textContent = t < 1 ? value + suffix : original;

                if (t < 1) window.requestAnimationFrame(frame);
            }

            window.requestAnimationFrame(frame);
        }

        Array.prototype.forEach.call(counters, function (el) {
            var text = el.textContent.trim();
            var match = /^(\d+)(\D*)$/.exec(text);

            if (!match) return;

            el.setAttribute('data-final', text);

            // Start from zero only if it is below the fold
            if (el.getBoundingClientRect().top >= window.innerHeight) {
                el.textContent = match[1].replace(/\d/g, '0') + match[2];
                counterObserver.observe(el);
            }
        });

        // Everything is set up: now it is safe to hide-and-reveal.
        root.classList.add('anim-js');
    } catch (error) {
        console.warn('Top Lux animations disabled:', error);
    }
})();
