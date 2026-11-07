<script lang="ts">
  import ChannelToolPage from '$lib/pages/ChannelToolPage.svelte';
  import type { PageData } from './$types';
  let { data }: { data: PageData } = $props();
</script>
<ChannelToolPage lang={data.lang} appId={data.appId} kind={data.kind} />
