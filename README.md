# Face Shape Mirror

An English guide to identifying your face shape and exploring hairstyles. The static site builds with Node.js and has no package dependencies.

Run `npm run build` to generate the site in `dist/`.

## Publishing

Connect Cloudflare Pages to the GitHub repository, select the `main` production branch, use `npm run build` as the build command, and set `dist` as the output directory. Push a commit to `main` to deploy.

Add HTML pages under `src/`. Each one gets a sitemap entry with its latest Git commit date. Use `src/example.html` for `/example` or `src/example/index.html` for `/example/`. Uncommitted pages in a local preview use their file modification time. The build fetches missing Git history in a shallow Cloudflare Pages checkout so an unrelated deploy cannot update every sitemap date.

The root `src/404.html` supplies the Pages not-found response. The build generates `robots.txt` and `sitemap.xml` for the canonical host `https://faceshapemirror.com`.
