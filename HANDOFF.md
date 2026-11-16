# HANDOFF: outside review of SubCheck

Branch: `experiment/outside-review`, cut from `main` at `5bf6fa7` on Nov 16, 2026.
Nothing was committed to `main`, merged, or deployed. `main` had not moved when
this branch was pushed.

Reviewed: every HTML page (home, calculator, results, privacy, audit checklist,
404, blog index, six posts), `js/calculator.js`, `js/storage.js`,
`css/styles.css`, the Pages functions, `sitemap.xml`, `robots.txt`, `_headers`.

How it was checked: by reading the code and copy, running the changed
JavaScript through a syntax check, unit-testing the one changed matcher in
Node, and parsing every structured-data block as JSON. **Nothing here was
tested in a real browser.** Section 3 is the browser test list for a human.

---

## 1. Changes made, and why

Eighteen commits, one fix each, most valuable first. Any one can be reverted on
its own with `git revert <hash>`.

### The tool shows wrong or misleading numbers

| Commit | Change | Why |
|---|---|---|
| `e7f017f` | Results: the "What if I cancelled" simulator now adds up exact monthly costs. | Each checkbox carried the monthly cost already rounded to cents, so ticking a $100/year plan said it would save $99.96/year. Only the displayed total is rounded now. |
| `16b16a9` | Calculator: CSV import no longer reads "Every 2 weeks" or "Every 2 months" as a two-year plan. | The frequency matcher treated anything containing "every 2" as every 2 years and divided the cost by 24, so the charge nearly vanished from the total. Two-year plans now need the word "year" or "biennial". (`calculator.js` version bumped.) See item 2.6 for what this does not solve. |
| `0f33656` | Results: the "Coming up" line now says how many dated subscriptions are due in the next 30 days. | It gave the 30-day amount but then counted every dated subscription, including ones renewing months away. It now reads "$X due in the next 30 days from 2 of your 5 dated subscriptions". |
| `a807d88` | Results: the CSV export escapes double quotes. | A service name containing `"` broke its row, and the file then failed to import back into the calculator. |
| `627df98` | Results: calendar export events carry a `DTSTAMP`. | The iCalendar standard requires it on every event; stricter calendar apps reject or warn without it. |
| `1e1a951` | Results: the streaming rotation tip no longer appears twice. | With three or more streaming services as the biggest category, "Ways to Save" showed two cards giving the same advice. |

### Accessibility and mobile

| Commit | Change | Why |
|---|---|---|
| `1d9531b` | Calculator rows: the cost field's screen-reader label is now "Cost per billing period, in dollars"; the delete button and the small "Next renewal", "Whose bill?" and "My share" labels are darker in light mode. | The field was announced as "Monthly cost" even on yearly rows, which would lead a screen-reader user to type the wrong amount. The labels were light grey on white, far under the 4.5:1 contrast minimum. Dark mode is unchanged. (`calculator.js` version bumped.) |
| `9f31dd9` | Calculator: the validation warning sits on its own line above the buttons. | It was inside the button row, so from tablet width up it showed as a squeezed third column beside "Calculate Total" and "Clear All". |
| `b643713` | Results: yearly totals between $1,500 and $3,000 are drawn in amber-600 instead of yellow-500. | Yellow on white was under 2:1 contrast for the most important number on the page. |

### SEO and structured data

| Commit | Change | Why |
|---|---|---|
| `b56d135` | Calculator page: a real meta description, a social title that matches the page title, and a short static "How the total is worked out" section under the tool. | This is the main search landing page, but nearly all its content is drawn by JavaScript and its description was one generic line. The new section states the conversion for each billing frequency exactly as the code does it, and links to the privacy page and the cancel guides. |
| `cdb1fd3` | Blog posts: `og:type` is now `article` on all six; four posts gain `mainEntityOfPage`; the spending post's structured-data author matches its visible "Ron Satha" byline; the $313 post's structured data gains a description. | The structured data and social tags disagreed with what the pages are and show. |
| `182a224` | Blog posts: each ends with a "Keep reading" block (three related posts plus the blog index). | Posts linked only to the calculator, so they were reachable from the blog index and nowhere else. |
| `f906792` | Home: one line under the two blog cards links to the blog index and names the cancel guides. | The cancel guides and the tracker comparison had no link from the home page body. |
| `a828dcc` | Home: minimal `WebSite` structured data (name and URL). | It is what Google reads to show "SubCheck" as the site name rather than the bare domain. |
| `98e615d` | Results: "How to cancel" links and the "Start Over" redirect use the clean URLs. | They pointed at `.html` paths, which Cloudflare Pages answers with a redirect. |
| `ad061f7` | 404 page: its own description and social tags, a `noindex` tag, root-relative stylesheet and favicon. | It carried the privacy page's description, social title and `og:url`. Its relative asset paths also break for a missing URL under a folder (for example `/blog/anything`), leaving the 404 unstyled. `styles.css` itself did not change, so its version string did not either. |

### Consistency and voice

| Commit | Change | Why |
|---|---|---|
| `69f8087` | Blog: all 17 em-dashes removed from the $313 audit post (14, including its title, heading and structured-data headline) and the blog index (3). | House rule. Each became a colon, comma, brackets or full stop; no wording or figures changed. The $313 post's social title now matches its page title. No em-dashes remain in any page, script or image text. |
| `50a617e` | $313 audit post: "stores no data" became "keeps your list on your own device and nowhere else". | The home page, FAQ and privacy page all say the list is stored in the browser's local storage. The post now makes the same claim as the rest of the site. |

The home page hero line, analytics, the email signup endpoint, and every
price were left untouched. No shared CSS file changed.

---

## 2. Found but not fixed, ranked by importance

### Owner decisions

**2.1 Retired "no premium tier" promise (the flagged honesty item).**
One page still makes it: **`index.html`**, trust strip, card "Free, with no
catch": "The calculator is free and stays free: no premium tier, no ads inside
the tool, no trial that quietly converts." No other page, FAQ answer or
structured-data block repeats it. Left as is; the replacement wording is yours.

**2.2 Shared plans: the headline total uses the full bill, not your share.**
If a user marks a plan as shared and enters "My share $", the monthly and
yearly totals on the results page still add the full cost; the share appears
only in the shared-plans panel. For a tool that promises "one honest number",
a user splitting a $22.99 plan three ways may reasonably expect their share in
the total. Changing it alters every user's headline number, so it is a product
decision, not a bug fix.

**2.3 "Your spending is above average" has no stated basis.**
`results.html` shows this card, with "you're spending more than the typical
household", for any total over $2,000 a year. The site's own cited figures put
the average between $1,080 and $2,628 a year, so a $2,100 total is called above
average while sitting inside the site's own range. Either tie the threshold to
a cited figure or soften the wording.

**2.4 The spending post presents 2022 data as 2026.**
`blog/how-much-americans-spend-on-subscriptions.html` is titled "...in 2026"
and says it shows "where things stand in 2026", but its headline $219 and $111
figures are from the 2022 C+R Research survey (the home page says so plainly).
Several other figures in the post have no source link at all: "almost 1 in 4
Americans spend over $100 a month on streaming alone", "close to $200 a year"
wasted, and the 6.1 streaming services figure. "Annual plans typically save
15-20%" on the results page is also unsourced. I added nothing and removed
nothing; these need a source or a rewrite.

**2.5 Hulu guide: service names look out of date.**
`blog/how-to-cancel-hulu.html` refers to "Max" in some places and "HBO Max" in
another (line 100), and to "ESPN+" in the bundle steps (lines 122, 125).
Coverage I saw on Nov 16, 2026 while checking Disney and Hulu prices used
"HBO Max" and "ESPN Select" for these services. I did not keep the page
addresses, so please confirm against Hulu's help centre before editing. At
minimum the page should use one name for Max throughout.

**2.6 CSV import cannot represent some billing cycles.**
The tool has no fortnightly or two-monthly frequency. After commit `16b16a9`,
"Every 2 weeks" imports as weekly and "Every 2 months" as monthly, which
overstates the cost by double (before, it understated it 24-fold or more).
The honest fixes are to add those frequencies or to warn on import; both are
feature work. Also: an amount written European style ("12,99") is read as
$1,299; a quoted CSV field containing a line break splits the row.

### Technical, worth doing

**2.7 Tailwind is loaded from the Play CDN on every page.**
`cdn.tailwindcss.com` is a development build that compiles styles in the
browser. It slows first paint on mobile, which affects search ranking, and
Tailwind says not to use it in production. Replacing it with a built
stylesheet touches every page, so it is a project of its own.

**2.8 Privacy page: Chart.js is not loaded from a CDN.**
`privacy.html` line 86 says "Tailwind CSS and Chart.js, loaded from public
content delivery networks". Chart.js is served from the site itself
(`js/chart.umd.min.js`); only Tailwind comes from a CDN. The policy over-
discloses rather than under-discloses, but it is inaccurate. Not edited
because privacy wording and its "last updated" date are yours.

**2.9 One analytics event sends a button label.**
`js/calculator.js` line 346 sends `recall_used` with the name of the "jog your
memory" chip the user tapped (a fixed label such as a charge type, not typed
text). The privacy page says events "never include the service names or
amounts you type", which is literally true, but the event does reveal which
kind of charge the user added. Analytics was off limits, so it is only flagged.

**2.10 Monthly renewals on the 29th to 31st can drift in the calendar export.**
The next-renewal calculation steps a month at a time from the entered date; a
plan renewing on Jan 31 rolls to early March rather than Feb 28. Affects the
"Coming up" list and the `.ics` file for those dates only.

**2.11 Remaining low-contrast grey text.**
Many secondary lines across the site use `text-gray-400` on white (about
2.5:1). I fixed the form labels a user needs to complete the tool; the rest
(step indicator, card captions, footers) is a site-wide sweep.

**2.12 Navigation and footer differ between page families.**
Home and blog index share one nav; the calculator, results and the five
article-style posts each use slimmer variants, and post footers carry only a
copyright and privacy link. Consistent nav and a footer with Calculator, Blog
and Privacy on every page would help both users and crawlers.

### Minor

- **Sitemap.** `audit-checklist` is not in `sitemap.xml` and has no `noindex`.
  Since the checklist is the reward for signing up, decide whether you want it
  found in search (add it) or kept as the reward (add `noindex`). I also did
  not touch `lastmod` dates; update them for the pages changed here on the day
  you merge.
- **Home heading order.** The trust strip uses `h3` headings before the page's
  first `h2`. Harmless to users; a screen-reader outline skips a level.
- **$313 post has no visible byline**, and its structured data names SubCheck
  (an organisation) as author although it is written in the first person. The
  other posts name Ron Satha. Add a byline and I would switch the data to match.
- **Audit advice differs by page.** The spending post says to re-audit "every
  3 months"; the results page says "once or twice a year"; the checklist sets
  a reminder a year out.
- **`confirm()` and `alert()` dialogs** are used for Clear All and import
  messages. They work, but are jarring on mobile.
- **"iCloud+" preset at $2.99** does not say which storage tier it is.
- **No Content-Security-Policy** in `_headers`.
- **Idea that would break the privacy architecture (do not build):** saving a
  list to an account so it follows the user across devices. Listed only
  because the rules asked for such ideas to be labelled; the existing CSV
  export and import already cover moving a list without a server.

### Prices checked

Checked by web search on Nov 16, 2026 against the calculator presets. All of
these **matched** what the site shows, so nothing is flagged as out of date:
Netflix Standard $19.99, Spotify Premium $12.99, YouTube Premium $15.99,
Disney+ $21.49, Hulu $21.49, Apple Music $11.99, Xbox Game Pass Ultimate
$22.99. Sources I can cite for Apple Music $11.99 and Spotify $12.99:
[MacRumors, Jul 19, 2026](https://www.macrumors.com/2026/07/19/apple-just-raised-more-prices/),
[TidBITS, Jul 20, 2026](https://tidbits.com/2026/07/20/apple-increases-apple-music-apple-one-and-applecare-prices/),
[Music Business Worldwide](https://www.musicbusinessworldwide.com/apple-music-hikes-subscription-prices-as-a-result-of-rising-licensing-costs/).
For the other five I did not keep the page addresses.

**Not checked:** Amazon Prime $14.99, ChatGPT Plus $20.00, Adobe CC $69.99,
iCloud+ $2.99, and every competitor price and plan detail in
`blog/simplifi-vs-monarch-vs-rocket-money.html`. Treat those as unverified,
not as confirmed.

---

## 3. How to test each change in a browser

Use the Cloudflare Pages preview for this branch (or any static server at the
repo root that serves clean URLs). Test at a phone width and a desktop width.

1. **What-if total (`e7f017f`).** Calculator: add one row, name "Test", cost
   100, frequency Yearly. Calculate. On results, tick it under "What if I
   cancelled". Expect "$8.33/month, or $100.00/year" (was $99.96).
2. **CSV frequency (`16b16a9`).** Save a file with the lines
   `Name,Cost,Frequency` / `A,10,Every 2 weeks` / `B,100,Every 2 years` and
   import it. Expect row A set to Weekly and row B set to Every 2 years.
3. **Coming up count (`0f33656`).** Add one monthly row with a renewal date
   next week and one yearly row with a renewal date six months out. Results
   should read "...due in the next 30 days from 1 of your 2 dated
   subscriptions."
4. **CSV export quotes (`a807d88`).** Name a row `My "fun" app`, calculate,
   export CSV, open it in a spreadsheet: the name sits in one cell. Clear the
   calculator and import the file: the row comes back with its name intact.
5. **Calendar export (`627df98`).** With at least one dated row, export the
   calendar file and open it in Apple Calendar, Google Calendar and, if you
   can, Outlook. Events import with no warning. In a text editor each event
   has a `DTSTAMP:` line.
6. **Streaming tip (`1e1a951`).** Add Netflix, Disney+ and Hulu only. Results
   "Ways to Save" shows one rotation card, not two. Then with exactly two
   streaming rows, one rotation card still appears.
7. **Row labels (`1d9531b`).** In light mode, the small labels and the delete
   "x" are clearly readable. With VoiceOver or NVDA, focus a cost field: it
   reads "Cost per billing period, in dollars". Check dark mode looks as before.
8. **Warning position (`9f31dd9`).** On desktop width, clear all rows and
   press Calculate Total. The amber warning spans the full width above both
   buttons.
9. **Total colour (`b643713`).** Enter one $150 monthly row ($1,800/year).
   The big yearly figure is a readable amber in light and dark mode.
10. **Calculator page copy (`b56d135`).** Below the tool, "How the total is
    worked out" appears, reads well on a phone, and all five links work. View
    source: the description and `og:title` are the new ones.
11. **Clean URLs (`98e615d`).** With a Netflix, Hulu or Spotify row, results
    shows "How to cancel" links that open the guides. "Start Over" returns to
    `/calculator`.
12. **404 (`ad061f7`).** Visit `/blog/does-not-exist`. The page is fully
    styled with its favicon. View source: `noindex`, and no privacy text.
13. **Em-dashes and storage claim (`69f8087`, `50a617e`).** Read the $313 post
    and blog index once for flow; search each page for the em-dash character
    and find none. The "How I built it" paragraph says the list is kept on
    your own device.
14. **Structured data (`cdb1fd3`, `a828dcc`).** Run the home page, one cancel
    guide, the spending post and the $313 post through Google's Rich Results
    Test and the Schema.org validator. Expect no errors.
15. **Internal links (`182a224`, `f906792`).** Each post ends with "Keep
    reading" and four working links, none pointing at the post itself. The
    home page shows the "All guides" line under the two blog cards, and the
    hero line is unchanged.

Also confirm in the Network tab that `calculator.js?v=20261116b` is what loads.

---

## 4. My working rules

These are the rules I followed when planning, checking, and fixing this work.

**Planning**

1. Read everything before changing anything. I read every page, script,
   function and config file first and kept one list of findings, so fixes
   could be ordered by value instead of by the order I met them.
2. Rank by harm to the user. A wrong number in the tool comes before an
   accessibility barrier, which comes before search visibility, which comes
   before polish.
3. One fix per commit. If a change needed a second sentence to explain a
   second thing, it became a second commit, so any one can be reverted alone.
4. The brief's hard rules outrank my own judgement. Where I thought copy could
   be better but the brief said flag it (prices, the premium promise, privacy
   wording), I flagged it.

**Checking**

5. Verify from the code, not from the description. Every arithmetic claim in
   new copy (the frequency conversions) was taken from the functions that do
   the sums, and every figure on the example panels and in the posts was
   re-added by hand.
6. Check before calling a price stale. I looked up current prices before
   deciding whether to flag one, and I list separately the ones I did not
   check, so "not flagged" is never mistaken for "confirmed".
7. Test what can be tested here, and say what was not. Changed scripts were
   syntax-checked, the changed matcher was run against sample inputs, and all
   structured data was parsed. I had no browser, so I say so at the top
   instead of implying the changes were seen working.
8. Re-check the rules mechanically at the end: search for em-dashes, compare
   version strings across every page, diff the home page to confirm the hero
   line is untouched, confirm analytics and the signup endpoint are unchanged.

**Fixing**

9. Add no facts. No new statistics, prices, testimonials or links to anything
   but the site's own pages. New copy only restates what the code does or
   what the site already says.
10. Prefer the smallest change that removes the problem. Where the complete
    fix was a feature (new billing frequencies, share-based totals), I made
    only the safe part and wrote up the rest.
11. Keep claims the same on every page. When two pages disagreed, I changed
    the one that contradicted the privacy page, never the reverse.
12. Never touch the privacy architecture. Nothing added sends, stores or
    links a user's list anywhere; the one idea that would is labelled as such.
13. When unsure, skip and write it down. Anything I could not confirm as safe
    is in section 2 with enough detail to act on.
14. Stay on the branch. No commits to `main`, no merge, no deploy.
