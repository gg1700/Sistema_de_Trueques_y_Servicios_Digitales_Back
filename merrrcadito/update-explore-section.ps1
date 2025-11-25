$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\ExploreSection.tsx"
$content = Get-Content -Path $path -Raw -Encoding UTF8

# 1. Update Interface
$content = $content.Replace('interface ExploreSectionProps {
    userId: number;
}', 'interface ExploreSectionProps {
    currentUserId: number;
}')

# 2. Update Component Signature
$content = $content.Replace('export default function ExploreSection({ userId }: ExploreSectionProps) {', 'export default function ExploreSection({ currentUserId }: ExploreSectionProps) {')

# 3. Update useEffect dependency
$content = $content.Replace('useEffect(() => {
        fetchPublications();
    }, [userId]);', 'useEffect(() => {
        fetchPublications();
    }, [currentUserId]);')

# 4. Update fetchPublications URL and add filtering
$oldFetch = '            const res = await fetch(`${POSTS_API_BASE}/explore/${userId}`);
            const json = await res.json();

            if (!res.ok || json.success === false) {
                const errorDetail = json.error ? `: ${json.error}` : "";
                throw new Error((json.message || "Error al cargar publicaciones") + errorDetail);
            }

            setPublications(json.data || []);'

$newFetch = '            const res = await fetch(`${POSTS_API_BASE}/explore/${currentUserId}`);
            const json = await res.json();

            if (!res.ok || json.success === false) {
                const errorDetail = json.error ? `: ${json.error}` : "";
                throw new Error((json.message || "Error al cargar publicaciones") + errorDetail);
            }

            // Filter out posts from current user
            const allPosts = json.data || [];
            const filteredPosts = allPosts.filter((p: Publication) => p.cod_us !== currentUserId);
            setPublications(filteredPosts);'

$content = $content.Replace($oldFetch, $newFetch)

# 5. Update other references to userId
$content = $content.Replace('${LIKES_API_BASE}/check/${userId}/${pubId}', '${LIKES_API_BASE}/check/${currentUserId}/${pubId}')
$content = $content.Replace('body: JSON.stringify({ cod_us: userId, cod_pub })', 'body: JSON.stringify({ cod_us: currentUserId, cod_pub })')

# Normalize line endings
$content = $content -replace "`r`n", "`n"

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
Write-Host "ExploreSection updated successfully"
