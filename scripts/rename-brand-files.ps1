# Переименование бренд-логотипов: убираем пробелы в именах файлов.
# Запускать из корня проекта: .\scripts\rename-brand-files.ps1
# Или из папки public/brand, если файлы уже там со старыми именами.

$brandDir = Join-Path $PSScriptRoot ".." "public" "brand"
if (-not (Test-Path $brandDir)) {
    New-Item -ItemType Directory -Path $brandDir -Force | Out-Null
}

$renames = @(
    @{ Old = "black horizontal.png"; New = "black-horizontal.png" },
    @{ Old = "white horizonta.png";  New = "white-horizontal.png" },
    @{ Old = "white horizontal.png"; New = "white-horizontal.png" },
    @{ Old = "sign black.png";       New = "sign-black.png" },
    @{ Old = "sign white.png";       New = "sign-white.png" }
)

foreach ($r in $renames) {
    $oldPath = Join-Path $brandDir $r.Old
    $newPath = Join-Path $brandDir $r.New
    if (Test-Path $oldPath) {
        Rename-Item -Path $oldPath -NewName $r.New -Force
        Write-Host "Renamed: $($r.Old) -> $($r.New)"
    }
}
Write-Host "Done. Ensure public/brand contains: black-horizontal.png, white-horizontal.png, sign-black.png, sign-white.png"
