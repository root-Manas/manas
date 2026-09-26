# Manas

A black, white and red cybercore portfolio and personal homelab. The site includes an IP check, DNS lookup and local SHA-256 tool. The IP and DNS tools only call public services when clicked. Animations use a vendored Anime.js bundle and respect reduced motion settings.

The CLIx project is included at `/clix/` in this repository. It is served by the **same Vercel deployment** as the portfolio; the portfolio links to it directly. The original CLIx source remains at `D:/Projects/CLIx` for independent development. To refresh the hosted copy, copy its public HTML, CSS, JavaScript and data files into `clix/`, then deploy this repository.

Posts live in `blog/*.md`. `node tools/build-blog.js` generates `blog/index.json`, static article pages in `articles/`, the archive, sitemap and RSS feed. The three research articles include original diagrams and interactive simulations.

## Blog Studio

On Windows, double-click `start-blog-studio.cmd`. It starts a private server on `127.0.0.1:4177` and opens the editor in your browser. Node.js and Git must be installed. To stop it, close the console window.

The editor lets you write visually, upload images, open and edit existing posts, save locally, preview, and publish with a button. Publish commits the post, its uploaded images and generated public pages to `main`, then pushes to `origin`. Your existing Git authentication must be set up. The button reports an error if the remote branch has moved or Git authentication fails. Vercel deploys the portfolio and CLIx from this one repository.

You can preview the public site from the Studio's **View site** button. The Studio and server files are excluded from the Vercel deployment by `.vercelignore`.

## Manual maintenance

If you edit Markdown files directly, run `node tools/build-blog.js` and commit the generated files with the post. Frontmatter requires `title`, `description`, and either `date` or `pubDate`. Tags may be a comma-separated `tags` field. Add an `image` path for a per-article social preview.

To refresh the WebDorks demo video from a local clone at `D:/Projects/webdorks`, install Playwright Core and its FFmpeg helper, then run `node tools/record-webdorks.js`. The committed video and poster are in `public/assets/`.
