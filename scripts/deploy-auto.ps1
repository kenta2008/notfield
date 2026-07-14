param(
    [string]$Message = ""
)

$ErrorActionPreference = "Stop"

function Invoke-Step {
    param(
        [string]$Command,
        [string[]]$Arguments
    )

    Write-Host ""
    Write-Host ">" $Command ($Arguments -join " ")
    & $Command @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "$Command failed with exit code $LASTEXITCODE"
    }
}

function Assert-CommandExists {
    param([string]$Name)

    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "$Name command was not found. Install it or add it to PATH."
    }
}

function Get-ToolCommand {
    param(
        [string]$Name,
        [string[]]$FallbackPaths = @()
    )

    $command = Get-Command $Name -ErrorAction SilentlyContinue
    if ($command) {
        return $Name
    }

    foreach ($path in $FallbackPaths) {
        if (Test-Path $path) {
            return $path
        }
    }

    throw "$Name command was not found. Install it or add it to PATH."
}

function Assert-NoPrivateSecrets {
    $ignorePattern = "\\node_modules\\|\\.firebase\\|\\.git\\"
    $targetExtensions = @(".js", ".json", ".html", ".css", ".env")
    $secretPatterns = @(
        "-----BEGIN PRIVATE KEY-----",
        '"private_key"\s*:',
        '"client_email"\s*:',
        "serviceAccount",
        "service_account"
    )

    $files = Get-ChildItem -Path . -Recurse -File |
        Where-Object {
            $_.FullName -notmatch $ignorePattern -and
            $targetExtensions -contains $_.Extension
        }

    foreach ($pattern in $secretPatterns) {
        $matches = $files | Select-String -Pattern $pattern -List -ErrorAction SilentlyContinue
        if ($matches) {
            $paths = ($matches | ForEach-Object { $_.Path } | Sort-Object -Unique) -join "`n"
            throw "Possible private secret found. Please check these files before deploying:`n$paths"
        }
    }
}

if (-not (Test-Path "firebase.json")) {
    throw "firebase.json was not found. Run this script from the folder that contains firebase.json."
}

Assert-NoPrivateSecrets

$GitCommand = Get-ToolCommand "git" @(
    "C:\Program Files\Git\cmd\git.exe",
    "C:\Program Files\Git\bin\git.exe",
    "C:\Program Files (x86)\Git\cmd\git.exe"
)
$FirebaseCommand = Get-ToolCommand "firebase.cmd" @()

Invoke-Step $GitCommand @("rev-parse", "--is-inside-work-tree")

$branch = (& $GitCommand branch --show-current).Trim()
if (-not $branch) {
    throw "Could not detect the current Git branch."
}

$gitUserName = [string](& $GitCommand config user.name)
$gitUserEmail = [string](& $GitCommand config user.email)
$gitUserName = $gitUserName.Trim()
$gitUserEmail = $gitUserEmail.Trim()
if (-not $gitUserName -or -not $gitUserEmail) {
    throw "Git user.name/user.email is not set. Run: git config --global user.name `"Your Name`" ; git config --global user.email `"you@example.com`""
}

$remote = (& $GitCommand remote get-url origin 2>$null)
if (-not $remote) {
    throw "Git remote origin is not set. Run: git remote add origin <URL>"
}

$status = (& $GitCommand status --porcelain)
if ($status) {
    Invoke-Step $GitCommand @("add", ".")

    $hasStagedChanges = $true
    & $GitCommand diff --cached --quiet
    if ($LASTEXITCODE -eq 0) {
        $hasStagedChanges = $false
    }

    if ($hasStagedChanges) {
        if (-not $Message) {
            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            $Message = "Update before Firebase deploy $timestamp"
        }
        Invoke-Step $GitCommand @("commit", "-m", $Message)
    } else {
        Write-Host "No staged changes to commit."
    }
} else {
    Write-Host "No changes. Skipping commit."
}

Invoke-Step $GitCommand @("push", "-u", "origin", $branch)

Invoke-Step $FirebaseCommand @("deploy")

Write-Host ""
Write-Host "GitHub update and Firebase deploy completed."
