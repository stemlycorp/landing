import { appIds } from '$lib/channel-tools/content';
export const match = (value: string) => appIds.some(id => id === value);
