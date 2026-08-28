(function(){
  "use strict";

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================================================================
     Wala nang array dito na kailangan i-edit. Direkta mo na lang
     i-e-edit ang src="" (para sa images) at href="" (para sa links)
     sa index.html mismo — awtomatiko nang gagana ang lahat.
  ================================================================ */

  /* ============ Loading screen ============ */
  var loader = document.getElementById('loader');
  window.addEventListener('load', function(){
    var delay = reduceMotion ? 200 : 900;
    setTimeout(function(){
      loader.classList.add('hide');
      document.body.style.overflow = '';
    }, delay);
  });

  /* ============ Role typewriter ============ */
  var roles = ["Web Developer", "UI/UX Designer"];
  var roleEl = document.getElementById('roleText');
  if (roleEl){
    if (reduceMotion){
      roleEl.textContent = roles.join(" · ");
    } else {
      var ri = 0, ci = 0, deleting = false;
      function tick(){
        var word = roles[ri];
        if (!deleting){
          ci++;
          roleEl.textContent = word.slice(0, ci);
          if (ci === word.length){ deleting = true; setTimeout(tick, 1400); return; }
        } else {
          ci--;
          roleEl.textContent = word.slice(0, ci);
          if (ci === 0){ deleting = false; ri = (ri + 1) % roles.length; }
        }
        setTimeout(tick, deleting ? 35 : 65);
      }
      tick();
    }
  }

  /* ============ Nav scroll + active link ============ */
  var nav = document.getElementById('mainNav');
  var sections = document.querySelectorAll('main section[id]');
  var navLinks = document.querySelectorAll('[data-nav]');

  window.addEventListener('scroll', function(){
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive:true });

  var spyObserver = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting){
        var id = entry.target.getAttribute('id');
        navLinks.forEach(function(link){
          var match = link.getAttribute('href') === '#' + id;
          link.classList.toggle('active', match && link.classList.contains('nav-link'));
        });
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
  sections.forEach(function(s){ spyObserver.observe(s); });

  /* ============ Mobile menu ============ */
  var hamburger = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobileMenu');
  hamburger.addEventListener('click', function(){
    var open = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
  });
  mobileMenu.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ============ Scroll reveal ============ */
  var revealEls = document.querySelectorAll('[data-reveal]');
  revealEls.forEach(function(el){
    var siblings = el.parentElement ? el.parentElement.children : [];
    var idx = Array.prototype.indexOf.call(siblings, el);
    el.style.setProperty('--i', idx);
  });

  if (reduceMotion){
    revealEls.forEach(function(el){ el.classList.add('in-view'); });
  } else {
    var revealObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold:0.15, rootMargin:'0px 0px -60px 0px' });
    revealEls.forEach(function(el){ revealObserver.observe(el); });
  }

  /* ============ Works filter ============ */
  var filterBtns = document.querySelectorAll('.filter-btn');
  var projectCards = document.querySelectorAll('.project-card');
  filterBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      filterBtns.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      var filter = btn.getAttribute('data-filter');
      projectCards.forEach(function(card){
        var cat = card.getAttribute('data-cat');
        var show = filter === 'all' || filter === cat;
        card.style.transition = 'opacity .3s ease, transform .3s ease';
        if (show){
          card.classList.remove('hidden');
          requestAnimationFrame(function(){
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.96)';
          setTimeout(function(){ card.classList.add('hidden'); }, 300);
        }
      });
    });
  });

  /* ============ Modal helpers ============ */
  function openModal(overlay){
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }
  function closeModal(overlay){
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }
  document.querySelectorAll('.modal-overlay').forEach(function(overlay){
    overlay.addEventListener('click', function(e){
      if (e.target === overlay) closeModal(overlay);
    });
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape'){
      document.querySelectorAll('.modal-overlay.open').forEach(closeModal);
    }
  });

  /* ============ Certificate modal ============
     Reads the image straight from the card that was clicked — no
     separate array to keep in sync with the HTML.
  ============================================================== */
  var certModal = document.getElementById('certModal');
  var certModalImg = document.getElementById('certModalImg');
  var certModalTitle = document.getElementById('certModalTitle');
  var zoomLevelEl = document.getElementById('zoomLevel');
  var zoom = 1;

  function setZoom(z){
    zoom = Math.min(3, Math.max(0.5, z));
    certModalImg.style.transform = 'scale(' + zoom + ')';
    zoomLevelEl.textContent = Math.round(zoom * 100) + '%';
  }

  document.querySelectorAll('.cert-card').forEach(function(card){
    card.addEventListener('click', function(){
      var titleText = card.querySelector('.cert-title').textContent;
      certModalTitle.textContent = titleText;

      var imgOnCard = card.querySelector('.cert-thumb-img');
      var src = imgOnCard ? imgOnCard.getAttribute('src') : '';

      if (src && src.trim() !== ''){
        certModalImg.src = src;
        certModalImg.alt = (imgOnCard && imgOnCard.alt) || titleText;
        certModalImg.style.display = '';
      } else {
        certModalImg.removeAttribute('src');
        certModalImg.style.display = 'none';
      }
      setZoom(1);
      openModal(certModal);
    });
  });

  document.getElementById('certModalClose').addEventListener('click', function(){
    closeModal(certModal);
  });
  document.getElementById('zoomIn').addEventListener('click', function(){ setZoom(zoom + 0.25); });
  document.getElementById('zoomOut').addEventListener('click', function(){ setZoom(zoom - 0.25); });
  document.getElementById('zoomReset').addEventListener('click', function(){ setZoom(1); });

  /* ============ Resume modal ============
     Reads the PDF path straight from the "Download Resume" button's
     href — edit that one href in the HTML and both buttons stay in sync.
  ============================================================== */
  var resumeModal = document.getElementById('resumeModal');
  var resumeFrame = document.getElementById('resumeFrame');
  var viewResumeBtn = document.getElementById('viewResumeBtn');
  var downloadResumeBtn = document.getElementById('downloadResumeBtn');
  if (viewResumeBtn && downloadResumeBtn){
    viewResumeBtn.addEventListener('click', function(){
      resumeFrame.src = downloadResumeBtn.getAttribute('href');
      openModal(resumeModal);
    });
  }
  document.getElementById('resumeModalClose').addEventListener('click', function(){
    closeModal(resumeModal);
    resumeFrame.src = '';
  });

  /* ============ Contact form ============
     Submits to Formspree (see the comment above the <form> tag in
     index.html for setup steps) so messages land straight in Gmail —
     no page reload, just the animated "Sent" state below.
  ============================================================== */
  var form = document.getElementById('contactForm');
  var submitBtn = document.getElementById('formSubmit');
  var formError = document.getElementById('formError');
  if (form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      if (!form.checkValidity()){ form.reportValidity(); return; }

      if (formError) formError.hidden = true;
      submitBtn.disabled = true;

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function(response){
        if (response.ok){
          submitBtn.classList.add('sent');
          setTimeout(function(){
            form.reset();
            submitBtn.classList.remove('sent');
            submitBtn.disabled = false;
          }, 2600);
        } else {
          throw new Error('submit failed');
        }
      }).catch(function(){
        submitBtn.disabled = false;
        if (formError) formError.hidden = false;
      });
    });
  }

  /* ============ Custom cursor ============ */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches){
    var dot = document.getElementById('cursorDot');
    var shown = false;
    window.addEventListener('mousemove', function(e){
      dot.style.left = e.clientX + 'px';
      dot.style.top = e.clientY + 'px';
      if (!shown){ dot.classList.add('active'); shown = true; }
    }, { passive:true });
    var interactive = 'a, button, input, textarea, .skill-tag, .project-card, .cert-card';
    document.addEventListener('mouseover', function(e){
      if (e.target.closest(interactive)) dot.classList.add('expand');
    });
    document.addEventListener('mouseout', function(e){
      if (e.target.closest(interactive)) dot.classList.remove('expand');
    });
  }

  /* ============ Footer year ============ */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();