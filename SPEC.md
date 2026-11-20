# Kid's Alpha — Build Spec

Source of truth for building Kid's Alpha. Read this at the start of every session.
The concept doc explains the why; this file says what to build.

## 1. What it is

A private, invite-only browser game for 10 to 14-year-olds. Each player gets
$1,000,000 of pretend money, allocates it across 23 real companies by percentage,
and tries to stay ahead of the game's own index (the Fun Index). Prices are real
daily closes. The game is perpetual. Every Saturday morning (Australia/Sydney)
each player gets an email explaining what moved and why.

Not commercial. A handful of users. Kids only; parents set up accounts and are
copied on emails but do not play.

## 2. Principles

- Simple beats clever. A few dozen users at most; no scaling work.
- The simulation engine is pure, deterministic and unit-tested. Everything else
  can be looser.
- Build in slices (section 12). Each slice ends deployed and usable. Do not start
  a later slice early.
- Features are gated by player level. A Level 1 player never sees a Level 2+ idea.
- Never give buy or sell advice anywhere in the product.
- Store as little personal data as possible (section 9).

## 3. Stack (recommended; confirm against current docs before committing)

- Hosting: Cloudflare (Pages/Workers), auto-deploying from GitHub, matching the
  owner's existing setup.
- Database: Cloudflare D1 (SQLite).
- Scheduled jobs: Cloudflare Cron Triggers (daily price fetch, Saturday email).
- Front end: one lightweight framework of your choice; TypeScript throughout.
- Email: a transactional email service with a simple API.
- Weekly explainers: Claude API, with web search for that week's news.
- Price data: chosen in Slice 0.

If any of these is a poor fit when checked, propose an alternative and wait for
approval before changing.

## 4. Company universe

23 companies. Tickers below are from memory: verify every one in Slice 0.

| World | Company | Ticker (verify) | Exchange | Currency |
| --- | --- | --- | --- | --- |
| Games | Take-Two | TTWO | Nasdaq | USD |
| Games | Nintendo | 7974 | Tokyo | JPY |
| Games | Sony | 6758 | Tokyo | JPY |
| Games | Microsoft | MSFT | Nasdaq | USD |
| Games | Roblox | RBLX | NYSE | USD |
| Games | Capcom | 9697 | Tokyo | JPY |
| Space and cars | Tesla | TSLA | Nasdaq | USD |
| Space and cars | SpaceX | SPCX | Nasdaq | USD |
| Space and cars | Ferrari | RACE | NYSE | USD |
| Space and cars | Formula One Group | FWONK | Nasdaq | USD |
| Screens | Apple | AAPL | Nasdaq | USD |
| Screens | Alphabet | GOOGL | Nasdaq | USD |
| Screens | Netflix | NFLX | Nasdaq | USD |
| Screens | Disney | DIS | NYSE | USD |
| Screens | Spotify | SPOT | NYSE | USD |
| Screens | Nvidia | NVDA | Nasdaq | USD |
| Toys | Mattel | MAT | Nasdaq | USD |
| Toys | Hasbro | HAS | Nasdaq | USD |
| Toys | Bandai Namco | 7832 | Tokyo | JPY |
| Wear and eat | Nike | NKE | NYSE | USD |
| Wear and eat | Adidas | ADS | Frankfurt (Xetra) | EUR |
| Wear and eat | McDonald's | MCD | NYSE | USD |
| Wear and eat | Coca-Cola | KO | NYSE | USD |

Each company also has: a kid-facing one-liner ("what kids know it for"), a logo,
and a world. The universe is editable by the admin. SpaceX only has price history
from 12 June 2026.

## 5. Simulation rules

### Prices
- Store one daily close per company per trading day, in home currency, plus any
  dividend paid that day and the AUD FX rate for that currency.
- Missing days (holidays) carry the previous close forward.

### Portfolios
- A player sets target percentages across companies. They must total 100.
  Cash is not allowed before Level 4; from Level 4 cash is allowed and earns nothing.
- One portfolio change per game week. A game week runs Saturday to Friday,
  Australia/Sydney.
- A change fills at each stock's next close on its own exchange after lock-in.
- Between changes, holdings drift with prices. There is no automatic rebalancing.
- No fees, borrowing, shorting or options. Fractional holdings throughout.

### Returns by level
- Levels 1 to 4: a holding's value moves by the stock's home-currency total
  return (price plus dividends reinvested). Currency is ignored.
- Level 5: price return and dividends are separated. Dividends arrive as cash on
  the payment date; a per-player switch reinvests them automatically or keeps cash.
- Level 6: returns are converted to AUD, so FX moves count.
- All money is displayed as dollars (AUD).

### The Fun Index (the benchmark)
- Equal weight across every company in the universe, total return.
- Rebalanced to equal weights on the first trading day of each calendar quarter.
- Computed in two versions: home-currency (for Levels 1 to 5) and AUD (Level 6).
  A player is compared with the version that matches their level.
- A second, fainter context line shows a broad real-world index (S&P 500).

### Start, stretches and trophies
- A player's start date is the day their first allocation fills. They start with
  $1,000,000 once. Money never resets.
- From the start date, time is divided into consecutive 10-week stretches.
- At the end of each stretch: if the player's return over the stretch is higher
  than the Fun Index's over the same dates, they earn a trophy.
- Leaderboard order: trophies, then lead over the index in the current stretch.

## 6. The play card

Every holding must have a play card before the portfolio can be locked in.

| Field | Options (exactly one) |
| --- | --- |
| Why I'm buying | "Kids love this more than grown-ups realise" · "Something big is coming" · "Great company, price is too low" · "It just keeps winning" · "It pays me to own it" (Level 5+) · "Just a hunch" |
| I'm wrong if | "The thing I expected doesn't happen" · "The price falls 20% from where I bought" · "10 weeks pass and nothing has changed" |
| Then I will | "Sell all of it" · "Sell half" · "Keep it and write a new reason" |

Behaviour:
- Price trigger: fires when the close is 20% or more below the fill price (home currency).
- Time trigger: fires 10 weeks after the fill.
- "The thing I expected" trigger: the game asks the player whether it came true,
  at a linked calendar event's date if there is one, otherwise at 10 weeks.
- When a trigger fires, the holding is flagged and the player's own plan is shown
  back to them. They choose "stick to my plan" or "change my plan". The game
  never trades for them. The choice is recorded.
- From Level 2, choosing "Something big is coming" asks a follow-up:
  "Do grown-ups already expect it?" (yes / no / not sure).
- Scoreboard: return by reason, and return when the player stuck to the plan
  versus when they changed it.

## 7. Levels

A player moves up after at least 10 weeks on their level and passing that level's
three-question check (multiple choice, from a fixed question bank). Being behind
the market does not block levelling up.

| Level | Name | Switches on |
| --- | --- | --- |
| 1 | Pick or spread | Logo tiles, percentages, play card, race chart, "spread" meter (Sniper to Net) with a band on the chart showing how far from the index the portfolio could drift |
| 2 | What's baked in | Company size (market cap), a "years of profit" tag (P/E), an events calendar, the play-card follow-up question |
| 3 | Your edge | Predictions before calendar events ("Will it be a hit?", "Do grown-ups already expect that?"), outcome shown beside the price move, the play-card scoreboard |
| 4 | The wobble | A wobble rating per stock (calm to wild, from volatility), the player's worst week, cash allowed |
| 5 | Getting paid | Dividends as cash, reinvest switch, stretch summary split into "price" and "paid to you" |
| 6 | Money has passports | Currency effects on returns, AUD index |

The events calendar is curated by the admin (game launches, films, results days).

## 8. The Saturday email

- Sent Saturday 7:00 am Australia/Sydney, after the US Friday close. Schedule must
  handle daylight saving.
- One email per player, copied to the parent. A copy is also readable in the game.
- Five parts, always in this order:
  1. The score: player versus the index, this week and over the current stretch.
  2. Your movers: each holding's real change for the week, biggest first.
  3. Why it probably moved: three or four sentences on the biggest mover.
  4. Three possibilities: three different things that could happen next, as questions.
  5. Your move: any triggered play cards, a button to the game, and when the
     week's trade closes.
- Writing rules for the generated text:
  - Reading level of a 10-year-old. Two minutes to read.
  - Never says what to buy or sell.
  - Honest that it is a best guess; says "nobody knows" when that is the truth.
  - Only uses ideas up to the player's level.
  - One new word a week, explained in a sentence.
- The explainer for a given company and week is generated once and shared by all
  players who hold it.
- The admin can preview the week's emails before they send.

## 9. Accounts and safety

- Invite-only. The admin sends an invite link to a parent. The parent enters
  their own email, and a nickname and avatar for the child.
- Sign-in by emailed link. No passwords.
- Stored: nickname, avatar, email address(es), game data. Nothing else. No
  surnames, birthdays, schools or photos.
- Players see of each other: nickname, avatar, level, trophies, percentage ahead
  of or behind the index. Holdings are visible with a four-week delay.
- No chat, comments or messaging. No real money, ads, prizes or broker links.
- One admin (the owner): invites, universe, events calendar, email preview.

## 10. Look and feel

A serious data terminal in neon sunset colours.

- Near-black background. Hot pink, sunset orange and violet as gradients; teal for
  interactive elements. Up is teal, down is pink. No plain green and red.
- Monospace for all numbers; a bold condensed face for headings.
- Thin grid lines, small uppercase labels, hard-cornered panels. Nothing rounded
  or cartoonish.
- Company logos on glowing tiles are the game pieces. Tile size follows the
  holding's share of the portfolio.
- One hero number, always visible: percentage ahead of or behind the index.
- One hero chart: player versus index.
- Motion: numbers tick, tiles snap, a trophy gets a full-screen moment. Weekly
  changes get small animations only.
- Laptop and tablet first; usable on a phone.
- Original artwork and lettering only. Do not copy any game's art or fonts.

## 11. Out of scope

Real money. Adult players. Unlisted companies. Intraday prices. Chat. Public
sign-up. Native apps. Anything not in this file.

## 12. Build slices

Do one slice per session. Finish, deploy, and report before the next.

**Slice 0 — Price data.** Choose a data source. Evaluate candidates for: daily
closes, dividends and FX for all 23 tickers across US, Tokyo and Frankfurt;
history back at least two years; cost; terms of use for a private project.
Verify every ticker in section 4. Deliver a short comparison, a recommendation,
and a script that fetches and prints one week of closes for all 23.

**Slice 1 — One screen.** A static mock of the portfolio screen with fake data,
to lock the look: tiles, percentages, hero number, race chart. No back end.

**Slice 2 — Level 1, single player.** Database, daily price job, the simulation
engine with unit tests, Fun Index, allocate and lock-in, play card capture, race
chart. One hard-coded player.

**Slice 3 — Accounts.** Invites, emailed sign-in, admin screen, leaderboard,
delayed holdings view.

**Slice 4 — Saturday email.** Scheduled generation and send, parent copy, in-game
copy, admin preview.

**Slice 5 — Trophies and triggers.** Stretches, trophies, play-card triggers and
scoreboard, level checks.

**Slices 6 to 10 — Levels 2 to 6**, one per slice, in order.

## 13. Open items

- The 10-week stretch length and the 20% price trigger are starting values.
- The level-check question bank needs writing (three questions per level, plus spares).
- Logos: confirm how they are sourced and stored.
