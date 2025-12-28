<script lang="ts">
  import NavBar from "$lib/components/NavBar.svelte";
  import { aboutCopy } from "$lib/i18n/copy";
  import { hrefForLang, type Locale } from "$lib/i18n/locale";

  export let lang: Locale = "en";

  const t = aboutCopy[lang];
</script>

<svelte:head>
  <title>{t.pageTitle}</title>
  <link rel="stylesheet" href="/css/disclosure.css" />
</svelte:head>

<header class="site-header" aria-label="Primary">
  <a class="logo" href={hrefForLang(lang, "/")}>
    <span class="brand-letters">
      <span class="brand-stem">Stem</span><span class="brand-ly">ly</span>
    </span>
  </a>
  <NavBar lang={lang} active="about" path="/about" />
</header>

<div class="page-content about-page" data-lang={lang}>
  <main>
    <section class="page-lede">
      <h1 class={`hero-title hero-title-${lang}`}>{t.heroTitle}</h1>
      <p class={`hero-subtitle hero-subtitle-${lang}`}>{t.heroSubtitle}</p>
    </section>
    <section
      class="content-section company-info"
      aria-labelledby="company-info-title"
    >
      <article class="detail-card company-info-card">
        <h2 id="company-info-title" class="company-info-title">{t.companyInfoTitle}</h2>
        <p class="company-info-name">{t.companyName}</p>
        <dl class="company-info-list">
          <div class="info-row">
            <dt>{t.addressLabel}</dt>
            <dd>{t.addressValue}</dd>
          </div>

          <div class="info-row">
            <dt>{t.representativeLabel}</dt>
            <dd>{t.representativeValue}</dd>
          </div>

          <div class="info-row">
            <dt>{t.emailLabel}</dt>
            <dd><a href="mailto:contact@stemly.me">contact@stemly.me</a></dd>
          </div>
        </dl>
      </article>
    </section>
  </main>
</div>
