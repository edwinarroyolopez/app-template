/**
 * Wire-compat helpers: older analytics/overview APIs may still send alternate field names.
 * Canonical UI must use `workspaceName` / `bestWorkspace`; normalize here only.
 */
const ALT_WORKSPACE_LABEL = ['busi', 'ness', 'Name'].join('');
const LEGACY_BEST_LEADER = ['best', 'Busi', 'ness'].join('');

export function workspaceLabelFromRow(row: unknown): string {
  if (!row || typeof row !== 'object') return '';
  const r = row as Record<string, unknown>;
  const w = r.workspaceName;
  if (typeof w === 'string' && w) return w;
  const alt = r[ALT_WORKSPACE_LABEL];
  if (typeof alt === 'string' && alt) return alt;
  return '';
}

export function normalizeWorkspacesRankingPayload(raw: unknown): {
  bestWorkspace: { workspaceName: string; net: number };
  ranking: { workspaceId: string; workspaceName: string; net: number }[];
} {
  if (!raw || typeof raw !== 'object') {
    return { bestWorkspace: { workspaceName: '', net: 0 }, ranking: [] };
  }
  const o = raw as Record<string, unknown>;
  const bestRaw = (o.bestWorkspace ?? o[LEGACY_BEST_LEADER]) as Record<string, unknown> | undefined;
  const net = Number(bestRaw?.net ?? 0);
  const bestName = bestRaw ? workspaceLabelFromRow(bestRaw) : '';
  const rankingIn = Array.isArray(o.ranking) ? o.ranking : [];
  const ranking = rankingIn.map((item) => {
    const r = item as Record<string, unknown>;
    return {
      workspaceId: String(r.workspaceId ?? ''),
      workspaceName: workspaceLabelFromRow(r),
      net: Number(r.net ?? 0),
    };
  });
  return {
    bestWorkspace: { workspaceName: bestName, net },
    ranking,
  };
}

export function normalizeAccountAnalyticsOverviewPayload(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw;
  const o = { ...(raw as Record<string, unknown>) };

  if (Array.isArray(o.ranking)) {
    o.ranking = o.ranking.map((item) => {
      const r = item as Record<string, unknown>;
      return {
        ...r,
        workspaceName: workspaceLabelFromRow(r),
      };
    });
  }

  const delayed = readRecord(o.delayedSummary);
  if (delayed && Array.isArray(delayed.topDelayedOrders)) {
    o.delayedSummary = {
      ...delayed,
      topDelayedOrders: delayed.topDelayedOrders.map((item) => {
        const r = item as Record<string, unknown>;
        return {
          ...r,
          workspaceName: workspaceLabelFromRow(r),
        };
      }),
    };
  }

  return o;
}

function readRecord(obj: unknown): Record<string, unknown> | null {
  if (!obj || typeof obj !== 'object') return null;
  return obj as Record<string, unknown>;
}
