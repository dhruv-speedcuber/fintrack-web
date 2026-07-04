# FinTrack — Deploy to GitHub & Vercel
# Right-click this file -> "Run with PowerShell"

$projectPath = "$env:USERPROFILE\Desktop\fintrack-web"
Set-Location $projectPath

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  FinTrack Deployment Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean up broken .git and re-initialize
Write-Host "Step 1: Initializing git repository..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Remove-Item -Recurse -Force ".git"
    Write-Host "  Cleaned up old .git folder." -ForegroundColor Gray
}
git init
git branch -M main
git config user.email "shellygarments2.0@gmail.com"
git config user.name "Dhruv"
git add .
git commit -m "Initial FinTrack web app"
Write-Host "  Git commit done!" -ForegroundColor Green

# Step 2: Open GitHub to create new repo
Write-Host ""
Write-Host "Step 2: Opening GitHub to create a new repo..." -ForegroundColor Yellow
Start-Process "https://github.com/new"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  ACTION REQUIRED" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "In the GitHub page that just opened:" -ForegroundColor White
Write-Host "  1. Name the repo: fintrack-web" -ForegroundColor White
Write-Host "  2. Keep it Public or Private (your choice)" -ForegroundColor White
Write-Host "  3. Do NOT check 'Initialize this repository' boxes" -ForegroundColor White
Write-Host "  4. Click 'Create repository'" -ForegroundColor White
Write-Host ""

$username = Read-Host "Then come back here and enter your GitHub username"

Write-Host ""
Write-Host "Step 3: Pushing to GitHub..." -ForegroundColor Yellow
git remote add origin "https://github.com/$username/fintrack-web.git"
git push -u origin main

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "  Pushed to GitHub!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Now opening Vercel..." -ForegroundColor Yellow
Start-Process "https://vercel.com/new"
Write-Host ""
Write-Host "On Vercel:" -ForegroundColor White
Write-Host "  1. Import your 'fintrack-web' GitHub repo" -ForegroundColor White
Write-Host "  2. Click Deploy (no settings needed)" -ForegroundColor White
Write-Host "  3. After deploy: Storage tab -> Create Database -> KV" -ForegroundColor White
Write-Host "  4. Connect KV to your project, then Redeploy" -ForegroundColor White
Write-Host ""
Write-Host "All done! Press any key to close." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
