# HF1 prototype

A clickable prototype of the HF1 workspace for Halloway Auto Group (Owner view). It's one self-contained page: open `index.html` in a browser, or serve the folder:

```
npx serve .
```

## Open a screen directly

Add `?screen=` to the address to open the app at a specific screen. The app plays the same clicks a person would, then stays live. There are 48 Owner screens:

**Onboarding**

- `?screen=onboarding-connect-tools` · Connect tools
- `?screen=onboarding-pick-your-widgets` · Pick your widgets
- `?screen=onboarding-building-your-desktop` · Building your desktop

**Home**

- `?screen=home-queue` · Queue
- `?screen=home-hf1-knows-the-page` · HF1 knows the page
- `?screen=home-hf1-full-view` · HF1 full view
- `?screen=home-hf1-walks-you-through-a-decision` · HF1 walks you through a decision
- `?screen=home-widget-details` · Widget details
- `?screen=home-after-approving` · After approving
- `?screen=home-queue-cleared` · Queue cleared

**Activity**

- `?screen=activity-feed` · Feed
- `?screen=activity-decision-post` · Decision post
- `?screen=activity-live-work-post` · Live work post
- `?screen=activity-follow-up-post` · Follow-up post

**Tasks**

- `?screen=tasks-board` · Board
- `?screen=tasks-list` · List
- `?screen=tasks-timeline` · Timeline
- `?screen=tasks-canvas` · Canvas
- `?screen=tasks-task-details` · Task details

**Flows**

- `?screen=flows-canvas` · Canvas
- `?screen=flows-list` · List
- `?screen=flows-builder-trade-in-offers` · Builder · Trade-in offers
- `?screen=flows-builder-step-settings` · Builder · Step settings
- `?screen=flows-builder-test-run-waiting-for-you` · Builder · Test run waiting for you
- `?screen=flows-builder-version-history` · Builder · Version history
- `?screen=flows-new-flow-with-hf1` · New flow with HF1
- `?screen=flows-hf1-builds-a-flow` · HF1 builds a flow

**People**

- `?screen=people-list` · List
- `?screen=people-canvas` · Canvas
- `?screen=people-person-rick-alvarez` · Person · Rick Alvarez

**Agents**

- `?screen=agents-list` · List
- `?screen=agents-canvas` · Canvas
- `?screen=agents-agent-mark-overview` · Agent · Mark · Overview
- `?screen=agents-agent-mark-activity` · Agent · Mark · Activity
- `?screen=agents-agent-mark-settings` · Agent · Mark · Settings
- `?screen=agents-new-agent` · New agent
- `?screen=agents-talk-to-an-agent` · Talk to an agent

**Organization**

- `?screen=organization-map` · Map
- `?screen=organization-list` · List

**Tools**

- `?screen=tools-cards` · Cards
- `?screen=tools-list` · List
- `?screen=tools-tool-details` · Tool details

**Files**

- `?screen=files-by-the-work-they-came-from` · By the work they came from
- `?screen=files-folder-november-sales` · Folder · November sales
- `?screen=files-file-preview` · File preview

**Settings**

- `?screen=settings-organization-settings` · Organization settings
- `?screen=settings-your-settings` · Your settings

**Search**

- `?screen=search-search-or-jump-to` · Search or jump to

You can also use the screen number, e.g. `?screen=04`.

## How it's built

`src/base.html` is the base prototype. Each layer adds one part on top of it, in this order:

- `fb.css`, `fb.js`: flow builder
- `act.css`, `act.js`: Activity as a feed
- `ux.css`, `ux.js`: first minute (onboarding, since yesterday, HF1 knows the page)
- `ux2.css`, `ux2.js`: flows as sentences, agent posters, tools, files, approval rules
- `ux3.js`: widget suggestions learned from what you open
- `router.js`: `?screen=` links

Run `python3 build.py` to rebuild `index.html` after changing anything in `src/`.
