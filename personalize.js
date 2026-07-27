/* personalize.js — reel #3 "self-driving landing page" (Level 2), drop-in, zero deps.
 *
 * What it does: picks an AUDIENCE bucket from the traffic source, then swaps the text of any
 * element that opted in via a data-pz attribute. Returning visitors get their own bucket. If a
 * page adds no data-pz markup, this does nothing (safe to include everywhere).
 *
 * Bucket priority:  ?aud=X  >  ?utm_source=X  >  referrer domain  >  returning visitor  >  "default"
 *
 * Opt a headline/CTA in by giving it a JSON map of bucket -> text:
 *   <h1 data-pz='{"reddit":"Hey r/LocalLLaMA — the free-model cheat sheet","twitter":"From the thread: the free-model cheat sheet","returning":"Welcome back — grab the cheat sheet"}'>
 *     Which free local AI model for your machine?   <!-- default text stays for everyone else -->
 *   </h1>
 *
 * Show/hide by bucket:  <div data-pz-show="returning">Welcome back!</div>   (hidden unless returning)
 *                       <div data-pz-hide="returning">First time here?</div>
 *
 * Include once, before </body>:  <script defer src="/_shared/personalize.js"></script>
 *
 * ponytail: client-side only, no IP/geo call (referrer+UTM+returning covers the 80%; add a geo
 * fetch only if a campaign actually needs country-level copy). first-touch source is remembered.
 */
(function () {
  "use strict";
  var REF = {            // referrer host fragment -> bucket
    "google.": "search", "bing.": "search", "duckduckgo.": "search",
    "reddit.": "reddit", "x.com": "twitter", "twitter.": "twitter", "t.co": "twitter",
    "youtube.": "youtube", "youtu.be": "youtube", "linkedin.": "linkedin",
    "facebook.": "facebook", "instagram.": "facebook", "news.ycombinator": "hn", "github.": "github"
  };
  var KEY = "pz_first_touch";

  function param(name) {
    try { return new URLSearchParams(location.search).get(name); } catch (e) { return null; }
  }
  function fromReferrer() {
    var r = document.referrer || "";
    if (!r) return null;
    var h;
    try { h = new URL(r).host; } catch (e) { return null; }
    if (h === location.host) return null; // internal nav
    for (var frag in REF) if (h.indexOf(frag) !== -1) return REF[frag];
    return "external";
  }
  function isReturning() {
    try { return !!localStorage.getItem("pz_seen"); } catch (e) { return false; }
  }
  function remember(bucket) {
    try {
      localStorage.setItem("pz_seen", "1");
      if (!localStorage.getItem(KEY)) localStorage.setItem(KEY, bucket + "@" + Date.now());
    } catch (e) {}
  }

  function pickBucket() {
    var b = param("aud") || param("utm_source");
    if (b) return b.toLowerCase();
    var ref = fromReferrer();
    if (ref) return ref;
    if (isReturning()) return "returning";
    return "default";
  }

  function apply(bucket) {
    // text swaps
    document.querySelectorAll("[data-pz]").forEach(function (el) {
      var map;
      try { map = JSON.parse(el.getAttribute("data-pz")); } catch (e) { return; }
      if (map && map[bucket] != null) {
        // data-pz-html: page-authored variants may carry markup (e.g. a styled <span>).
        // Static authored strings only - never user input - so innerHTML here is safe.
        if (el.hasAttribute("data-pz-html")) el.innerHTML = map[bucket];
        else el.textContent = map[bucket];
      }
    });
    // show only for matching bucket
    document.querySelectorAll("[data-pz-show]").forEach(function (el) {
      if (el.getAttribute("data-pz-show") !== bucket) el.style.display = "none";
    });
    // hide for matching bucket
    document.querySelectorAll("[data-pz-hide]").forEach(function (el) {
      if (el.getAttribute("data-pz-hide") === bucket) el.style.display = "none";
    });
    document.documentElement.setAttribute("data-pz-bucket", bucket); // for CSS hooks / debugging
  }

  function go() {
    var bucket = pickBucket();
    apply(bucket);
    remember(bucket);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
  else go();
})();
