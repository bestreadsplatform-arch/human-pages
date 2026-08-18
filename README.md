# Human Pages

Create a complete, fully functional single-page web application called "Bestreads", designed as a premium, minimalist "Product Hunt" for 100% human-written books, poetry, and texts (Strictly NO AI allowed). 

DESIGN SYSTEM & VISUALS:
- Theme: Editorial, luxury feel. Ample whitespace, soft shadows, warm cream/off-white background.
- Typography: Premium Serif (like Playfair Display or Merriweather) for literary titles and major headers. Sharp, ultra-clean Sans-serif for all metrics, numbers, and UI actions.
- Layout: Responsive grid with a toggleable left sidebar, a main dynamic content area, and a context-aware right sidebar.

MODULE 1: REVOLUTIONARY AUTHENTICATION & LOGIN BLOCKS
- Create a dual Sign Up / Sign In card component.
- Handle Unique Usernames: Every registration input requires a distinct "@username" handler in addition to their display name (to avoid collisions between multiple users named Elena or Martha).
- Secret Magazine Passkey: The registration form must include an optional field labeled "Secret Access Code". If a user inputs the exact secret code "thof1856!", their account global state updates with a persistent flag: "is_hall_of_fame_editor: true".
- Landing Page Background: The homepage shows an infinite horizontal scrolling carousel of 20 premium flat-toned book covers (pauses on hover, reveals a floating Upvote arrow button with a smooth transition). Clicking "Sign In" applies a heavy glassmorphic backdrop-blur-md overlay over the active carousel, isolating only the login/signup card container in the center.

MODULE 2: AUTHENTICATED DASHBOARD & COMPLEX DISCOVERY LOGIC
- Header Area: Minimalist global search bar capable of parsing Book Titles, Text Content, or Hashtags (e.g. #POETRY). Includes a user profile avatar displaying their unique @username and a prominent "Write Something Human" button.
- Dynamic Filter Ribbon: Global state buttons for "TRENDING TODAY", "TRENDING WEEK", and "TRENDING MONTH", followed by 3 customizable genre filter slots chosen dynamically by the user.
- Interactive Top 10 Columns: Displays a beautifully numbered grid ranking the current top 10 books based on upvotes within the time filter. Include an elegant layout compression toggle on the far-left sidebar that smoothly collapses/hides the Top 10 grid. If a user performs a hashtag search, the Top 10 grid automatically hides.
- CEST Reset Logic: Implement simulated time logic where upvote pools calculate and reset automatically at 00:00 AM CEST daily, weekly (Mondays at 00:00 AM CEST), and monthly.
- Multi-Sum Top Authors Widget (Right Sidebar): Lists authors with highest engagement. Its ranking calculations change live based on the active ribbon filter. "Trending Today" automatically sums all upvotes received across an author's entire published catalog from 00:00 AM CEST to the next 00:00 AM CEST. The same cumulative logic scales for weekly and monthly filters.
- Zero-Toxicity Stream: Positioned beneath the main panel, displaying a vertical feed of books outside the Top 10 styled cleanly like an X (Twitter) stream with layout dividers. Tabs toggle between "For You" and a custom "Following" feed. Absolutely NO public comments, NO likes, and NO dislikes counters are allowed to prevent creator anxiety. Available actions: Upvote/Unvote, Share Link, Follow @username, and Report Content.

MODULE 3: THE WRITER STUDIO & TEXT ENGINE
- Page-Break Simulator Canvas: A distraction-free editing layout featuring inputs for Title, Summary, and a maximum of 5 custom hashtags. The writing text editor must simulate physical book page-breaks or clean A4 paper layouts, drawing a light visual line where content splits so authors can avoid cut-off paragraphs.
- Cover Art Studio: An "Upload Cover Art" button that opens an image cropper/positioner modal window, forcing any uploaded graphic into a strict book-cover aspect ratio via zoom and pan controls.
- Anti-AI & Trust Anchors: Bottom status bar displaying real-time word counting (0/2000), an interactive "Originality Scanner" fixed at 100% Originality, and a green badge for "Verified Human Account". A bold note states: "No DMs on Bestreads – just reading". Includes a "Report Plagiarism/AI" button that routes items to a simulated human moderation board.

MODULE 4: "YOUR BOOKSHELF" GRAPH & METRICS MATRIX
- Dashboard Node: Clicking the "Bookshelf" icon loads an index of the user's Drafts and Published items using minimal book icons. Selecting any published book displays deep data visualization panels matching the user's payment tier:
  * FREE TIER ENHANCEMENT: Limits graph granularity. Free tier users only see one static 3-pillar bar chart representing Total Views, Total Upvotes, and Total Shares computed from the book's initial launch date.
  * PRO TIER GRAPH ENGINE: Unlocks the full analytical line graphs including: "Today" (hour-by-hour trends starting from midnight CEST), "This Week" (day-by-day spikes starting from Monday midnight CEST), and "This Month". It breaks down specific counts for Reads, Current Reads, Upvotes, and Shares.

MODULE 5: THE ARTISTIC "HALL OF FAME" MAGAZINE
- Look and Feel: An editorial space within the dashboard styled elegantly like a high-end Notion document decorated with floating illustrations of quill pens and calligraphy paintbrushes.
- Restricted Editing Privilege: Only the 5 specific users who successfully provided the secret access code "thof1856!" during signup see an "Edit Article" interface button here. All other standard users can only read the content.
- Features: Handles the showcase of 5 breakout rising authors every 2-3 semanas, rendering interactive layouts for text interviews, mock audio voice player logs, and video conference placeholders.

MODULE 6: STRIPE SUBSCRIPTION TIER ENFORCEMENT
- Include a testing profile switch to dynamically toggle between user account types to test privileges:
  * FREE ACCOUNT STATE: Readers can browse feeds but can only add up to 5 books to their personal library. Authors can have a maximum of 5 saved Drafts, and their storefront links (Gumroad, Amazon) appear as basic, unstyled plain text links.
  * PRO SUBSCRIPTION STATE (Simulated 9€/month or 69€/year billing): Readers unlock unlimited library storage slots and advanced sorting filters (e.g. filter feed by length <50 pages or specific upvote count). Authors unlock unlimited Drafts, the interactive Pro analytics line charts, and their Amazon/Gumroad storefront links turn into a highly stylized, eye-catching Call-To-Action button inside their book preview cards.

Populate the initial application state with rich mock data for 10 distinct authors (with custom unique @usernames), varied book summaries, active filters, and stylized chart data to make the entire workspace interactive from the very first click.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/aca5014b-afde-4098-ba01-7ef01e757c21).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
