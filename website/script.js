"use strict";

document.documentElement.classList.add("motion-enabled");

// Cập nhật hai giá trị này khi có thông tin liên hệ chính thức.
const CONTACT = {
  email: "",
  phone: "",
};

const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector(".primary-nav");

menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  primaryNav.classList.toggle("is-open", !isOpen);
});

primaryNav?.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    primaryNav.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && primaryNav?.classList.contains("is-open")) {
    primaryNav.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.focus();
  }
});

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

  button.addEventListener("keydown", (event) => {
    const buttons = [...document.querySelectorAll(".accordion button")];
    const index = buttons.indexOf(button);
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : event.key === "ArrowDown" ? (index + 1) % buttons.length : (index - 1 + buttons.length) % buttons.length;
    buttons[nextIndex].focus();
  });
});

document.querySelectorAll("[data-current-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});

document.querySelectorAll("[data-contact-email]").forEach((element) => {
  element.textContent = CONTACT.email || "Đang cập nhật";
});

document.querySelectorAll("[data-contact-phone]").forEach((element) => {
  element.textContent = CONTACT.phone || "Đang cập nhật";
});

const form = document.querySelector(".consultation-form");
const requestDialog = document.querySelector(".request-dialog");
const requestText = requestDialog?.querySelector("textarea");

const rules = {
  fullName: (value) => value.trim().length >= 2 || "Vui lòng nhập họ và tên.",
  organization: (value) => value.trim().length >= 2 || "Vui lòng nhập tên đơn vị.",
  phone: (value) => /^[+\d][\d\s().-]{7,}$/.test(value.trim()) || "Vui lòng nhập số điện thoại hợp lệ.",
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) || "Vui lòng nhập email hợp lệ.",
  needs: (value) => value.trim().length >= 10 || "Vui lòng mô tả nhu cầu ít nhất 10 ký tự.",
};

function setFieldState(field, message = "") {
  field.classList.toggle("invalid", Boolean(message));
  field.setAttribute("aria-invalid", String(Boolean(message)));
  const error = field.closest("label")?.querySelector(".error");
  if (error) error.textContent = message;
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

form?.addEventListener("submit", (event) => {
  event.preventDefault();
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
    const shouldOpenEmail = window.confirm("Thông tin đã hợp lệ. Bạn có muốn mở ứng dụng email để gửi yêu cầu không?");
    if (shouldOpenEmail) {
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

document.querySelectorAll(".dialog-close, .cancel-dialog").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog")?.close());
});

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});

const siteHeader = document.querySelector(".site-header");
const updateHeader = () => siteHeader?.classList.toggle("scrolled", window.scrollY > 16);
updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const revealSelectors = [
  ".section-heading",
  ".section-intro",
  ".values-copy",
  ".value-list",
  ".daily-copy",
  ".today-board",
  ".role-intro",
  ".role-panels",
  ".platform-visual",
  ".platform-copy",
  ".faq-intro",
  ".accordion",
  ".contact-copy",
  ".consultation-form",
];

document.querySelectorAll(revealSelectors.join(",")).forEach((element, index) => {
  element.classList.add("reveal-item");
  if ([4, 6, 8, 10].includes(index % 12)) element.classList.add("reveal-left");
  if ([5, 7, 9, 11].includes(index % 12)) element.classList.add("reveal-right");
});

document.querySelectorAll(
  ".problem-grid, .daily-points, .solution-grid, .journey-flow, .model-grid, .implementation-steps, .connected-grid, .footer-top"
).forEach((element) => element.classList.add("stagger-group"));

const motionTargets = document.querySelectorAll(".reveal-item, .stagger-group");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -7%" }
  );
  motionTargets.forEach((element) => revealObserver.observe(element));
} else {
  motionTargets.forEach((element) => element.classList.add("is-visible"));
}

const roleTabs = [...document.querySelectorAll(".role-tabs [role='tab']")];
function selectRoleTab(tab) {
  roleTabs.forEach((item) => {
    const selected = item === tab;
    item.setAttribute("aria-selected", String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute("aria-controls")).hidden = !selected;
  });
}

roleTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectRoleTab(tab));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? roleTabs.length - 1 : ["ArrowDown", "ArrowRight"].includes(event.key) ? (index + 1) % roleTabs.length : (index - 1 + roleTabs.length) % roleTabs.length;
    roleTabs[nextIndex].focus();
    selectRoleTab(roleTabs[nextIndex]);
  });
});
