<script lang="ts">
  import NavBar from '$lib/components/NavBar.svelte';
  import { apps, appIds, kinds, documentFor, labels, pathFor, updated, contact, type AppId, type DocumentKind } from '$lib/channel-tools/content';
  import type { Locale } from '$lib/i18n/locale';

  let { lang, appId, kind }: { lang: Locale; appId: AppId; kind: DocumentKind } = $props();
  const app = $derived(apps[appId]);
  const copy = $derived(labels[lang]);
  const doc = $derived(documentFor(appId, lang, kind));
  const relativePath = $derived(`/${appId}${kind === 'overview' ? '' : `/${kind}`}/`);
</script>

<svelte:head>
  <title>{doc.title} | Stemly</title>
  <meta name="description" content={doc.summary} />
  <link rel="canonical" href={`https://stemly.me${pathFor(lang, appId, kind)}`} />
  <link rel="alternate" hreflang="en" href={`https://stemly.me${pathFor('en', appId, kind)}`} />
  <link rel="alternate" hreflang="ko" href={`https://stemly.me${pathFor('ko', appId, kind)}`} />
</svelte:head>

<div class="tool-shell" lang={lang}>
  <a class="skip" href="#tool-content">{copy.skip}</a>
  <header class="site-header">
    <a class="logo" href={`/${lang}`}>Stemly</a>
    {#key lang}<NavBar {lang} path={relativePath} />{/key}
  </header>
  <div class="tool-content" id="tool-content" tabindex="-1">
    <p class="eyebrow">STEMLY / CHANNEL TOOLS</p>
    <p class="app-name">{app.name}</p>
    <nav class="document-nav" aria-label={lang === 'ko' ? '도구 정보와 정책' : 'Product information and policies'}>
      {#each kinds as target}
        <a href={pathFor(lang, appId, target)} aria-current={target === kind ? 'page' : undefined}>{copy[target]}</a>
      {/each}
    </nav>
    <article aria-labelledby="document-title">
      <h1 id="document-title">{doc.title}</h1>
      <p class="summary">{doc.summary}</p>
      <p class="metadata">{copy.operator} · {copy.updated}: <time datetime={updated}>{updated}</time></p>
      {#each doc.sections as section}
        <section class="policy-section">
          <h2>{section.title}</h2>
          {#each section.paragraphs as paragraph}<p>{paragraph}</p>{/each}
          {#if section.links}
            <ul>{#each section.links as link}<li><a href={link.href}>{link.label}</a></li>{/each}</ul>
          {/if}
        </section>
      {/each}
    </article>
    <aside aria-label={copy.contact}>
      <h2>{copy.contact}</h2>
      <a href={`mailto:${contact}`}>{contact}</a>
      <a href={app.channelUrl}>{copy.channel}: {app.channel}</a>
      <p>{copy.other}</p>
      {#each appIds.filter(id => id !== appId) as id}<a href={pathFor(lang, id)}>{apps[id].name}</a>{/each}
    </aside>
  </div>
</div>

<style>
  .tool-shell { color: #e6f3ff; }
  .tool-content { max-width: 960px; width: 100%; margin: 0 auto; padding: clamp(24px, 5vw, 64px) clamp(20px, 5vw, 48px); overflow-wrap: anywhere; }
  .eyebrow { color: #a9cbef; font-size: .8rem; letter-spacing: .12em; }
  .app-name { font-size: 1.1rem; font-weight: 600; }
  h1 { font-size: clamp(1.8rem, 5vw, 3rem); line-height: 1.2; margin: 32px 0 20px; }
  h2 { font-size: 1.25rem; line-height: 1.5; }
  p, li { line-height: 1.85; }
  .summary { font-size: 1.1rem; }
  .metadata { color: #b3c2d4; font-size: .9rem; }
  .policy-section { border-top: 1px solid #334155; margin-top: 28px; padding-top: 16px; }
  a { color: #a9d3ff; text-underline-offset: .22em; }
  a:hover { color: white; }
  a:focus-visible { outline: 3px solid #83bfff; outline-offset: 4px; }
  .document-nav { display: flex; flex-wrap: wrap; gap: 8px; }
  .document-nav a { display: inline-flex; align-items: center; min-height: 44px; padding: 10px 16px; border: 1px solid #43566f; border-radius: 10px; text-decoration: none; }
  .document-nav a[aria-current='page'] { color: #06111e; background: #a9d3ff; }
  aside { display: flex; align-items: flex-start; flex-direction: column; border: 1px solid #43566f; border-radius: 16px; padding: 20px; margin-top: 36px; }
  aside a { padding: 10px 0; min-height: 44px; }
  .skip { position: absolute; top: -100px; left: 10px; z-index: 100; background: #06111e; padding: 12px; }
  .skip:focus { top: 8px; }
  :global(.tool-shell .lang-button) { min-height: 44px; min-width: 44px; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; }
  :global(.tool-shell .primary-nav a:focus-visible) { outline: 3px solid #83bfff; outline-offset: 4px; }
</style>
