// ISR paths that render 350space imagery. Revalidated on-demand after a
// successful acquisition so new months show up immediately instead of
// waiting out the hourly revalidate window.
export const VESOLJE_PAGE_PATHS = [
  '/vesolje',
  '/vesolje/casovni-pregled',
  '/vesolje/rastje',
  '/vesolje/sneg',
  '/vesolje/planinsko-polje',
] as const
