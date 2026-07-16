/**
 * Build-time GitHub data, fetched once per build and shared across pages.
 * Everything here degrades to sane fallbacks when the API is unreachable.
 */

const REPO = 'watzon/pindrop';

export interface RepoInfo {
  stars: number | null;
}

export interface ReleaseInfo {
  version: string;
  downloadUrl: string;
  dmgSizeMB: number | null;
  publishedAt: Date | null;
}

let repoPromise: Promise<RepoInfo> | null = null;
let releasePromise: Promise<ReleaseInfo> | null = null;

export function getRepoInfo(): Promise<RepoInfo> {
  if (!repoPromise) {
    repoPromise = (async () => {
      try {
        const res = await fetch(`https://api.github.com/repos/${REPO}`);
        if (!res.ok) return { stars: null };
        const data = await res.json();
        return { stars: typeof data.stargazers_count === 'number' ? data.stargazers_count : null };
      } catch {
        return { stars: null };
      }
    })();
  }
  return repoPromise;
}

export function getLatestRelease(): Promise<ReleaseInfo> {
  if (!releasePromise) {
    releasePromise = (async () => {
      const fallback: ReleaseInfo = {
        version: 'v1.22.0',
        downloadUrl: `https://github.com/${REPO}/releases/latest`,
        dmgSizeMB: null,
        publishedAt: null,
      };
      try {
        const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`);
        if (!res.ok) return fallback;
        const data = await res.json();
        const dmg = data.assets?.find((a: any) => a.name?.endsWith('.dmg'));
        return {
          version: data.tag_name || fallback.version,
          downloadUrl: dmg?.browser_download_url || fallback.downloadUrl,
          dmgSizeMB: dmg?.size ? Math.round(dmg.size / 1024 / 1024) : null,
          publishedAt: data.published_at ? new Date(data.published_at) : null,
        };
      } catch {
        return fallback;
      }
    })();
  }
  return releasePromise;
}
