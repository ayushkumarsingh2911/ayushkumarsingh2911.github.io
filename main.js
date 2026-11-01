(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* nav scroll state */
  var nav = document.getElementById('nav');
  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 30); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* reveal on scroll */
  var revealEls = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var siblings = Array.prototype.slice.call(el.parentElement.querySelectorAll(':scope > .reveal'));
          var idx = siblings.indexOf(el);
          el.style.transitionDelay = Math.min(Math.max(idx, 0) * 90, 450) + 'ms';
          el.classList.add('in');
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* rotating role words */
  var words = document.querySelectorAll('.rotator-words span');
  if (words.length) {
    if (reduced) {
      words[0].classList.add('active');
    } else {
      var wi = 0;
      words[0].classList.add('active');
      setInterval(function () {
        var current = words[wi];
        wi = (wi + 1) % words.length;
        var next = words[wi];
        current.classList.remove('active');
        current.classList.add('leaving');
        next.classList.remove('leaving');
        next.classList.add('active');
        setTimeout(function () { current.classList.remove('leaving'); }, 520);
      }, 2600);
    }
  }

  /* count-up metrics */
  var counters = document.querySelectorAll('.count');
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-target'), 10);
    var format = el.getAttribute('data-format');
    if (reduced) { el.textContent = format === 'k' ? '40,000' : String(target); return; }
    var duration = 1800;
    var start = null;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 4);
      var val = Math.round(target * eased);
      el.textContent = format === 'k' ? val.toLocaleString('en-IE') : String(val);
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if ('IntersectionObserver' in window && !reduced) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animateCount(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* subtle parallax on aurora blobs */
  if (!reduced) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        document.querySelector('.b1').style.marginTop = (y * 0.12) + 'px';
        document.querySelector('.b2').style.marginTop = (-y * 0.08) + 'px';
        ticking = false;
      });
    }, { passive: true });
  }
})();
