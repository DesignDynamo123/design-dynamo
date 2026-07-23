/* ============================================================
   Design Dynamo — book.js
   Booking form: validation, submit to Google Sheets, nav, reveals.
   ============================================================ */

document.documentElement.classList.add("js");

/* ------------------------------------------------------------------
   BACKEND — the Apps Script Web App /exec URL.

   This file ships to the browser, so this URL is necessarily public.
   That is fine: it only accepts a POST and appends a row. It grants no
   read access to the sheet, and the sheet ID is deliberately not
   recorded anywhere in this repo.

   Setup steps are in the header of apps-script/Code.gs.
   While this is empty the form still validates, then points the
   visitor at WhatsApp instead of pretending the booking was saved.
------------------------------------------------------------------ */
const SHEET_ENDPOINT =
    "https://script.google.com/macros/s/AKfycbwu6id7almDxH5DgN9kM9xbvJtO3lsLgs5smNkW__otcgtE3_kyfXMhxLkIokpoiLqTsw/exec";

const WHATSAPP = "https://wa.me/919116538867";

const form = document.getElementById("book-form");
const submitBtn = document.getElementById("book-submit");
const statusEl = document.getElementById("form-status");

/* ---------- Validation ----------
   Custom rather than native so the messages match the page's voice and
   every invalid field is flagged at once, not one at a time.
*/
const RULES = {
    company: (v) => (v.length >= 2 ? "" : "Enter your company name."),
    brief: (v) => (v.length >= 20 ? "" : "A little more detail, please — at least a sentence or two."),
    requirement: (v) => (v ? "" : "Pick the category closest to what you need."),
    name: (v) => (v.length >= 2 ? "" : "Enter your name."),
    designation: (v) => (v.length >= 2 ? "" : "Enter your designation."),
    // permissive on formatting (country codes, spaces, dashes) — just needs enough digits
    contact: (v) => ((v.match(/\d/g) || []).length >= 8 ? "" : "Enter a valid contact number."),
    source: (v) => (v ? "" : "Let us know where you found us."),
};

function fieldWrap(input) {
    return input.closest(".field");
}

function setError(input, message) {
    const wrap = fieldWrap(input);
    const errEl = wrap.querySelector(".field-error");
    wrap.classList.toggle("invalid", Boolean(message));
    if (errEl) errEl.textContent = message;
    return !message;
}

function validateField(input) {
    const rule = RULES[input.name];
    if (!rule) return true;
    return setError(input, rule(input.value.trim()));
}

function validateAll() {
    let firstBad = null;
    let ok = true;
    Object.keys(RULES).forEach((key) => {
        const input = form.elements[key];
        if (!validateField(input)) {
            ok = false;
            if (!firstBad) firstBad = input;
        }
    });
    if (firstBad) firstBad.focus();
    return ok;
}

/* clear a field's error as soon as it becomes valid — never nag mid-typing */
Object.keys(RULES).forEach((key) => {
    const input = form.elements[key];
    const revalidate = () => {
        if (fieldWrap(input).classList.contains("invalid")) validateField(input);
    };
    input.addEventListener("input", revalidate);
    input.addEventListener("change", revalidate);
    input.addEventListener("blur", () => {
        if (input.value.trim()) validateField(input);
    });
});

/* ---------- Status messages ---------- */
function showStatus(kind, html) {
    statusEl.className = "form-status show " + kind;
    statusEl.innerHTML = html;
}

function whatsappFallback(lead) {
    return (
        lead + ' Please <a href="' + WHATSAPP + '" target="_blank" rel="noopener">send this on WhatsApp</a> ' +
        "and we'll pick it up right away."
    );
}

/* ---------- Submit ----------
   Posted as text/plain so the browser treats it as a "simple" request:
   no CORS preflight, which an Apps Script Web App cannot answer.
*/
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (form.elements.website.value) return;   // honeypot tripped — silently drop
    if (!validateAll()) {
        showStatus("err", "Please fix the highlighted fields.");
        return;
    }

    const payload = {
        company: form.elements.company.value.trim(),
        brief: form.elements.brief.value.trim(),
        requirement: form.elements.requirement.value,
        name: form.elements.name.value.trim(),
        designation: form.elements.designation.value.trim(),
        contact: form.elements.contact.value.trim(),
        source: form.elements.source.value,
        page: location.href,
    };

    if (!SHEET_ENDPOINT) {
        showStatus("err", whatsappFallback("The booking form isn't connected to our sheet yet."));
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    statusEl.className = "form-status";

    try {
        const res = await fetch(SHEET_ENDPOINT, {
            method: "POST",
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || data.result !== "success") throw new Error(data.message || "Sheet rejected the row");
        renderSent(payload.name);
    } catch (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Book a Call";
        showStatus("err", whatsappFallback("We couldn't reach the server — nothing was lost."));
    }
});

/* swap the form for a confirmation — a filled-in form left on screen invites double sends */
function renderSent(name) {
    const sent = document.createElement("div");
    sent.className = "book-sent";
    sent.innerHTML =
        '<p class="sent-mark">✓</p>' +
        "<h3>Thanks" + (name ? ", " + escapeHtml(name.split(" ")[0]) : "") + ".</h3>" +
        "<p>Your brief is with us. We'll reply within one business day with a time slot.</p>" +
        '<a class="btn btn-line" href="index.html#top">← Back to the site</a>';
    form.replaceWith(sent);
    sent.scrollIntoView({ block: "center", behavior: "smooth" });
}

function escapeHtml(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
}

/* ---------- Nav ---------- */
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", true);   // this page has no hero — nav stays solid
}, { passive: true });

const burger = document.getElementById("nav-burger");
const navMobile = document.getElementById("nav-mobile");
const navClose = document.getElementById("nav-close");

function setDrawer(open) {
    navMobile.classList.toggle("open", open);
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open);
    document.body.classList.toggle("no-scroll", open);
}
burger.addEventListener("click", () => setDrawer(!navMobile.classList.contains("open")));
if (navClose) navClose.addEventListener("click", () => setDrawer(false));
navMobile.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setDrawer(false)));

/* ---------- Scroll reveal ---------- */
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.08 });

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));
