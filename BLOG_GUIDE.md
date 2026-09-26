# Writing and publishing

1. Double-click `start-blog-studio.cmd` in this folder.
2. Choose **New article** or open an existing article from the left.
3. Write in the large visual editor. Use the toolbar for headings, lists, links, code and image uploads. PNG, JPEG and WebP images up to 4 MB are supported; the editor asks for a description.
4. Choose **Save draft** to keep the post on this computer, or **Preview** to see it on the local site.
5. Choose **Publish to site** when ready. This saves, commits and pushes the post to `main`.

The first time you publish, Git may ask you to sign in. If publishing fails, the draft remains saved locally. Publishing regenerates the article page, archive, sitemap and RSS feed. The live site's deployment follows the repository's Vercel configuration; CLIx is included in that same deployment.
