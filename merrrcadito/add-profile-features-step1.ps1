$path = "C:\Users\MAT\Documents\Sistema_de_Trueques_y_Servicios_Digitales_Front\merrrcadito\src\Components\Templates\ModalsProfile\UserProfile.tsx"

# Read the file
$content = Get-Content -Path $path -Raw -Encoding UTF8

# 1. Add component imports after ProfileInput import
$oldImports = 'import ProfileInput from "@/Components/Atoms/Input/ProfileInput/ProfileInput";
import { getNavItems } from "../../../Utils/navigation";'

$newImports = 'import ProfileInput from "@/Components/Atoms/Input/ProfileInput/ProfileInput";
import LikesSection from "./LikesSection";
import EventsSection from "./EventsSection";
import ExploreSection from "./ExploreSection";
import ExchangeRegistrationForm from "./ExchangeRegistrationForm";
import ServiceRegistrationForm from "./ServiceRegistrationForm";
import { getNavItems } from "../../../Utils/navigation";'

$content = $content.Replace($oldImports, $newImports)
Write-Host "✓ Added component imports"

# 2. Add SERVICES_API_BASE constant
$oldConst = 'const PUBLICATIONS_API_BASE =
  process.env.NEXT_PUBLIC_PUBLICATIONS_API_BASE_URL ??
  "http://localhost:5000/api/publications";

type Tab = "offers"'

$newConst = 'const PUBLICATIONS_API_BASE =
  process.env.NEXT_PUBLIC_PUBLICATIONS_API_BASE_URL ??
  "http://localhost:5000/api/publications";
const SERVICES_API_BASE =
  process.env.NEXT_PUBLIC_SERVICES_API_BASE_URL ??
  "http://localhost:5000/api/services";

type Tab = "offers"'

$content = $content.Replace($oldConst, $newConst)
Write-Host "✓ Added SERVICES_API_BASE constant"

# 3. Update Tab type to include "explore"
$content = $content.Replace('type Tab = "offers" | "publish" | "likes" | "events";', 'type Tab = "offers" | "publish" | "likes" | "events" | "explore";')
Write-Host "✓ Updated Tab type"

# 4. Update PublishType to include "exchange"
$content = $content.Replace('type PublishType = "product" | "service";', 'type PublishType = "product" | "service" | "exchange";')
Write-Host "✓ Updated PublishType"

# 5. Add modal state after showSuccessModal
$oldState = '  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [publishType, setPublishType] = useState<PublishType>("product");'

$newState = '  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("¡Publicación Exitosa!");
  const [modalMessage, setModalMessage] = useState("Tu producto ha sido publicado correctamente y ya está visible en el mercado.");
  const [publishType, setPublishType] = useState<PublishType>("product");'

$content = $content.Replace($oldState, $newState)
Write-Host "✓ Added modal state"

# 6. Add services state after offers state
$oldOffersState = '  const [offers, setOffers] = useState<Offer[]>([]);'
$newOffersState = '  const [offers, setOffers] = useState<Offer[]>([]);
  const [services, setServices] = useState<Offer[]>([]);'

$content = $content.Replace($oldOffersState, $newOffersState)
Write-Host "✓ Added services state"

# Save the file
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)

Write-Host "`n✅ Step 1 complete: Imports and state added"
Write-Host "File saved successfully"
