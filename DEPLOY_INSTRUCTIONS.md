# Deployment Instructions for UNITED ESTIMATOR APP

This project is configured to automatically deploy to **GitHub Pages** using GitHub Actions. Follow these steps to put the app online:

## 1. Prerequisites
- **Git**: Download and install from [git-scm.com](https://git-scm.com/).
- **GitHub Account**: You need an account at [github.com](https://github.com/).

## 2. One-Time Setup
Open your terminal (PowerShell or Command Prompt) in this folder and run:

1.  **Initialize Git**:
    ```powershell
    git init
    ```
2.  **Add all files**:
    ```powershell
    git add .
    ```
3.  **Commit the code**:
    ```powershell
    git commit -m "Initial commit of United Estimator App"
    ```
4.  **Rename branch to main**:
    ```powershell
    git branch -M main
    ```
5.  **Create a Repository on GitHub**:
    - Go to [github.com/new](https://github.com/new).
    - Name it `united-estimator-app`.
    - Keep it Public.
6.  **Connect and Push**:
    *(Replace `[YOUR-USERNAME]` with your actual GitHub username)*
    ```powershell
    git remote add origin https://github.com/[YOUR-USERNAME]/united-estimator-app.git
    git push -u origin main
    ```

## 3. Deployment (Automatic)
Once you push, the **GitHub Actions** (`.github/workflows/deploy.yml`) will:
- Automatically start a build.
- Create a `gh-pages` branch.
- Host your app!

**Your App URL will be**: `https://[YOUR-USERNAME].github.io/united-estimator-app/`

## 4. Updates
Whenever you want to push new changes:
```powershell
git add .
git commit -m "Description of changes"
git push
```
