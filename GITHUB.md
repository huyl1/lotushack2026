# GitHub Workflow Guide for Agents

## Core Principles

- **One branch per feature or task.** Never bundle unrelated changes into a single branch.
- **Keep branches short-lived.** Open a merge request as soon as the work is ready for review.
- **Commit often, with clear messages.** Small, focused commits are easier to review and revert.

---

## 1. Starting a New Feature

Always branch off from the latest `main` (or `develop`, depending on the repo convention).

```bash
# Make sure your local main is up to date
git checkout main
git pull origin main

# Create and switch to a new feature branch
git checkout -b feature/<short-descriptive-name>
```

**Branch naming examples:**
- `feature/user-authentication`
- `feature/add-payment-gateway`
- `fix/login-redirect-bug`
- `chore/update-dependencies`

---

## 2. Making Changes

Work only on the scope of the current feature. If you discover an unrelated issue, open a separate branch for it.

```bash
# Stage specific files (preferred over staging everything)
git add <file1> <file2>

# Or stage all changes in the current directory
git add .

# Commit with a clear, imperative message
git commit -m "Add OAuth2 login support for Google accounts"
```

**Good commit message format:**
```
<type>: <short summary>

[Optional: longer description if needed]
```
Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`

---

## 3. Staying Up to Date

If the base branch has moved forward while you were working, rebase to avoid messy merge commits.

```bash
git fetch origin
git rebase origin/main
```

Resolve any conflicts, then continue:

```bash
git rebase --continue
```

---

## 4. Pushing Your Branch

```bash
# First push (sets the upstream)
git push -u origin feature/<short-descriptive-name>

# Subsequent pushes
git push
```

---

## 5. Opening a Merge Request (MR / PR)

Once the feature is complete and tested, open a Merge Request (GitLab) or Pull Request (GitHub).

**Checklist before opening:**
- [ ] All tests pass locally
- [ ] No unrelated files are included in the diff
- [ ] The branch is rebased on the latest `main`
- [ ] The MR title clearly describes what was done

**MR title format:**
```
[type] Short description of the change
```
Example: `[feat] Add Google OAuth2 login`

**MR description template:**
```markdown
## What does this MR do?
Brief explanation of the change and why it was needed.

## How to test
Steps to verify the feature works correctly.

## Notes
Any edge cases, known limitations, or follow-up tasks.
```

---

## 6. After the MR is Merged

Clean up your local and remote branches once the MR is merged.

```bash
# Switch back to main and pull the merged changes
git checkout main
git pull origin main

# Delete the local branch
git branch -d feature/<short-descriptive-name>

# Delete the remote branch (if not auto-deleted by the platform)
git push origin --delete feature/<short-descriptive-name>
```

---

## Quick Reference

| Action | Command |
|---|---|
| Update main | `git pull origin main` |
| New branch | `git checkout -b feature/<name>` |
| Stage changes | `git add <files>` |
| Commit | `git commit -m "<message>"` |
| Push branch | `git push -u origin feature/<name>` |
| Rebase on main | `git rebase origin/main` |
| Delete local branch | `git branch -d feature/<name>` |
| Delete remote branch | `git push origin --delete feature/<name>` |
