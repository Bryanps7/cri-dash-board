<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Treat `/leads/quantityStatus` and `/leads/quantityOrigin` as authoritative `{ counts, total }` summaries, falling back to lead rows only when absent; this keeps dashboard totals accurate when the list is filtered or limited.
- Keep dashboard chart selections in the parent page and pass them into table filters; this ensures chart clicks and table controls always show the same selection.
- Keep Nitro build output under `dist` for local builds; deployments need both the server and client artifacts because this is a TanStack Start app.
- Preview the Cloudflare Nitro output with Wrangler using `dist/server/wrangler.json`, not `vite preview`, because Vite looks for an absent `dist/server/server.js` instead of Nitro's `index.mjs`.
- Use `https://cri-leads.onrender.com` as the fixed browser API host; the dashboard has no server selector so all viewers use the same endpoint.
