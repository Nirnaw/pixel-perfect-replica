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

- Admin account management uses authenticated server functions, validates admin roles through the caller-scoped client before loading privileged clients, and removes roles through a serialized database function/trigger to protect self and last-admin access.
- ContentManager fields default empty text to empty strings; nullable database fields opt in explicitly, avoiding NOT NULL save failures.
- Before/after views share a small paired-image component; the dedicated admin view filters the existing gallery table rather than creating another content store.
