import { appIds, kinds, type AppId, type DocumentKind } from '$lib/channel-tools/content';
import type { EntryGenerator, PageServerLoad } from './$types';
import { locales } from '$lib/i18n/locale';
export const trailingSlash = 'always';
export const entries: EntryGenerator = () => locales.flatMap(lang => appIds.flatMap(tool => kinds.map(kind => ({ lang, tool, ...(kind === 'overview' ? {} : { document: kind }) }))));
export const load: PageServerLoad = ({ params }) => ({
  lang: params.lang === 'ko' ? 'ko' as const : 'en' as const,
  appId: params.tool as AppId,
  kind: (params.document ?? 'overview') as DocumentKind
});
