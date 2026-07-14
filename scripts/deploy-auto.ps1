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

function Ensure-GitHubKnownHost {
    param([string]$RemoteUrl)

    if ($RemoteUrl -notmatch "github\.com[:/]") {
        return
    }

    $sshDir = Join-Path $env:USERPROFILE ".ssh"
    $knownHosts = Join-Path $sshDir "known_hosts"

    if (-not (Test-Path $sshDir)) {
        New-Item -ItemType Directory -Path $sshDir | Out-Null
    }
    if (-not (Test-Path $knownHosts)) {
        New-Item -ItemType File -Path $knownHosts | Out-Null
    }

    $sshKeygen = Get-Command "ssh-keygen" -ErrorAction SilentlyContinue
    if ($sshKeygen) {
        & $sshKeygen.Source -F "github.com" -f $knownHosts *> $null
        if ($LASTEXITCODE -eq 0) {
            return
        }
    } else {
        $existingKnownHosts = Get-Content -Path $knownHosts -Raw -ErrorAction SilentlyContinue
        if ($existingKnownHosts -match "(^|`n)github\.com\s") {
            return
        }
    }

    Write-Host "Adding GitHub SSH host keys to $knownHosts"
    $githubHostKeys = @(
        "github.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl",
        "github.com ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBEmKSENjQEezOmxkZMy7opKgwFB9nkt5YRrYMjNuG5N87uRgg6CLrbo5wAdT/y6v0mKV0U2w0WZ2YB/++Tpockg=",
        "github.com ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCj7ndNxQowgcQnjshcLrqPEiiphnt+VTTvDP6mHBL9j1aNUkY4Ue1gvwnGLVlOhGeYrnZaMgRK6+PKCUXaDbC7qtbW8gIkhL7aGCsOr/C56SJMy/BCZfxd1nWzAOxSDPgVsmerOBYfNqltV9/hWCqBywINIR+5dIg6JTJ72pcEpEjcYgXkE2YEFXV1JHnsKgbLWNlhScqb2UmyRkQyytRLtL+38TGxkxCflmO+5Z8CSSNY7GidjMIZ7Q4zMjA2n1nGrlTDkzwDCsw+wqFPGQA179cnfGWOWRVruj16z6XyvxvjJwbz0wQZ75XK5tKSb7FNyeIEs4TT4jk+S4dhPeAUC5y+bDYirYgM4GC7uEnztnZyaVWQ7B381AK4Qdrwt51ZqExKbQpTUNn+EjqoTwvqNj4kqx5QUCI0ThS/YkOxJCXmPUWZbhjpCg56i+2aB6CmK2JGhn57K5mj0MNdBXA4/WnwH6XoPWJzK5Nyu2zB3nAZp+S5hpQs+p1vN1/wsjk="
    )

    Add-Content -Path $knownHosts -Value $githubHostKeys
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
$remote = $remote.Trim()
Ensure-GitHubKnownHost $remote

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
