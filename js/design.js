/* ============================================================
   Design Dynamo — design.js
   Filmstrip, category showcase, nav, FAQ, reveals.
   ============================================================ */

/* JS is active — enables the reveal-on-scroll hidden state in CSS. */
document.documentElement.classList.add("js");

/* ---------- Cloudinary delivery ----------
   All video AND thumbnail bytes come from Cloudinary (cloud: dfvot5men) —
   the host serves only code/design files. Each work has a `cloud` field:
   paste either the full Cloudinary URL or just the public ID. Thumbnails
   are derived automatically from the video (so_1 frame as jpg) — nothing
   extra to upload. While `cloud` is empty, the local file in Previous_works/
   is used as a dev-preview fallback (that folder is NOT deployed).
*/
const CLOUD_BASE = "https://res.cloudinary.com/dfvot5men/video/upload/";

function cloudSrc(work) {
    if (!work.cloud) return work.src; // local dev fallback
    if (work.cloud.startsWith("http")) return work.cloud;
    return CLOUD_BASE + "q_auto/" + work.cloud + ".mp4";
}
function cloudPoster(work) {
    if (!work.cloud) return "";
    const url = work.cloud.startsWith("http") ? work.cloud : CLOUD_BASE + work.cloud + ".mp4";
    return url
        .replace("/upload/", "/upload/so_1,q_auto/")
        .replace(/\.[a-z0-9]+(\?.*)?$/i, ".jpg");
}
/* videos with a Cloudinary poster never preload media; local ones need metadata for a frame */
function videoAttrs(work) {
    const poster = cloudPoster(work);
    return poster
        ? `preload="none" poster="${poster}"`
        : `preload="metadata"`;
}

/* ---------- Portfolio data ----------
   Fully dynamic: add as many videos per category as you like —
   chips, thumbnails and the filmstrip all render from this list.
*/
/* Taxonomy + links from Video_links.docx (2026-07-18). Orientations verified
   from each video's Cloudinary poster frame. Comp_1 was listed in the docx but
   404s on Cloudinary — re-add it below once it's uploaded. */
const V1 = "https://res.cloudinary.com/dfvot5men/video/upload/v1784290916/";
const V2 = "https://res.cloudinary.com/dfvot5men/video/upload/v1784303349/";

const CATEGORIES = [
    { id: "cgi", label: "CGI Commercials", desc: "Photoreal 3D commercials that make brands look bigger than life." },
    { id: "saas", label: "SaaS Videos", desc: "Crisp demos that make complex software instantly clear." },
    { id: "motion", label: "Motion Graphics", desc: "Fully animated explainers — no camera, pure storytelling." },
    { id: "mg-comp", label: "MG + Compilation", desc: "Compilation edits elevated with layered motion graphics." },
    { id: "ai", label: "AI Videos", desc: "AI-powered UGC and storytelling ads at production speed." },
    { id: "advanced", label: "Advanced Compilation", desc: "Layered edits with transitions, effects and sound design." },
];

const WORKS = [
    { title: "CGI Commercial 01", category: "cgi", orientation: "landscape", cloud: V1 + "CGI_1.mp4" },
    { title: "CGI Commercial 02", category: "cgi", orientation: "landscape", cloud: V1 + "CGI_2.mp4" },
    { title: "CGI Commercial 03", category: "cgi", orientation: "landscape", cloud: V1 + "CGI_3.mp4" },
    { title: "CGI Commercial 04", category: "cgi", orientation: "landscape", cloud: V1 + "CGI_4.mp4" },
    { title: "SaaS Video 01", category: "saas", orientation: "landscape", cloud: V1 + "Saas_1.mp4" },
    { title: "SaaS Video 02", category: "saas", orientation: "landscape", cloud: V1 + "Saas_2.mp4" },
    { title: "SaaS Video 03", category: "saas", orientation: "landscape", cloud: V1 + "Saas_3.mp4" },
    { title: "Motion Graphics 01", category: "motion", orientation: "portrait", cloud: V2 + "Motion_graphic_1.mp4" },
    { title: "Motion Graphics 02", category: "motion", orientation: "portrait", cloud: V2 + "Motion_graphic_2.mp4" },
    { title: "MG + Compilation 01", category: "mg-comp", orientation: "portrait", cloud: V2 + "MG+Comp_1.mp4" },
    { title: "MG + Compilation 02", category: "mg-comp", orientation: "portrait", cloud: V2 + "MG+Comp_2.mp4" },
    { title: "MG + Compilation 03", category: "mg-comp", orientation: "portrait", cloud: V2 + "MG+Comp_3.mp4" },
    { title: "MG + Compilation 04", category: "mg-comp", orientation: "portrait", cloud: V2 + "MG+Comp_4.mp4" },
    { title: "AI Video 01", category: "ai", orientation: "portrait", cloud: V2 + "Ai_1.mp4" },
    { title: "AI Video 02", category: "ai", orientation: "portrait", cloud: V2 + "Ai_2.mp4" },
    { title: "AI Video 03", category: "ai", orientation: "portrait", cloud: V2 + "Ai_3.mp4" },
    // Comp_1 was re-uploaded under a new version — bare public ID resolves version-less to the latest upload
    { title: "Advanced Compilation 01", category: "advanced", orientation: "portrait", cloud: "Comp_1" },
    { title: "Advanced Compilation 02", category: "advanced", orientation: "portrait", cloud: V2 + "Comp_2.mp4" },
];

/* ---------- Hero filmstrip (duplicated for a seamless loop) ---------- */
const strip = document.getElementById("filmstrip");

function buildStrip() {
    const tiles = WORKS.map((w) => {
        const tile = document.createElement("div");
        tile.className = `strip-tile ${w.orientation === "landscape" ? "wide" : ""}`;
        tile.innerHTML = `
            <video muted playsinline ${videoAttrs(w)} src="${cloudSrc(w)}"></video>
            <span class="strip-label">${w.title}</span>`;
        const v = tile.querySelector("video");
        tile.addEventListener("mouseenter", () => v.play().catch(() => {}));
        tile.addEventListener("mouseleave", () => v.pause());
        tile.addEventListener("click", () => {
            selectCategory(w.category, w);
            document.getElementById("work").scrollIntoView({ behavior: "smooth" });
        });
        return tile;
    });
    tiles.forEach((t) => strip.appendChild(t));
    tiles.forEach((t) => strip.appendChild(t.cloneNode(true))); // loop copy (non-interactive is fine)
}
buildStrip();

/* ---------- Work showcase: chips → featured + thumbs ---------- */
const chipsWrap = document.getElementById("chips");
const chipDesc = document.getElementById("chip-desc");
const playerFrame = document.getElementById("player-frame");
const featured = document.getElementById("featured");
const playBtn = document.getElementById("player-play");
const thumbsWrap = document.getElementById("thumbs");

let currentWork = null;

CATEGORIES.forEach((cat, i) => {
    const btn = document.createElement("button");
    btn.className = `chip ${i === 0 ? "active" : ""}`;
    btn.textContent = cat.label;
    btn.dataset.cat = cat.id;
    btn.setAttribute("role", "tab");
    btn.addEventListener("click", () => selectCategory(cat.id));
    chipsWrap.appendChild(btn);
});

function selectCategory(catId, preferredWork) {
    const cat = CATEGORIES.find((c) => c.id === catId);
    const works = WORKS.filter((w) => w.category === catId);
    if (!cat || works.length === 0) return;

    chipsWrap.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c.dataset.cat === catId));
    chipDesc.textContent = cat.desc;
    setFeatured(preferredWork && preferredWork.category === catId ? preferredWork : works[0]);

    thumbsWrap.innerHTML = "";
    works.forEach((w) => {
        const t = document.createElement("button");
        t.className = `thumb ${w.orientation === "landscape" ? "wide" : ""} ${w === currentWork ? "current" : ""}`;
        t.innerHTML = `
            <video muted playsinline ${videoAttrs(w)} src="${cloudSrc(w)}"></video>
            <span class="thumb-label">${w.title}</span>`;
        t.addEventListener("click", () => {
            setFeatured(w);
            thumbsWrap.querySelectorAll(".thumb").forEach((x) => x.classList.remove("current"));
            t.classList.add("current");
        });
        thumbsWrap.appendChild(t);
    });
}

function setFeatured(work) {
    currentWork = work;
    featured.pause();
    featured.removeAttribute("controls");
    playerFrame.classList.remove("playing");
    playerFrame.classList.toggle("landscape", work.orientation === "landscape");
    const poster = cloudPoster(work);
    featured.preload = poster ? "none" : "metadata";
    if (poster) featured.poster = poster; else featured.removeAttribute("poster");
    featured.src = cloudSrc(work);
    featured.load();
}

playerFrame.addEventListener("click", () => {
    if (featured.paused) {
        featured.controls = true;
        featured.muted = false;
        featured.play();
        playerFrame.classList.add("playing");
    } else {
        featured.pause();
    }
});
featured.addEventListener("pause", () => playerFrame.classList.remove("playing"));
featured.addEventListener("play", () => playerFrame.classList.add("playing"));

selectCategory(CATEGORIES[0].id);

/* ---------- Nav ---------- */
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 24);
}, { passive: true });

const burger = document.getElementById("nav-burger");
const navMobile = document.getElementById("nav-mobile");
burger.addEventListener("click", () => {
    const open = navMobile.classList.toggle("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open);
});
navMobile.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
        navMobile.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
    })
);

/* ---------- Scroll reveal ---------- */
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

/* ---------- Production engine: one job, live ----------
   Conductor for the five-stage run. Time-based (never scroll-scrubbed):
   starts when the section enters view, pauses off-screen, holds the finished
   state ~4s, then cross-fades and reruns with fresh randomized progress.
   Reduced motion renders the static mid-run frame instead.
*/
const engine = document.getElementById("engine");
const enginePulse = document.getElementById("engine-pulse");

if (engine && enginePulse) {
    const cards = [...engine.querySelectorAll(".e-card")];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 900px)").matches;

    const DUR = { stage: [3400, 3600, 4500, 3900, 3000], handoff: 700, hold: 4200, fade: 600 };
    const COMPLETE_LABEL = { 4: "✓ QC Approved", 5: "✓ Delivered" };

    const setStatus = (card, text) => { card.querySelector(".e-status").textContent = text; };

    function activate(card) {
        card.classList.remove("is-complete");
        card.classList.add("is-active", "run");
        setStatus(card, "● In progress");
    }
    function complete(card) {
        card.classList.remove("is-active");
        card.classList.add("is-complete"); // .run stays: forwards-filled animations hold their end state
        setStatus(card, COMPLETE_LABEL[+card.dataset.stage] || "✓ Completed");
    }
    function resetCard(card) {
        card.classList.remove("is-active", "is-complete", "run", "lit");
        setStatus(card, "⟳ Pending");
        card.querySelectorAll(".prog-fill").forEach((f) => { f.style.transition = "none"; f.style.transform = "scaleX(0)"; });
        card.querySelectorAll(".prog-val").forEach((v) => { v.textContent = "0%"; });
    }

    /* bars: sequential-with-overlap fills + live count-up, randomized per run */
    function fillBars(card, fixed) {
        card.querySelectorAll(".prog-row").forEach((row, idx) => {
            const min = +row.dataset.min, max = +row.dataset.max;
            const target = fixed ? Math.round((min + max) / 2) : Math.round(min + Math.random() * (max - min));
            const fill = row.querySelector(".prog-fill");
            const val = row.querySelector(".prog-val");
            if (fixed) { fill.style.transform = `scaleX(${target / 100})`; val.textContent = target + "%"; return; }
            setTimeout(() => {
                fill.style.transition = "transform 0.6s cubic-bezier(0.25, 0.7, 0.3, 1)";
                fill.style.transform = `scaleX(${target / 100})`;
                const t0 = performance.now();
                (function tick(now) {
                    const p = Math.min((now - t0) / 600, 1);
                    val.textContent = Math.round(target * p) + "%";
                    if (p < 1) requestAnimationFrame(tick);
                })(t0);
            }, 380 + idx * 440);
        });
    }

    function movePulseTo(card) {
        enginePulse.style.left = Math.max(0, card.offsetLeft - 13) + "px";
        // ride exactly on the connector-dot line: 44% of the card, in engine coords
        enginePulse.style.top = Math.round(card.offsetTop + card.offsetHeight * 0.44) + "px";
    }

    /* static mid-run frame: 1–2 done, 3 active, 4–5 pending (reduced motion / fallback) */
    function renderStatic() {
        [cards[0], cards[1]].forEach((c) => { c.classList.add("is-complete", "static"); setStatus(c, "✓ Completed"); });
        cards[2].classList.add("is-active", "static");
        setStatus(cards[2], "● In progress");
        fillBars(cards[2], true);
        cards[1].classList.add("lit");
        cards[2].classList.add("lit");
    }

    if (reduceMotion) {
        renderStatic();
    } else if (mobile) {
        /* snap-strip layout: each card runs its own stage once it's swiped into
           view, so the run follows the reader instead of playing off-screen */
        cards.forEach((card) => {
            new IntersectionObserver((entries, obs) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    obs.disconnect();
                    activate(card);
                    if (+card.dataset.stage === 3) fillBars(card, false);
                    setTimeout(() => complete(card), DUR.stage[+card.dataset.stage - 1]);
                });
            }, { threshold: 0.5 }).observe(card);
        });
    } else {
        let visible = false;
        let started = false;

        /* sleep that pauses while the section is off-screen */
        const sleep = (ms) => new Promise((res) => {
            let left = ms;
            (function step() {
                if (!visible) { setTimeout(step, 150); return; }
                left -= 100;
                if (left <= 0) res(); else setTimeout(step, 100);
            })();
        });

        async function runLoop() {
            for (;;) {
                cards.forEach(resetCard);
                engine.classList.remove("fading");
                await sleep(300);
                for (let i = 0; i < cards.length; i++) {
                    activate(cards[i]);
                    if (i === 2) fillBars(cards[i], false);
                    await sleep(DUR.stage[i]);
                    complete(cards[i]);
                    if (i < cards.length - 1) {
                        enginePulse.classList.add("show");
                        movePulseTo(cards[i + 1]);
                        await sleep(DUR.handoff);
                        cards[i + 1].classList.add("lit"); // dot ignites as the pulse arrives
                        enginePulse.classList.remove("show");
                    }
                }
                await sleep(DUR.hold);
                engine.classList.add("fading");
                await sleep(DUR.fade);
            }
        }

        new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                visible = entry.isIntersecting;
                if (visible && !started) { started = true; enginePulse.style.left = "0px"; runLoop(); }
            });
        }, { threshold: 0.3 }).observe(engine);
    }
}


/* ---------- Engine strip: dots track the swipe (phones only) ----------
   Driven by scroll position rather than the animation state machine, so the
   indicator always reflects what the reader is actually looking at.
*/
const engineStrip = document.getElementById("engine");
const engineNav = document.getElementById("engine-nav");

if (engineStrip && engineNav) {
    const dots = [...engineNav.querySelectorAll(".e-dot")];
    const hint = document.getElementById("engine-hint");
    let hintRetired = false;

    const syncDots = () => {
        const cards = [...engineStrip.querySelectorAll(".e-card")];
        if (!cards.length) return;
        // nearest card centre to the strip's centre wins
        const mid = engineStrip.scrollLeft + engineStrip.clientWidth / 2;
        let best = 0, bestGap = Infinity;
        cards.forEach((card, i) => {
            const gap = Math.abs(card.offsetLeft + card.offsetWidth / 2 - mid);
            if (gap < bestGap) { bestGap = gap; best = i; }
        });
        dots.forEach((d, i) => d.classList.toggle("is-on", i === best));

        if (!hintRetired && engineStrip.scrollLeft > 24) {
            hintRetired = true;
            hint.classList.add("gone");
        }
    };

    engineStrip.addEventListener("scroll", () => requestAnimationFrame(syncDots), { passive: true });
    syncDots();
}


/* ---------- Case-study metrics: count to the headline number ----------
   Runs once per page load, when the card scrolls into view — so it replays on
   every open/refresh but is never spent off-screen. data-from > data-to counts
   down (Havevibe's missed-deadline rate); otherwise it counts up.
   Reduced motion gets the final value with no animation.
*/
const metricNums = document.querySelectorAll(".metric-num");

if (metricNums.length) {
    const reduceMetricMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const METRIC_DUR = 1700;

    const format = (el, value) =>
        (el.dataset.prefix || "") + value.toFixed(+el.dataset.decimals || 0) + (el.dataset.suffix || "");

    const metricObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            metricObserver.unobserve(el);

            const from = parseFloat(el.dataset.from);
            const to = parseFloat(el.dataset.to);
            const t0 = performance.now();

            (function tick(now) {
                const p = Math.min((now - t0) / METRIC_DUR, 1);
                const eased = 1 - Math.pow(1 - p, 3);   // ease-out cubic, same curve as the engine bars
                el.textContent = format(el, from + (to - from) * eased);
                if (p < 1) requestAnimationFrame(tick);
                else el.textContent = format(el, to);   // land exactly on the target, no float drift
            })(t0);
        });
    }, { threshold: 0.6 });

    metricNums.forEach((el) => {
        if (reduceMetricMotion) {
            el.textContent = format(el, parseFloat(el.dataset.to));
            return;
        }
        el.textContent = format(el, parseFloat(el.dataset.from));
        metricObserver.observe(el);
    });
}


/* ---------- Scroll-spy: highlight the nav link for the section in view ---------- */
const navLinks = [...document.querySelectorAll(".nav-links a")];
const spyTargets = navLinks
    .map((a) => {
        const id = a.getAttribute("href");
        return id && id.startsWith("#") ? document.querySelector(id) : null;
    })
    .filter(Boolean);

const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = "#" + entry.target.id;
        navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === id));
    });
}, { rootMargin: "-45% 0px -50% 0px" });

spyTargets.forEach((sec) => spyObserver.observe(sec));
