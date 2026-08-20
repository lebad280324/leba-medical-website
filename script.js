"use strict";

document.documentElement.classList.add("motion-enabled");

// ── Config ────────────────────────────────────────────────────────────
const CONTACT = { email: "", phone: "" };

// ── Particle System ───────────────────────────────────────────────────
class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.particles = [];
    this.connections = [];
    this.mouse = { x: -9999, y: -9999 };
    this.animFrame = null;
    this.init();
    this.bindEvents();
    this.animate();
  }

  init() {
    this.resize();
    const count = Math.min(55, Math.floor((this.canvas.width * this.canvas.height) / 16000));
    this.particles = Array.from({ length: count }, () => this.createParticle());
  }

  createParticle() {
    return {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      vx: (Math.random() - 0.5) * 0.38,
      vy: (Math.random() - 0.5) * 0.38,
      r: Math.random() * 1.8 + 0.6,
      alpha: Math.random() * 0.5 + 0.15,
      color: Math.random() > 0.6 ? "#06b6d4" : "#1a6ef5",
    };
  }

  resize() {
    const hero = this.canvas.parentElement;
    this.canvas.width = hero.offsetWidth;
    this.canvas.height = hero.offsetHeight;
  }

  bindEvents() {
    window.addEventListener("resize", () => { this.resize(); this.init(); }, { passive: true });
    const hero = this.canvas.parentElement;
    hero.addEventListener("mousemove", (e) => {
      const rect = hero.getBoundingClientRect();
      this.mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }, { passive: true });
    hero.addEventListener("mouseleave", () => { this.mouse = { x: -9999, y: -9999 }; }, { passive: true });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update & draw particles
    this.particles.forEach((p) => {
      // Mouse repulsion
      const dx = p.x - this.mouse.x;
      const dy = p.y - this.mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        const force = (100 - dist) / 100;
        p.vx += (dx / dist) * force * 0.08;
        p.vy += (dy / dist) * force * 0.08;
      }

      // Dampen
      p.vx *= 0.99;
      p.vy *= 0.99;

      p.x += p.vx;
      p.y += p.vy;

      // Bounce
      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
      p.x = Math.max(0, Math.min(this.canvas.width, p.x));
      p.y = Math.max(0, Math.min(this.canvas.height, p.y));

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fill();
    });

    // Draw connections
    this.ctx.lineWidth = 0.5;
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const a = this.particles[i], b = this.particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 120;
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.18;
          this.ctx.globalAlpha = alpha;
          const grad = this.ctx.createLinearGradient(a.x, a.y, b.x, b.y);
          grad.addColorStop(0, a.color);
          grad.addColorStop(1, b.color);
          this.ctx.strokeStyle = grad;
          this.ctx.beginPath();
          this.ctx.moveTo(a.x, a.y);
          this.ctx.lineTo(b.x, b.y);
          this.ctx.stroke();
        }
      }
    }

    this.ctx.globalAlpha = 1;
    this.animFrame = requestAnimationFrame(() => this.animate());
  }
}

// ── Typewriter Effect ─────────────────────────────────────────────────
class TypewriterEffect {
  constructor(element, phrases, options = {}) {
    this.el = element;
    if (!this.el) return;
    this.phrases = phrases;
    this.current = 0;
    this.pos = 0;
    this.deleting = false;
    this.typeSpeed = options.typeSpeed || 68;
    this.deleteSpeed = options.deleteSpeed || 38;
    this.pauseMs = options.pauseMs || 2000;
    this.tick();
  }

  tick() {
    const phrase = this.phrases[this.current];
    if (this.deleting) {
      this.pos--;
      this.el.textContent = phrase.slice(0, this.pos);
      if (this.pos === 0) {
        this.deleting = false;
        this.current = (this.current + 1) % this.phrases.length;
        setTimeout(() => this.tick(), 400);
        return;
      }
      setTimeout(() => this.tick(), this.deleteSpeed);
    } else {
      this.pos++;
      this.el.textContent = phrase.slice(0, this.pos);
      if (this.pos === phrase.length) {
        setTimeout(() => { this.deleting = true; this.tick(); }, this.pauseMs);
        return;
      }
      setTimeout(() => this.tick(), this.typeSpeed);
    }
  }
}

// ── Animated Number Counter ───────────────────────────────────────────
function animateCounter(el, target, duration = 1600, suffix = "") {
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

// ── Dashboard Live Animator ───────────────────────────────────────────
class DashboardAnimator {
  constructor() {
    this.counts = document.querySelectorAll(".dash-count");
    this.started = false;
  }

  start() {
    if (this.started) return;
    this.started = true;
    this.counts.forEach((el) => {
      const target = parseInt(el.dataset.target, 10);
      animateCounter(el, target, 1200 + Math.random() * 600);
    });
    // Simulate live metric updates
    this.liveLoop();
  }

  liveLoop() {
    setInterval(() => {
      const metrics = document.querySelectorAll(".metric");
      const idx = Math.floor(Math.random() * metrics.length);
      const el = metrics[idx];
      if (el) {
        el.classList.add("animating");
        setTimeout(() => el.classList.remove("animating"), 600);
      }
    }, 3800);
  }
}

// ── Scroll Animations ─────────────────────────────────────────────────
const revealSelectors = [
  ".section-heading", ".section-intro", ".values-copy", ".value-list",
  ".daily-copy", ".today-board", ".role-intro", ".role-panels",
  ".platform-visual", ".platform-copy", ".faq-intro", ".accordion",
  ".contact-copy", ".consultation-form",
];

document.querySelectorAll(revealSelectors.join(",")).forEach((el, idx) => {
  el.classList.add("reveal-item");
  if ([4, 6, 8, 10].includes(idx % 12)) el.classList.add("reveal-left");
  if ([5, 7, 9, 11].includes(idx % 12)) el.classList.add("reveal-right");
});

document.querySelectorAll(
  ".problem-grid, .daily-points, .solution-grid, .journey-flow, .model-grid, .implementation-steps, .connected-grid, .footer-top"
).forEach((el) => el.classList.add("stagger-group"));

const dashboardAnimator = new DashboardAnimator();
const statItems = document.querySelectorAll(".stat-item .stat-num");

let statsAnimated = false;

if ("IntersectionObserver" in window) {
  const motionTargets = document.querySelectorAll(".reveal-item, .stagger-group");
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -8%" }
  );
  motionTargets.forEach((el) => observer.observe(el));

  // Dashboard counter trigger
  const dashWrap = document.querySelector(".dashboard-wrap");
  if (dashWrap) {
    const dashObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        dashboardAnimator.start();
        dashObs.disconnect();
      }
    }, { threshold: 0.2 });
    dashObs.observe(dashWrap);
  }

  // Hero stats counter trigger
  const statsSection = document.querySelector(".hero-stats");
  if (statsSection) {
    const statsObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !statsAnimated) {
        statsAnimated = true;
        statItems.forEach((el) => {
          const target = parseInt(el.dataset.count, 10);
          const suffix = el.dataset.suffix || "";
          animateCounter(el, target, 1800, suffix);
        });
        statsObs.disconnect();
      }
    }, { threshold: 0.5 });
    statsObs.observe(statsSection);
  }
} else {
  document.querySelectorAll(".reveal-item, .stagger-group").forEach((el) => el.classList.add("is-visible"));
  dashboardAnimator.start();
  statItems.forEach((el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || "";
    el.textContent = target + suffix;
  });
}

// ── Init Particles ────────────────────────────────────────────────────
if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
  new ParticleSystem("particles-canvas");
}

// ── Typewriter ────────────────────────────────────────────────────────
const typeEl = document.querySelector(".typewriter-text");
if (typeEl && window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
  new TypewriterEffect(typeEl, [
    "thông minh hơn.",
    "tốt hơn.",
    "liên thông hơn.",
    "đồng bộ hơn.",
  ]);
}

// ── Navigation ────────────────────────────────────────────────────────
const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector(".primary-nav");

menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  primaryNav.classList.toggle("is-open", !isOpen);
});

primaryNav?.addEventListener("click", (e) => {
  if (e.target.matches("a")) {
    primaryNav.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && primaryNav?.classList.contains("is-open")) {
    primaryNav.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.focus();
  }
});

// ── Header Scroll ─────────────────────────────────────────────────────
const siteHeader = document.querySelector(".site-header");
const updateHeader = () => siteHeader?.classList.toggle("scrolled", window.scrollY > 16);
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

// ── Accordion ─────────────────────────────────────────────────────────
document.querySelectorAll(".accordion button").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.getAttribute("aria-controls"));
    const willOpen = button.getAttribute("aria-expanded") !== "true";

    document.querySelectorAll(".accordion button").forEach((item) => {
      const panel = document.getElementById(item.getAttribute("aria-controls"));
      item.setAttribute("aria-expanded", "false");
      panel.hidden = true;
    });

    button.setAttribute("aria-expanded", String(willOpen));
    target.hidden = !willOpen;
  });

  button.addEventListener("keydown", (e) => {
    const buttons = [...document.querySelectorAll(".accordion button")];
    const idx = buttons.indexOf(button);
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const next =
      e.key === "Home" ? 0
      : e.key === "End" ? buttons.length - 1
      : e.key === "ArrowDown" ? (idx + 1) % buttons.length
      : (idx - 1 + buttons.length) % buttons.length;
    buttons[next].focus();
  });
});

// ── Role Tabs ─────────────────────────────────────────────────────────
const roleTabs = [...document.querySelectorAll(".role-tabs [role='tab']")];

function selectRoleTab(tab) {
  roleTabs.forEach((item) => {
    const selected = item === tab;
    item.setAttribute("aria-selected", String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute("aria-controls")).hidden = !selected;
  });
}

roleTabs.forEach((tab, idx) => {
  tab.addEventListener("click", () => selectRoleTab(tab));
  tab.addEventListener("keydown", (e) => {
    if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const next =
      e.key === "Home" ? 0
      : e.key === "End" ? roleTabs.length - 1
      : ["ArrowDown", "ArrowRight"].includes(e.key)
        ? (idx + 1) % roleTabs.length
        : (idx - 1 + roleTabs.length) % roleTabs.length;
    roleTabs[next].focus();
    selectRoleTab(roleTabs[next]);
  });
});

// ── Static data ───────────────────────────────────────────────────────
document.querySelectorAll("[data-current-year]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});
document.querySelectorAll("[data-contact-email]").forEach((el) => {
  el.textContent = CONTACT.email || "Đang cập nhật";
});
document.querySelectorAll("[data-contact-phone]").forEach((el) => {
  el.textContent = CONTACT.phone || "Đang cập nhật";
});

// ── Form Validation ───────────────────────────────────────────────────
const form = document.querySelector(".consultation-form");
const requestDialog = document.querySelector(".request-dialog");
const requestText = requestDialog?.querySelector("textarea");

const rules = {
  fullName: (v) => v.trim().length >= 2 || "Vui lòng nhập họ và tên.",
  organization: (v) => v.trim().length >= 2 || "Vui lòng nhập tên đơn vị.",
  phone: (v) => /^[+\d][\d\s().-]{7,}$/.test(v.trim()) || "Vui lòng nhập số điện thoại hợp lệ.",
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || "Vui lòng nhập email hợp lệ.",
  needs: (v) => v.trim().length >= 10 || "Vui lòng mô tả nhu cầu ít nhất 10 ký tự.",
};

function setFieldState(field, msg = "") {
  field.classList.toggle("invalid", Boolean(msg));
  field.setAttribute("aria-invalid", String(Boolean(msg)));
  const err = field.closest("label")?.querySelector(".error");
  if (err) err.textContent = msg;
}

form?.querySelectorAll("input, textarea").forEach((field) => {
  field.addEventListener("blur", () => {
    if (rules[field.name]) {
      const result = rules[field.name](field.value);
      setFieldState(field, result === true ? "" : result);
    }
  });
});

function buildRequest(data) {
  return [
    "YÊU CẦU TƯ VẤN LEBA MEDICAL",
    "",
    `Họ và tên: ${data.get("fullName")}`,
    `Đơn vị: ${data.get("organization")}`,
    `Số điện thoại: ${data.get("phone")}`,
    `Email: ${data.get("email")}`,
    `Số lượng chi nhánh: ${data.get("branches") || "Chưa cung cấp"}`,
    "",
    "Nhu cầu cần tư vấn:",
    data.get("needs"),
  ].join("\n");
}

form?.addEventListener("submit", (e) => {
  e.preventDefault();
  let firstInvalid = null;

  Object.entries(rules).forEach(([name, validate]) => {
    const field = form.elements[name];
    const result = validate(field.value);
    setFieldState(field, result === true ? "" : result);
    if (result !== true && !firstInvalid) firstInvalid = field;
  });

  const consentError = form.querySelector(".consent-error");
  if (!form.elements.consent.checked) {
    consentError.textContent = "Vui lòng xác nhận trước khi tiếp tục.";
    firstInvalid ||= form.elements.consent;
  } else {
    consentError.textContent = "";
  }

  if (firstInvalid) {
    firstInvalid.focus();
    form.querySelector(".form-status").textContent = "Vui lòng kiểm tra lại các trường được đánh dấu.";
    return;
  }

  const content = buildRequest(new FormData(form));
  requestText.value = content;
  form.querySelector(".form-status").textContent = "Thông tin hợp lệ. Dữ liệu chưa được gửi đi.";

  if (CONTACT.email) {
    const ok = window.confirm("Thông tin đã hợp lệ. Bạn có muốn mở ứng dụng email để gửi yêu cầu không?");
    if (ok) {
      window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent("Yêu cầu tư vấn LEBA Medical")}&body=${encodeURIComponent(content)}`;
      return;
    }
  }

  requestDialog.showModal();
});

document.querySelector(".copy-request")?.addEventListener("click", async () => {
  const status = document.querySelector(".copy-status");
  try {
    await navigator.clipboard.writeText(requestText.value);
    status.textContent = "Đã sao chép nội dung.";
  } catch {
    requestText.select();
    status.textContent = "Hãy nhấn Ctrl/Cmd + C để sao chép nội dung.";
  }
});

const privacyDialog = document.querySelector(".privacy-dialog");
document.querySelector(".privacy-link")?.addEventListener("click", () => privacyDialog.showModal());

document.querySelectorAll(".dialog-close, .cancel-dialog").forEach((btn) => {
  btn.addEventListener("click", () => btn.closest("dialog")?.close());
});

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
});
