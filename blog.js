/**
 * Blog System - Loads markdown posts from the /blog folder
 */

// Blog posts configuration
const POSTS = [
    {
        slug: 'thinking-like-infrastructure',
        title: 'Infrastructure Patterns and Recon: How Systems Betray Themselves',
        date: '2026-02-11',
        description: 'Understanding attack surface through operational requirements and organizational constraints rather than tooling.',
        tags: ['recon', 'infrastructure', 'methodology']
    },
    {
        slug: 'antenna-wave-propagation',
        title: 'Antenna Theory and Wave Propagation: Fundamentals for Security Researchers',
        date: '2024-06-05',
        description: 'A dive into the physics of RF communications, antenna design, and the implications for wireless security and signals intelligence.',
        tags: ['RF', 'wireless', 'signals']
    },
    {
        slug: 'cron_jobs_to_priviliage_esc',
        title: 'Cron Jobs and Privilege Escalation: Mechanics and Mitigation',
        date: '2024-05-09',
        description: 'An analysis of misconfigured cron jobs as a vector for privilege escalation in Linux environments.',
        tags: ['linux', 'privilege-escalation', 'security']
    }
];

// Calculate reading time from markdown content
function calculateReadingTime(markdown) {
    const wordsPerMinute = 200;
    const words = markdown.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
}

// Format date for display
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Render blog posts list
function renderBlogPosts(limit = null, append = false) {
    const container = document.getElementById('blog-posts');
    if (!container) return;

    if (POSTS.length === 0) {
        container.innerHTML = `
            <div class="no-posts">
                <p>No blog posts yet. Check back soon!</p>
            </div>
        `;
        return;
    }

    // Sort posts by date (newest first)
    const sortedPosts = [...POSTS].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Determine how many posts to show
    let displayPosts = sortedPosts;
    let showButton = false;

    if (limit && limit < sortedPosts.length) {
        displayPosts = sortedPosts.slice(0, limit);
        showButton = true;
    }

    const postsHTML = displayPosts.map(post => `
        <article class="blog-post" onclick="openPost('${post.slug}')" role="article">
            <div class="blog-date">${formatDate(post.date)}</div>
            <div class="blog-content">
                <h3>${post.title}</h3>
                <p>${post.description}</p>
                ${post.tags ? `<div class="blog-tags">${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
            </div>
        </article>
    `).join('');

    if (append) {
        // If appending (expanding), remove button and add new posts
        const btnContainer = document.querySelector('.show-more-container');
        if (btnContainer) btnContainer.remove();
        container.insertAdjacentHTML('beforeend', postsHTML);
    } else {
        // Initial render
        container.innerHTML = postsHTML;

        // Add Show More button if needed
        if (showButton) {
            const btnHTML = `
                <div class="show-more-container">
                    <button class="show-more-btn" onclick="expandBlogPosts()" aria-label="Show more blog posts">Show More</button>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', btnHTML);
        }
    }
}

// Expand blog posts (show all)
function expandBlogPosts() {
    // Re-render without limit, but technically we just want to append the rest?
    // Actually simplicity: just re-render all.
    renderBlogPosts();
}

// Open a blog post
function openPost(slug) {
    window.location.href = `post.html?slug=${slug}`;
}

// Load and render a specific post (for post.html)
async function loadPost(slug) {
    const container = document.getElementById('article-content');
    if (!container) return;

    try {
        const response = await fetch(`blog/${slug}.md`);
        if (!response.ok) throw new Error('Post not found');

        const markdown = await response.text();

        // Parse Frontmatter
        const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
        const match = markdown.match(frontmatterRegex);

        let content = markdown;
        let metadata = {};

        if (match) {
            // Remove frontmatter from content
            content = markdown.replace(frontmatterRegex, '').trim();

            // Parse metadata (simple key-value parser)
            const fmLines = match[1].split('\n');
            fmLines.forEach(line => {
                const parts = line.split(':');
                if (parts.length >= 2) {
                    const key = parts[0].trim();
                    let value = parts.slice(1).join(':').trim();
                    // Remove quotes if present
                    if (value.startsWith('"') && value.endsWith('"')) {
                        value = value.slice(1, -1);
                    }
                    metadata[key] = value;
                }
            });
        }

        // Calculate reading time
        const readingTime = calculateReadingTime(content);

        // Generate table of contents
        const toc = generateTableOfContents(content);

        document.title = `${metadata.title || 'Blog Post'} - Manas`;

        // Update meta tags for social sharing
        updateMetaTags(metadata, slug);

        const html = `
            <header class="post-header">
                <span class="post-date">${formatDate(metadata.pubDate || new Date())}</span>
                <h1 class="post-title">${metadata.title || 'Untitled'}</h1>
                <div class="post-meta">
                    <span class="reading-time" aria-label="Estimated reading time">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        ${readingTime} min read
                    </span>
                </div>
            </header>
            ${toc ? `<nav class="table-of-contents" role="navigation" aria-label="Table of contents">${toc}</nav>` : ''}
            <div class="post-content">
                ${marked.parse(content)}
            </div>
            <div class="post-footer">
                <div class="share-buttons">
                    <span>Share:</span>
                    <button onclick="sharePost('twitter')" aria-label="Share on Twitter" class="share-btn twitter">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
                        </svg>
                    </button>
                    <button onclick="sharePost('linkedin')" aria-label="Share on LinkedIn" class="share-btn linkedin">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"></path>
                            <circle cx="4" cy="4" r="2"></circle>
                        </svg>
                    </button>
                    <button onclick="copyLink()" aria-label="Copy link" class="share-btn copy">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"></path>
                            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Add copy buttons to code blocks
        addCopyButtonsToCodeBlocks();

        // Robustly trigger MathJax
        const triggerMathJax = () => {
            if (window.MathJax && window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise().catch(err => console.error('MathJax error:', err));
            } else {
                // Poll every 100ms until MathJax is ready
                setTimeout(triggerMathJax, 100);
            }
        };

        triggerMathJax();

    } catch (error) {
        console.error('Error loading post:', error);
        container.innerHTML = `
            <div class="error">
                <h2>Post Not Found</h2>
                <p>The blog post you're looking for doesn't exist or could not be loaded.</p>
                <a href="archive.html" class="back-link" style="justify-content: center; margin-top: 24px;">Back to Archive</a>
            </div>
        `;
    }
}

// Generate table of contents from markdown
function generateTableOfContents(markdown) {
    const headings = [];
    const lines = markdown.split('\n');
    
    lines.forEach(line => {
        const match = line.match(/^(#{2,3})\s+(.+)/);
        if (match) {
            const level = match[1].length;
            const text = match[2];
            const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
            headings.push({ level, text, id });
        }
    });

    if (headings.length < 3) return null; // Don't show TOC for short posts

    const tocItems = headings.map(h => 
        `<li class="toc-level-${h.level}"><a href="#${h.id}">${h.text}</a></li>`
    ).join('');

    return `
        <details class="toc-wrapper" open>
            <summary>Table of Contents</summary>
            <ul class="toc-list">${tocItems}</ul>
        </details>
    `;
}

// Update meta tags for social sharing
function updateMetaTags(metadata, slug) {
    const url = `${window.location.origin}/post.html?slug=${slug}`;
    const title = metadata.title || 'Blog Post';
    const description = metadata.description || '';

    // Update or create meta tags
    const metaTags = [
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: url },
        { property: 'og:type', content: 'article' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
    ];

    metaTags.forEach(tag => {
        const key = tag.property ? 'property' : 'name';
        const value = tag.property || tag.name;
        let element = document.querySelector(`meta[${key}="${value}"]`);
        
        if (!element) {
            element = document.createElement('meta');
            element.setAttribute(key, value);
            document.head.appendChild(element);
        }
        element.setAttribute('content', tag.content);
    });
}

// Add copy buttons to code blocks
function addCopyButtonsToCodeBlocks() {
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach(block => {
        const pre = block.parentElement;
        if (pre.querySelector('.copy-btn')) return; // Already added

        const button = document.createElement('button');
        button.className = 'copy-btn';
        button.setAttribute('aria-label', 'Copy code to clipboard');
        button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
            </svg>
        `;

        button.addEventListener('click', async () => {
            const code = block.textContent;
            try {
                await navigator.clipboard.writeText(code);
                button.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                `;
                setTimeout(() => {
                    button.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                        </svg>
                    `;
                }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        });

        pre.style.position = 'relative';
        pre.appendChild(button);
    });
}

// Share post on social media
function sharePost(platform) {
    const url = window.location.href;
    const title = document.querySelector('.post-title')?.textContent || 'Check out this post';

    const shareUrls = {
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    };

    if (shareUrls[platform]) {
        window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
}

// Copy link to clipboard
async function copyLink() {
    const url = window.location.href;
    try {
        await navigator.clipboard.writeText(url);
        const btn = document.querySelector('.share-btn.copy');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        `;
        setTimeout(() => {
            btn.innerHTML = originalHTML;
        }, 2000);
    } catch (err) {
        console.error('Failed to copy link:', err);
    }
}

// Initialize blog system
document.addEventListener('DOMContentLoaded', () => {
    // Render posts list if container exists
    if (document.getElementById('blog-posts')) {
        // Check if we are on the home page (index.html or root) to limit posts
        const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');
        // Also check if we are on archive.html
        const isArchivePage = window.location.pathname.endsWith('archive.html');

        if (isArchivePage) {
            renderBlogPosts(); // Show all on archive
        } else {
            renderBlogPosts(1); // Show only latest 1 on home
        }
    }

    // Smooth scroll for navigation (only on main page with hash links)
    document.querySelectorAll('nav a, .logo').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.includes('#') && !href.startsWith('http')) {
                // If we're not on the index page and link is to a section
                if (!window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('/')) {
                    // Let default behavior happen (navigation to index.html#section from index.html)
                    return;
                }

                // If we are on index page
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const targetId = href.substring(1);
                    const targetSection = document.getElementById(targetId);
                    if (targetSection) {
                        targetSection.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            }
        });
    });
});
