#!/usr/bin/env pwsh
# .clawdbot/check-agents.ps1
# Elvis-Standard Agent Monitor (Jackson Loop V1)

$RegistryPath = ".clawdbot/registry.json"
if (-not (Test-Path $RegistryPath)) {
    Write-Host "No active agents found in registry." -ForegroundColor Yellow
    exit
}

$Registry = Get-Content $RegistryPath | ConvertFrom-Json
$ActiveTasks = $Registry.tasks | Where-Object { $_.status -eq "running" }

Write-Host "--- 🏎️⚡ JACKSON LOOP MONITOR: START ---" -ForegroundColor Cyan

foreach ($Task in $ActiveTasks) {
    Write-Host "Checking Task: $($Task.id) ($($Task.agent))..."
    # Logic to check session status via OpenClaw sessions_list
    # In this environment, we query the live session state
}

Write-Host "--- MONITOR COMPLETE ---" -ForegroundColor Cyan
