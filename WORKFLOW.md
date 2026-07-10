# EBOOKVALA — Development & Deployment Workflow

This document outlines the standard workflow for developers working on **EBOOKVALA**. Adhering to this process ensures all changes are safe, verified, and testable before deploying to the production app.

---

## 1. Branch Strategy

We maintain a strict separation between development/staging and production branches:

*   **`main`** (Production)
    *   This branch represents the live, stable production code.
    *   *Auto-deploys to Vercel Production URL.*
    *   **Do not commit directly to `main`.**
*   **`dev`** (Active Development & Staging)
    *   This branch is the target for merging all new features and bug fixes.
    *   *Deploys to a Vercel Preview URL* for staging testing.
    *   All new features should branch off `dev`.

### Git Branching Workflow
1.  Create feature/fix branch off `dev`:
    ```bash
    git checkout dev
    git pull origin dev
    git checkout -b feat/your-feature-name
    ```
2.  Work on the feature, commit following the conventions below, and push:
    ```bash
    git push -u origin feat/your-feature-name
    ```
3.  Create a Pull Request (PR) to merge into `dev`.

---

## 2. Environment Variables & Firebase Project Scoping

We maintain separate Firebase projects for development/testing and production. **Never treat staging databases as sources of truth for live production data.**

### Environment Scopes
| Environment | Firebase Project ID | Purpose | URL |
| :--- | :--- | :--- | :--- |
| **Local Development** | `ebookvala-53c0d` | Code tweaks, local tests, and mock seeding. | `http://localhost:5173` |
| **Staging / Preview** | `ebookvala-53c0d` | Validation of builds on Vercel preview deploys. | Vercel Preview URLs |
| **Live Production** | `ebookvala-official` | Single Source of Truth for real users, books, and sales. | `https://ebookvala-lts4-black.vercel.app` |

> [!WARNING]
> Users, authors, or books created in local development or staging/preview environments **will not** be visible in production. Any data that needs to be live in production must be created directly on the production site, or manually migrated by an administrator.

### Local Development Setup
*   Create a `.env.local` file at the root (this file is `.gitignore`d).
*   Use `.env.example` as a template for the keys that need to be defined.
*   By default, local development points to `ebookvala-53c0d`.

### Production & Preview (Vercel)
Ensure the following variables are configured under your Vercel Project settings.
*   **Production Environment Variables**: Must point to `ebookvala-official` credentials.
*   **Preview Environment Variables**: Must point to `ebookvala-53c0d` credentials.

Variables to configure:
*   `VITE_FIREBASE_API_KEY`
*   `VITE_FIREBASE_AUTH_DOMAIN`
*   `VITE_FIREBASE_PROJECT_ID`
*   `VITE_FIREBASE_STORAGE_BUCKET`
*   `VITE_FIREBASE_MESSAGING_SENDER_ID`
*   `VITE_FIREBASE_APP_ID`
*   `VITE_FIREBASE_MEASUREMENT_ID`
*   `VITE_SUPABASE_URL`
*   `VITE_SUPABASE_PUBLISHABLE_KEY`
*   `VITE_SECRET_ADMIN_TOKEN`
*   `VITE_ADMIN_PASSWORD`
*   `RESEND_API_KEY`
*   `EMAIL_TO`
*   `EMAIL_FROM`
*   `GMAIL_USER`
*   `GMAIL_PASS`

---

## 3. Commit Convention

We use **Conventional Commits** for clean and readable git histories. Prefix your commit messages with one of these tags:

*   `feat:` New features (e.g., `feat: add Google OAuth login`)
*   `fix:` Bug fixes (e.g., `fix: resolve responsive menu alignment`)
*   `chore:` Maintenance, configs, scripts (e.g., `chore: update dependencies`)
*   `refactor:` Code improvements that don't add features/fix bugs (e.g., `refactor: clean up storage service`)
*   `docs:` Documentation changes (e.g., `docs: update setup instructions`)

Example command:
```bash
git commit -m "feat: integrate email verification for new authors"
```

---

## 4. Pre-Deploy Validation Script

Before merging from `dev` to `main`, you **MUST** run the validation script:

```bash
npm run predeploy
```

This automated script will:
1.  Execute `npm run build` to verify the production bundle succeeds with zero errors.
2.  Execute `npm run lint` (`oxlint`) to inspect code quality.
3.  Display a **Manual Verification Checklist** in the console.

If any automated step fails, resolve the errors before proceeding.

---

## 5. Release & Merge to Production Flow

When ready to deploy `dev` changes to production (`main`):

1.  **Checkout dev and run pre-deploy checks**:
    ```bash
    git checkout dev
    git pull origin dev
    npm run predeploy
    ```
2.  **Verify the manual checklist items**:
    *   [ ] **Auth Flow:** Login, Sign-Up, and Sign-Out are fully functional.
    *   [ ] **Firestore:** Reads and writes (e.g. creating books, updates) are working.
    *   [ ] **Payments:** Checkouts or simulated payments process correctly.
    *   [ ] **Mobile check:** UI is fully responsive, including navigation Dock menu.
    *   [ ] **No Console Errors:** DevTools console shows zero runtime exceptions.
3.  **Perform Rollback Safety Check**:
    Retrieve and note down the current production (`main`) commit hash:
    ```bash
    git checkout main
    git pull origin main
    git rev-parse HEAD
    ```
    *Keep this hash safe. If the live app breaks post-deploy, you can roll back to this exact state.*
4.  **Merge and Deploy**:
    ```bash
    git merge dev
    git push origin main
    ```
    *This triggers the Vercel Production deployment.*

---

## 6. Emergency Rollback Safety

If a production deployment breaks the live app, follow these steps to instantly roll back to the previously recorded stable commit hash:

1.  Checkout the `main` branch locally:
    ```bash
    git checkout main
    ```
2.  Reset the local branch to the last stable hash:
    ```bash
    git reset --hard <STABLE_COMMIT_HASH>
    ```
3.  Force push the rolled-back state to GitHub (triggers instant Vercel redeploy):
    ```bash
    git push origin main --force
    ```
4.  Switch back to `dev` to investigate the issue:
    ```bash
    git checkout dev
    ```
