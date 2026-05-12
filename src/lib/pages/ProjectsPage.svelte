<script lang="ts">
  import NavBar from "$lib/components/NavBar.svelte";
  import { projectsCopy } from "$lib/i18n/copy";
  import { hrefForLang, type Locale } from "$lib/i18n/locale";

  export let lang: Locale = "en";

  const t = projectsCopy[lang];
</script>

<svelte:head>
  <title>{t.pageTitle}</title>
  <meta name="description" content={t.heroSubtitle} />
</svelte:head>

<header class="site-header" aria-label="Primary">
  <a class="logo" href={hrefForLang(lang, "/")}>
    <span class="brand-letters">
      <span class="brand-stem">Stem</span><span class="brand-ly">ly</span>
    </span>
  </a>
  <NavBar lang={lang} active="projects" path="/projects" />
</header>

<div class="page-content projects-page" data-lang={lang}>
  <main>
    <section class="page-lede">
      <h1 class={`hero-title hero-title-${lang}`}>{t.heroTitle}</h1>
      <p class={`hero-subtitle hero-subtitle-${lang}`}>{t.heroSubtitle}</p>
    </section>

    <section class="content-section project-gallery" aria-label={t.featuredLabel}>
      <article class="project-card project-card-featured">
        <div class="project-preview" aria-hidden="true">
          <div class="project-browser-bar">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div class="nati-preview-panel">
            <div class="nati-preview-header">
              <span>Nati</span>
              <span>Naturalize</span>
            </div>
            <div class="nati-preview-text">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div class="nati-preview-result">
              <strong>More natural Korean</strong>
              <p></p>
              <p></p>
            </div>
          </div>
        </div>

        <div class="project-copy">
          <span class="project-kicker">{t.featuredLabel}</span>
          <h2>{t.natiTitle}</h2>
          <p class="project-summary">{t.natiSummary}</p>
          <p class="project-description">{t.natiDescription}</p>

          <div class="project-tags" aria-label="Project tags">
            {#each t.natiMeta as item}
              <span>{item}</span>
            {/each}
          </div>

          <div class="project-actions">
            <a class="project-primary-link" href="https://nati.stemly.me/">
              {t.visitLabel}
            </a>
            <a class="project-secondary-link" href="https://nati.stemly.me/how-it-works/">
              {t.detailsLabel}
            </a>
          </div>
        </div>
      </article>
    </section>
  </main>
</div>
