<script lang="ts">
  import NavBar from "$lib/components/NavBar.svelte";
  import { disclosureCopy } from "$lib/i18n/copy";
  import { hrefForLang, type Locale } from "$lib/i18n/locale";

  export let lang: Locale = "en";

  const t = disclosureCopy[lang];
</script>

<svelte:head>
  <title>{t.pageTitle}</title>
  <link rel="stylesheet" href="/css/disclosure.css" />
  <script src="/js/main.js"></script>
  <script type="module" src="/js/disclosure.js"></script>
</svelte:head>

<header class="site-header" aria-label="Primary">
  <a class="logo" href={hrefForLang(lang, "/")}>
    <span class="brand-letters">
      <span class="brand-stem">Stem</span><span class="brand-ly">ly</span>
    </span>
  </a>
  <NavBar lang={lang} active="disclosure" path="/disclosure" />
</header>

<main data-lang={lang}>
  <div class="page-content disclosure-page">
    <section class="page-lede">
      <h1>{t.heroTitle}</h1>
      <p>{t.heroSubtitle}</p>
      {#if lang === "ko"}
        <a class="disclosure-admin-link" href="/ko/disclosure-admin.html">관리자</a>
      {/if}
    </section>

    <section class="content-section disclosure-board">
      <div class="disclosure-layout" aria-live="polite">
        <div class="list-card">
          <p class="loading" id="loading-indicator" style="display:none;">{t.loading}</p>
          <p class="error-state" data-error hidden>{t.loadError}</p>
          <p class="empty-state" id="empty-indicator" style="display:none;">{t.empty}</p>
          <ul class="disclosure-list" id="disclosure-list"></ul>
        </div>
        <article class="detail-card">
          <div class="empty-state" data-empty>{t.detailEmpty}</div>
          <div class="detail-meta" data-detail-meta hidden>
            <span class="pill pinned" data-detail-pinned>{t.pinnedLabel}</span>
            <span class="pill date" data-detail-date></span>
          </div>
          <div class="detail-title" data-detail-title role="heading" aria-level="2" hidden></div>
          <div class="detail-body" data-detail-body hidden></div>
        </article>
      </div>
    </section>
  </div>
</main>
