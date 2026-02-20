# GitHub Push Script for Nike V2 Project
# Run this file in PowerShell: .\push-to-github.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Nike V2 - GitHub Push Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Step 1: Ask for GitHub repo URL
$repoUrl = Read-Host "`nEnter your GitHub repo URL (e.g. https://github.com/username/repo.git)"

if (-not $repoUrl) {
    Write-Host "ERROR: No URL provided. Exiting." -ForegroundColor Red
    exit 1
}

# Step 2: Initialize git if not already
if (-not (Test-Path ".git")) {
    Write-Host "`n[1/5] Initializing git..." -ForegroundColor Yellow
    git init
} else {
    Write-Host "`n[1/5] Git already initialized." -ForegroundColor Green
}

# Step 3: Stage all files (respects .gitignore)
Write-Host "`n[2/5] Staging files..." -ForegroundColor Yellow
git add .

# Step 4: Show what's being committed
Write-Host "`n[3/5] Files to be pushed:" -ForegroundColor Yellow
git status --short

# Step 5: Commit
$commitMsg = Read-Host "`n[4/5] Enter commit message (press Enter for 'Initial commit')"
if (-not $commitMsg) { $commitMsg = "Initial commit" }
git commit -m $commitMsg

# Step 6: Set remote and push
Write-Host "`n[5/5] Pushing to GitHub..." -ForegroundColor Yellow

# Remove old remote if exists
git remote remove origin 2>$null

git remote add origin $repoUrl
git branch -M main
git push -u origin main

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "   SUCCESS! Project pushed to GitHub" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "URL: $repoUrl" -ForegroundColor Cyan
