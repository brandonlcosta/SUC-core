# Create backend structure
New-Item -ItemType Directory -Force -Path backend/engines, backend/configs, backend/schemas, backend/utils, backend/services, backend/scripts, backend/graph, backend/inputs, backend/outputs, backend/outputs/logs

# Move directories into backend
Move-Item engines/* backend/engines/ -ErrorAction SilentlyContinue
Move-Item rulesets/* backend/configs/ -ErrorAction SilentlyContinue
Move-Item utils/* backend/utils/ -ErrorAction SilentlyContinue
Move-Item services/* backend/services/ -ErrorAction SilentlyContinue
Move-Item scripts/* backend/scripts/ -ErrorAction SilentlyContinue
Move-Item graph/* backend/graph/ -ErrorAction SilentlyContinue
Move-Item inputs/* backend/inputs/ -ErrorAction SilentlyContinue
Move-Item outputs/* backend/outputs/ -ErrorAction SilentlyContinue
Move-Item logs/* backend/outputs/logs/ -ErrorAction SilentlyContinue

# Remove duplicate graphs dir if exists
Remove-Item -Recurse -Force graphs -ErrorAction SilentlyContinue

# Create schema stubs required by playbook
$schemas = "normalizedEvent.schema.json","ruleset.schema.json","broadcastTick.schema.json","operatorMetrics.schema.json","sponsorImpressions.schema.json"
foreach ($s in $schemas) {
    New-Item -ItemType File -Force -Path ("backend/schemas/" + $s)
}

Write-Host "✅ Migration complete. Run 'tree /F backend' to verify."
