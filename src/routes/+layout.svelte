<!-- src/routes/+layout.svelte -->
<script>
  import favicon from "$lib/assets/favicon.svg";

  let { children } = $props();
</script>

<svelte:head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin="anonymous"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap"
    rel="stylesheet"
  />
  <link rel="stylesheet" href="/css/style.css" />
  <link rel="icon" href={favicon} />
</svelte:head>

<div class="app-root">
  <main>
    {@render children()}
  </main>
  <footer class="site-footer">
    <p>© 2025 Stemly Corp. All rights reserved.</p>
    <p>Unit 7421, 9-1 Gugal-ro 60beon-gil, Giheung-gu, Yongin-si, Gyeonggi-do</p>
    <p>contact@stemly.me</p>
  </footer>
</div>
