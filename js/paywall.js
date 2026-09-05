/* ============================================
   PAYWALL LOGIC
   - Locked content blurs on load until fa_subscribed
     is set in localStorage.
   - Plan buttons on the gate send the user to
     checkout.html with the plan and a return URL so
     checkout can send them back to the article they
     were trying to read.
   - A native `storage` event listener means any OTHER
     tab that already has a premium page open unlocks
     itself live the instant checkout completes in
     this tab, no reload needed. The `storage` event is
     a genuine browser feature for syncing localStorage
     across tabs of the same origin.
   - IMPORTANT: this gate is presentational only. The
     locked text ships in the HTML and is merely blurred
     by CSS, and the unlock flag lives in localStorage,
     which the visitor controls. It cannot restrict
     access — see the notes accompanying this file.
   ============================================ */

document.addEventListener("DOMContentLoaded", function () {
    var lockedContent = document.getElementById("paywallContent");
    var gate = document.getElementById("paywallGate");

    // Resolve sibling pages against this document's own folder, so the
    // link holds up whether the page sits at the site root or one level
    // down in the pages folder.
    function siteUrl(file) {
        return new URL(file, window.location.href).href;
    }

    function isSubscribed() {
        return localStorage.getItem("fa_subscribed") === "true";
    }

    function unlock() {
        if (lockedContent) {
            lockedContent.classList.add("unlocked");
            lockedContent.removeAttribute("aria-hidden");
        }
        if (gate) {
            gate.classList.add("hidden");
            gate.setAttribute("aria-hidden", "true");
        }
        document.body.style.overflow = "";
    }

    function lock() {
        if (lockedContent) {
            lockedContent.classList.remove("unlocked");
            lockedContent.setAttribute("aria-hidden", "true");
        }
        if (gate) {
            gate.classList.remove("hidden");
            gate.removeAttribute("aria-hidden");
            document.body.style.overflow = "hidden";
        }
    }

    if (lockedContent && gate) {
        if (isSubscribed()) {
            unlock();
        } else {
            lock();
        }

        var planButtons = gate.querySelectorAll(".paywall-plan-btn");
        planButtons.forEach(function (btn) {
            btn.addEventListener("click", function () {
                var plan = btn.getAttribute("data-plan");
                var returnUrl = window.location.pathname + window.location.search;
                window.location.href = siteUrl("checkout.html") +
                    "?plan=" + encodeURIComponent(plan) +
                    "&return=" + encodeURIComponent(returnUrl);
            });
        });
    }

    // ---- Live cross-tab unlock ----
    // Fires in every OTHER tab/window of this site when localStorage
    // changes here (native browser behavior — not something we're
    // faking). So if someone has two prediction pages open and
    // subscribes via checkout in one, the other unlocks immediately.
    window.addEventListener("storage", function (e) {
        if (e.key === "fa_subscribed") {
            if (e.newValue === "true") {
                unlock();
            } else {
                lock();
            }
        } else if (e.key === null) {
            // localStorage.clear() reports a null key — re-evaluate.
            if (isSubscribed()) {
                unlock();
            } else {
                lock();
            }
        }
    });

    // ---- Demo-only reset button (dev helper, see settings/footer link) ----
    var resetBtn = document.getElementById("paywallReset");
    if (resetBtn) {
        resetBtn.addEventListener("click", function (ev) {
            ev.preventDefault();
            localStorage.removeItem("fa_subscribed");
            localStorage.removeItem("fa_plan");
            window.location.reload();
        });
    }
});