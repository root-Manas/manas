# Manas

A static portfolio and writing site. The public pages are plain HTML, CSS and JavaScript. Posts live in `blog/*.md`, and `blog/index.json` is generated from their frontmatter.

## Blog Studio

On Windows, double-click `start-blog-studio.cmd`. It starts a private server on `127.0.0.1:4177` and opens the editor in your browser. Node.js and Git must be installed. To stop it, close the console window.

The editor lets you write visually, open and edit existing posts, save locally, preview, and publish with a button. Publish commits the current post and generated index to `main`, then pushes to `origin`. Your existing Git authentication must be set up. The button reports a clear error if the remote branch has moved or Git authentication fails. The hosting provider must be connected to the repository's `main` branch for the live site to update automatically.

You can preview the public site from the Studio's **View site** button. The Studio and server files are excluded from the Vercel deployment by `.vercelignore`.

## Manual maintenance

If you edit Markdown files directly, run `node tools/build-blog.js` and commit `blog/index.json` with the changed post. Frontmatter requires `title`, `description`, and either `date` or `pubDate`. Tags may be a comma-separated `tags` field.
