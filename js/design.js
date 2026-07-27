/* ============================================================
   Design Dynamo — design.js
   Filmstrip, category showcase, nav, FAQ, reveals.
   ============================================================ */

/* JS is active — enables the reveal-on-scroll hidden state in CSS. */
document.documentElement.classList.add("js");

/* Casual-download deterrent: block right-click "Save video as…" on any <video>,
   including ones injected later (delegated on document, capture phase). This only
   removes the easy path — the file still travels over the network to play, so it
   remains reachable via the browser's Network tab. True protection needs signed,
   expiring Cloudinary URLs, which is a server-side change. */
document.addEventListener("contextmenu", (e) => {
    if (e.target instanceof HTMLVideoElement) e.preventDefault();
}, true);

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
/* videos with a Cloudinary poster never preload media; local ones need metadata for a frame.
   NODL removes the native download button, PiP, and remote-playback — casual-download
   deterrents only; the file is still reachable via the Network tab (see contextmenu guard). */
const NODL = 'controlslist="nodownload noremoteplayback" disablepictureinpicture';
function videoAttrs(work) {
    const poster = cloudPoster(work);
    return poster
        ? `preload="none" poster="${poster}" ${NODL}`
        : `preload="metadata" ${NODL}`;
}

/* ---------- Hero background video ----------
   Two cuts on Cloudinary: `mbg` framed for phones, `lbg` for wider screens.
   The <video> ships with no <source> children, so nothing downloads until this
   picks one — that's the point, otherwise a phone would fetch the desktop cut
   before any swap could happen. (A `media` attribute on <source> only works
   inside <picture>; <video> ignores it.)

   Resolved once at load. Re-resolving on resize would restart playback
   mid-scroll for a case — a desktop window dragged narrow — that isn't worth it.
*/
const HERO_CUTS = { mobile: "mbg", wide: "lbg" };
const heroVideo = document.querySelector(".hero-video");

if (heroVideo) {
    const cut = window.matchMedia("(max-width: 900px)").matches
        ? HERO_CUTS.mobile
        : HERO_CUTS.wide;

    // mp4 first, matching the original markup: browsers take the first they support
    ["mp4", "webm"].forEach((ext) => {
        const source = document.createElement("source");
        source.src = `${CLOUD_BASE}${cut}.${ext}`;
        source.type = `video/${ext}`;
        heroVideo.appendChild(source);
    });

    heroVideo.load();   // required: the element had no sources when it was parsed

    // load() restarts resource selection, so nudge playback rather than trusting
    // the autoplay attribute to re-fire. Rejection is expected and fine — a
    // blocked autoplay just leaves the poster showing, which is the same frame.
    const attempt = heroVideo.play();
    if (attempt) attempt.catch(() => {});
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

/* ---------- VideoObject structured data (SEO) ----------
   Emitted from the same WORKS list that renders the showcase, so the schema can
   never drift from what's actually on the page. Injected as JSON-LD into <head>.
   uploadDate is the real Cloudinary upload time, read from the version stamp
   (/v<unix>/) in each URL; the one version-less asset falls back to the known
   batch date. Consistent with the videos themselves being JS-rendered — if
   Google renders enough to see the gallery, it sees this too. */
(function videoSchema() {
    const catOf = (id) => CATEGORIES.find((c) => c.id === id) || {};
    const BATCH_DATE = "2026-07-17"; // version-less assets (e.g. Comp_1) — same upload batch
    const uploadDate = (url) => {
        const m = /\/v(\d{9,})\//.exec(url);
        return m ? new Date(+m[1] * 1000).toISOString().slice(0, 10) : BATCH_DATE;
    };
    const videos = WORKS.map((w) => {
        const cat = catOf(w.category);
        const src = cloudSrc(w);
        return {
            "@type": "VideoObject",
            "name": `${w.title} — ${cat.label || "Video"} · Design Dynamo`,
            "description": cat.desc || "White-label video production by Design Dynamo.",
            "thumbnailUrl": cloudPoster(w),
            "contentUrl": src,
            "uploadDate": uploadDate(src),
            "publisher": { "@type": "Organization", "name": "Design Dynamo", "@id": "https://thedesigndynamo.com/#studio" }
        };
    });
    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": videos });
    document.head.appendChild(ld);
})();

/* ---------- Hero trust-bar marquee (mobile) ----------
   Clone the 7 partner logos once so the strip can scroll continuously with no
   seam. Copies carry .logo-dup — hidden on desktop (static row) and revealed
   inside the phone marquee via CSS. Runs at all widths; harmless on desktop
   because the clones stay display:none there. */
(function cloneTrustbar() {
    const bar = document.querySelector(".hero-partners .trustbar-logos");
    if (!bar) return;
    const originals = bar.querySelectorAll(".logo-item").length;   // 7, snapshot before cloning
    bar.querySelectorAll(".logo-item").forEach((img) => {
        const copy = img.cloneNode(true);
        copy.classList.add("logo-dup");
        copy.setAttribute("aria-hidden", "true");
        bar.appendChild(copy);
    });
    // Exact loop distance = left offset of the first clone = width of one full set
    // (logos + trailing margins). Fixed-width logos, so this is viewport-independent;
    // only meaningful under the phone layout, so measure when the marquee is active.
    const setShift = () => {
        if (!window.matchMedia("(max-width: 900px)").matches) return;
        const firstDup = bar.children[originals];
        if (firstDup && firstDup.offsetLeft > 0) {
            bar.style.setProperty("--marquee-to", "-" + Math.round(firstDup.offsetLeft) + "px");
        }
    };
    setShift();
    window.addEventListener("resize", setShift, { passive: true });
    window.addEventListener("load", setShift);   // re-measure once images have their box
})();

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
const navClose = document.getElementById("nav-close");

function setDrawer(open) {
    navMobile.classList.toggle("open", open);
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open);
    document.body.classList.toggle("no-scroll", open);   // full-screen drawer locks page scroll
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


/* ============================================================
   MOBILE INTERACTIONS (≤900px)
   These wire up the mobile-only DOM. On desktop the elements are
   display:none, but the listeners are harmless — they just never fire
   because the elements aren't interactive. Everything is defensively
   guarded so a missing node never throws.
   ============================================================ */

/* ----- E · production engine accordion (one panel open at a time) ----- */
const engineAcc = document.getElementById("engine-acc");
if (engineAcc) {
    const panels = [...engineAcc.querySelectorAll(".eacc")];
    panels.forEach((panel) => {
        const head = panel.querySelector(".eacc-head");
        head.addEventListener("click", () => {
            const willOpen = !panel.classList.contains("open");
            panels.forEach((p) => {
                const on = p === panel && willOpen;
                p.classList.toggle("open", on);
                p.querySelector(".eacc-head").setAttribute("aria-expanded", on);
            });
        });
    });
}

/* ----- F · comparison segmented toggle -----
   One data row per capability, marks in provider order [Freelancers, DD, In-house].
   Mirrors the desktop table exactly: y = yes, n = no, and a word = qualified. */
const cmpList = document.getElementById("cmp-list");
const cmpSeg = document.getElementById("cmp-seg");
if (cmpList && cmpSeg) {
    const CMP = [
        ["Dedicated specialists for every discipline", ["n", "y", "Limited by team"]],
        ["Structured production workflow",             ["n", "y", "y"]],
        ["Quality control before delivery",            ["n", "y", "Depends on process"]],
        ["White-label delivery",                       ["Sometimes", "y", "y"]],
        ["Scale from 1 to 100+ projects",              ["n", "y", "n"]],
        ["Consistent turnaround",                      ["Varies", "y", "Capacity dependent"]],
        ["Single point of contact",                    ["n", "y", "Multiple stakeholders"]],
        ["No hiring or onboarding",                    ["y", "y", "n"]],
        ["Predictable project pricing",                ["n", "y", "n"]],
        ["Client relationship stays with your agency", ["Risk", "y", "y"]],
    ];
    const GLYPH = { y: "✓", n: "✕" };

    const renderCmp = (col) => {
        cmpList.innerHTML = CMP.map(([label, marks]) => {
            const v = marks[col];
            const mark = GLYPH[v]
                ? `<span class="cmp-mark ${v}">${GLYPH[v]}</span>`
                : `<span class="cmp-mark m">~</span>`;
            const text = GLYPH[v] ? label : `${label} <span class="lbl">— ${v}</span>`;
            return `<div class="cmp-row">${mark}<span class="lbl">${text}</span></div>`;
        }).join("");
    };
    cmpSeg.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("click", () => {
            cmpSeg.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            renderCmp(+btn.dataset.col);
        });
    });
    renderCmp(0);
}

/* ----- J · work reel (mobile) -----
   Renders the active category's videos as swipe cards, reusing the same WORKS
   data and cloud helpers as the desktop showcase. Hooked into selectCategory so
   chip taps swap both views. Tap a card to play it inline. */
const workReel = document.getElementById("work-reel");
const reelCap = document.getElementById("reel-cap");
function renderWorkReel(catId) {
    if (!workReel) return;
    const cat = CATEGORIES.find((c) => c.id === catId);
    const works = WORKS.filter((w) => w.category === catId);
    if (!cat || !works.length) return;

    /* Custom controls instead of the browser's native bar, whose white chrome
       (with its own menu/PiP/cast affordances) fought the design. Only what's
       needed: centre play, mute toggle, scrubber, fullscreen. */
    workReel.innerHTML = works.map((w) => `
        <div class="wcard">
            <div class="wthumb ${w.orientation === "landscape" ? "landscape" : ""}">
                <video muted playsinline ${videoAttrs(w)} src="${cloudSrc(w)}"></video>
                <span class="wplay" aria-hidden="true">
                    <svg viewBox="0 0 18 22" width="15" height="18" fill="currentColor"><path d="M0 0l18 11L0 22V0z"/></svg>
                </span>
                <div class="vctrl">
                    <button class="vbtn v-mute" type="button" aria-label="Unmute">
                        <svg class="ic-muted" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H3v6h3l5 4V5z"/><path d="M17 9l4 6M21 9l-4 6"/></svg>
                        <svg class="ic-loud" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 010 7M18 6a8.5 8.5 0 010 12"/></svg>
                    </button>
                    <div class="vbar" role="slider" tabindex="0" aria-label="Seek"><i></i></div>
                    <button class="vbtn v-full" type="button" aria-label="Fullscreen">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6"/><path d="M20 4L9.5 14.5"/></svg>
                    </button>
                </div>
            </div>
            <div class="wtitle">${w.title}</div>
            <div class="wsub">${cat.label}</div>
        </div>`).join("");

    workReel.querySelectorAll(".wthumb").forEach((thumb) => {
        const v = thumb.querySelector("video");
        const bar = thumb.querySelector(".vbar");
        const fill = bar.querySelector("i");
        const muteBtn = thumb.querySelector(".v-mute");
        const fullBtn = thumb.querySelector(".v-full");

        /* tap the video itself to play/pause; taps on the control bar don't count */
        thumb.addEventListener("click", (e) => {
            if (e.target.closest(".vctrl")) return;
            if (v.paused) { v.muted = false; v.play().catch(() => {}); }
            else { v.pause(); }
        });
        v.addEventListener("play", () => thumb.classList.add("playing"));
        v.addEventListener("pause", () => thumb.classList.remove("playing"));
        v.addEventListener("ended", () => thumb.classList.remove("playing"));

        const syncMute = () => {
            thumb.classList.toggle("muted", v.muted);
            muteBtn.setAttribute("aria-label", v.muted ? "Unmute" : "Mute");
        };
        muteBtn.addEventListener("click", () => { v.muted = !v.muted; syncMute(); });
        v.addEventListener("volumechange", syncMute);
        syncMute();

        v.addEventListener("timeupdate", () => {
            if (v.duration) fill.style.width = (v.currentTime / v.duration) * 100 + "%";
        });
        /* pointer events (not click) so dragging scrubs continuously */
        const seek = (clientX) => {
            const r = bar.getBoundingClientRect();
            const ratio = Math.min(Math.max((clientX - r.left) / r.width, 0), 1);
            if (v.duration) { v.currentTime = ratio * v.duration; fill.style.width = ratio * 100 + "%"; }
        };
        let scrubbing = false;
        bar.addEventListener("pointerdown", (e) => { scrubbing = true; bar.setPointerCapture(e.pointerId); seek(e.clientX); });
        bar.addEventListener("pointermove", (e) => { if (scrubbing) seek(e.clientX); });
        bar.addEventListener("pointerup", (e) => { scrubbing = false; bar.releasePointerCapture(e.pointerId); });

        fullBtn.addEventListener("click", () => {
            // iOS Safari exposes only the proprietary video-element API
            if (document.fullscreenElement) document.exitFullscreen();
            else if (thumb.requestFullscreen) thumb.requestFullscreen().catch(() => {});
            else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();
        });
    });
    workReel.scrollLeft = 0;

    if (reelCap) {
        reelCap.innerHTML = `<b>${cat.label}</b> · ${works.length} videos` +
            `<span class="dots">${works.map((_, k) => `<i class="${k === 0 ? "on" : ""}"></i>`).join("")}</span>`;
        const dots = [...reelCap.querySelectorAll(".dots i")];
        workReel.onscroll = () => {
            const i = Math.round(workReel.scrollLeft / (workReel.scrollWidth / works.length));
            dots.forEach((d, k) => d.classList.toggle("on", k === Math.min(i, works.length - 1)));
        };
    }
}
// keep the reel in sync with the shared category selection
const _selectCategory = selectCategory;
selectCategory = function (catId, preferredWork) {
    _selectCategory(catId, preferredWork);
    renderWorkReel(catId);
};
renderWorkReel(CATEGORIES[0].id);

/* ----- H · sticky action dock -----
   A mid-page shortcut, so it's hidden at both ends: while the hero is in view
   (its own CTA is right there) and again over the final CTA + footer, whose
   "Message via WhatsApp" / "Book" buttons and contact links carry the same actions
   and would otherwise sit directly under the dock. */
const dock = document.getElementById("dock");
const heroTop = document.querySelector(".hero-top");
if (dock && heroTop && "IntersectionObserver" in window) {
    const cta = document.querySelector(".cta");
    const footer = document.querySelector(".footer");
    const seen = new Map();
    const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => seen.set(e.target, e.isIntersecting));
        const heroInView = seen.get(heroTop);
        const bottomInView = seen.get(cta) || seen.get(footer);
        const show = !heroInView && !bottomInView;
        dock.classList.toggle("show", show);
        dock.setAttribute("aria-hidden", String(!show));
    }, { threshold: 0 });
    [heroTop, cta, footer].filter(Boolean).forEach((el) => io.observe(el));
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
