param(
    [string]$BaseUrl = 'http://localhost:8000'
)

$scriptPath = Join-Path $PSScriptRoot 'test_endpoints.ps1'

if (-not (Test-Path $scriptPath)) {
    Write-Error "Missing required script: $scriptPath"
    exit 1
}

powershell -ExecutionPolicy Bypass -File $scriptPath -BaseUrl $BaseUrl
exit $LASTEXITCODE
