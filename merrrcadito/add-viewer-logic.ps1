$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\UserProfile.tsx"
$content = Get-Content -Path $path -Raw -Encoding UTF8

# 1. Add viewerId state
$targetState = '  const [error, setError] = useState<string | null>(null);'
$replacementState = '  const [error, setError] = useState<string | null>(null);
  const [viewerId, setViewerId] = useState<number | null>(null);'

$content = $content.Replace($targetState, $replacementState)

# 2. Add useEffect to fetch viewer ID
$targetEffect = '  useEffect(() => {
    const fetchCategoriesAndSubcats = async () => {'

$replacementEffect = '  useEffect(() => {
    const fetchViewerData = async () => {
      if (typeof window !== "undefined") {
        const handle = window.localStorage.getItem("currentUserHandle");
        if (handle) {
          try {
            const res = await fetch(
              `${USERS_API_BASE}/get_user_data?handle_name=${encodeURIComponent(handle)}`
            );
            const json = await res.json();
            if (res.ok && json.success && json.data) {
              const data = Array.isArray(json.data) ? json.data[0] : json.data;
              setViewerId(data.cod_us);
            }
          } catch (err) {
            console.error("Error fetching viewer data:", err);
          }
        }
      }
    };
    fetchViewerData();
  }, []);

  useEffect(() => {
    const fetchCategoriesAndSubcats = async () => {'

$content = $content.Replace($targetEffect, $replacementEffect)

# 3. Update EventsSection to use viewerId
$targetEvents = '<EventsSection userId={user?.cod_us ?? 0} />'
$replacementEvents = '<EventsSection userId={viewerId ?? 0} />'
$content = $content.Replace($targetEvents, $replacementEvents)

# 4. Update ExploreSection to use viewerId
$targetExplore = '<ExploreSection currentUserId={user?.cod_us ?? 0} />'
$replacementExplore = '<ExploreSection currentUserId={viewerId ?? 0} />'
$content = $content.Replace($targetExplore, $replacementExplore)

# Normalize line endings
$content = $content -replace "`r`n", "`n"

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
Write-Host "Viewer logic added successfully"
