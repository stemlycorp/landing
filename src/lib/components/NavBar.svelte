<script lang="ts">
  import { hrefForLang, locales, type Locale } from "$lib/i18n/locale";
  import { navCopy } from "$lib/i18n/copy";

  export let lang: Locale = "en";
  export let active: "home" | "about" | "disclosure" = "home";
  // The path for the current page without any locale prefix (e.g. "/", "/about").
  export let path = "/";

  const copy = navCopy[lang];
</script>

<nav class="primary-nav" aria-label={copy.navAriaLabel}>
  <a href={hrefForLang(lang, "/about")} aria-current={active === "about" ? "page" : undefined} class:active={active === "about"}>
    {copy.about}
  </a>
  <a
    href={hrefForLang(lang, "/disclosure")}
    aria-current={active === "disclosure" ? "page" : undefined}
    class:active={active === "disclosure"}
  >
    {copy.disclosure}
  </a>
  <a href="mailto:contact@stemly.me">{copy.contact}</a>
  <span class="spacer" aria-hidden="true"></span>
  <div class="lang-switch" aria-label={copy.langSwitchLabel}>
    <span class="icon" aria-hidden="true">🌐</span>
    {#each locales as code}
      <a
        class="lang-button"
        data-lang={code}
        href={hrefForLang(code, path)}
        aria-current={code === lang ? "page" : undefined}
        class:active={code === lang}
        tabindex={code === lang ? -1 : undefined}
      >
        {code.toUpperCase()}
      </a>
    {/each}
  </div>
</nav>
