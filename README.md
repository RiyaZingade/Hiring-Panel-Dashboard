# Hiring Panel

Run your resume past a panel of seven AI reviewers, each reading it alone against a real job posting:

- an automated screen
- a hiring manager
- a day-one hiring manager
- a rival applicant
- a CEO
- a recruiter
- a teammate

A final step merges their verdicts into ranked fixes, suggested edits you can accept one by one, and a rebuilt resume with placeholders for facts only you can supply.

It runs on **your own Claude Code login**, so there's no API key and nothing to pay beyond your Claude plan. Your applications and resumes are saved in your browser.

## Before you start

You need all three of these, or the panel won't run:

1. **[Node.js 20 or newer](https://nodejs.org)**. Check with `node --version`.
2. **[Claude Code](https://claude.com/claude-code)**, installed.
3. **Signed in to Claude Code.** Run `claude` once in Terminal and finish the login.

> **Heads up on usage:** one full panel is about 9 Claude calls (7 reviewers, the merge step and an optional rebuild). They all count against your own Claude plan. On the Pro plan, several panels in a row can hit your usage limit, so space them out or turn off reviewers you don't need.

## Set it up (first time only)

```
git clone https://github.com/RiyaZingade/Hiring-Panel.git
```

There's nothing to install: the app has no dependencies.

## Use it

1. In Terminal, start the local server and leave the window open:
   ```
   cd Hiring-Panel && npm run local
   ```
2. Open the dashboard. Either:
   - **https://hiring-panel-studio.vercel.app**, which connects to the server on your computer:
     - **Chrome:** connects on its own. If Chrome asks to let the site access devices on your local network, click **Allow**.
     - **Safari and other browsers:** click **Connect** in the sidebar. A small connector window opens. Keep it open (you can minimize it) while you work. If nothing opens, allow pop-ups for the site.
   - **http://localhost:3000**, served straight from the server. This works in any browser.
3. When you're done, press `Ctrl+C` in Terminal.

The sidebar shows whether the server is connected. **Setup** in the sidebar repeats these steps.

Applications are saved separately for each address: the hosted site and localhost each keep their own list. Pick one and stick with it.

## Download a PDF

**Download PDF** in the editor works two ways:

- **With a LaTeX engine installed**, it compiles your real LaTeX into an exact PDF. The easiest engine is [Tectonic](https://tectonic-typesetting.github.io): `brew install tectonic`. `pdflatex` from MacTeX also works.
- **Without one**, it opens the print dialog on the in-app preview. Choose **Save as PDF** there. The preview is approximate, so for anything you submit, compile it in Overleaf or install Tectonic.

## How it works

- `local.mjs` serves the app on `localhost:3000`. It runs each reviewer with `claude -p` (Claude Code's non-interactive mode), with tools turned off and a fixed JSON schema for the reply.
- The server only accepts requests from this computer and from the hosted site.
- The hosted site is static. It sends each panel call to your local server, never to a server of ours.

## Privacy

- Resumes and postings are stored in your browser's local storage.
- They're sent only to your local server, and from there to Anthropic through your Claude Code session.
- Nothing is stored anywhere else.

## Credits

The panel design is adapted from the [hiring-panel skill](https://github.com/alexyc9381/hiring-panel-skill) by Alex Chen ([@nocodealex](https://chen.media)), MIT licensed.

This is a second opinion made by language models. It doesn't guarantee an interview and isn't career advice. The reviewers are told never to invent facts, but check every change before you send a resume.

## License

MIT. See [LICENSE](LICENSE).
