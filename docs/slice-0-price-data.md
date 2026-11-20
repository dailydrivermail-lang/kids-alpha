# Slice 0 — Price data: findings

Date: 21 November 2026 (research by web lookup; the fetch script has not yet been
run against a live feed — see "Still to do").

## Recommendation

Use **EODHD**. Start on the free key to run the script; move to the
"EOD Historical Data — All World" plan (about EUR 19.99 a month, personal use)
when Slice 2 starts.

Why: it is the only option checked that covers the US, Tokyo and Xetra with
daily closes, dividends and FX through one documented API, on a plan licensed
for personal use, at a price that suits a hobby project.

## Comparison

| Source | Covers US, Tokyo, Xetra | Dividends and FX | Cost | Terms | Verdict |
| --- | --- | --- | --- | --- | --- |
| EODHD | Yes: 60+ exchanges, Tokyo and Xetra listed | Yes | Free: 20 calls a day, 1 year of history. Paid: about EUR 19.99 a month, 100,000 calls a day, 30+ years | Personal use on these plans | **Use this** |
| Twelve Data | Free plan is US only. Xetra needs the Grow plan; Tokyo plan level unclear | Yes on paid plans | Free: 800 calls a day. Grow from USD 29 to 79 a month | Free plan is "internal non-display" (evaluation) | Too dear for the non-US names |
| Yahoo Finance (unofficial, e.g. yahoo-finance2) | Yes | Yes | Free | Unofficial endpoints, personal use, unpublished rate limits by IP, can break without notice | Keep as a fallback and cross-check only |
| Stooq | Yes | Prices and FX; dividends not confirmed | Free | Since 2026 needs a key obtained by CAPTCHA; personal use; unpublished limits; no documented API | Not suitable for an unattended daily job |

## Call budget on EODHD

One call returns a date range for one symbol. A daily refresh is 23 companies
plus 3 FX pairs = 26 calls. That is over the free plan's 20 a day, so the free
key is for testing only (the first script run needs 26 to 30 calls; run it over
two days, or use any sign-up bonus calls). The paid plan has ample headroom.

A two-year backfill for charts needs the paid plan (the free plan returns one
year only). SpaceX has history only from 12 June 2026.

## Ticker check

Confirmed by lookup today: TTWO (Nasdaq), SPCX (Nasdaq, listed 12 June 2026),
FWONK (Nasdaq, Liberty Formula One Series C).

The other 20 are from general knowledge and have not been individually looked
up. `scripts/fetch-week.mjs` confirms all 23 on its first run: it fails loudly
on any symbol that returns no data, and reports which EODHD code worked.

EODHD symbol format is `TICKER.EXCHANGE` (for example `AAPL.US`, `SAP.XETRA`).
Sources disagree on the Tokyo suffix (`.TSE` or `.T`), and the FX codes
(`USDAUD.FOREX` etc.) are unverified, so the script tries candidates in order.

## Stack check (SPEC.md section 3)

- **Use Cloudflare Workers with static assets, not Pages.** Cloudflare now
  recommends Workers for new projects, and Cron Triggers run on Workers. One
  Worker serves the site, the API and the scheduled jobs.
- D1 and Cron Triggers are fine as specified.
- Cron Triggers run in UTC, so Sydney-time schedules must handle daylight saving.

## Email time changed from 7:00 am to 11:00 am Saturday

The US market closes at 4 pm New York time. During the Australian summer that
is 8:00 am Saturday in Sydney, so a 7:00 am email would go out before the US
week had finished. Allowing a few hours for the data provider to publish closes,
the email is now scheduled for 11:00 am Saturday, Australia/Sydney, all year.

## Still to do (needs a machine with internet access)

1. Get a free EODHD key.
2. Run `EODHD_API_KEY=... node scripts/fetch-week.mjs`.
3. Record the working symbol codes in SPEC.md section 4 and fix any failures.
4. Confirm how many hours after each close EODHD publishes that day's data.
