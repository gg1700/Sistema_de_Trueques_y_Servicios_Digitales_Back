"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import styles from "./UserProfile.module.css";
import FileInput from "@/Components/Templates/ModalsProfile/FileInput";
import ProfileInput from "@/Components/Atoms/Input/ProfileInput/ProfileInput";
import LikesSection from "./LikesSection";
import EventsSection from "./EventsSection";
import ExploreSection from "./ExploreSection";
import AchievementsSection from "./AchievementsSection"; // Import the new section
import ExchangeRegistrationForm from "./ExchangeRegistrationForm";
import ServiceRegistrationForm from "./ServiceRegistrationForm";
import { getNavItems } from "../../../Utils/navigation";

const USERS_API_BASE =
    process.env.NEXT_PUBLIC_USERS_API_BASE_URL ??
    "http://localhost:5000/api/users";
const PRODUCTS_API_BASE =
    process.env.NEXT_PUBLIC_PRODUCTS_API_BASE_URL ??
    "http://localhost:5000/api/products";
const POSTS_API_BASE =
    process.env.NEXT_PUBLIC_POSTS_API_BASE_URL ??
    "http://localhost:5000/api/posts";
const CATEGORIES_API_BASE =
    process.env.NEXT_PUBLIC_CATEGORIES_API_BASE_URL ??
    "http://localhost:5000/api/categories";
const SUBCATEGORIES_API_BASE =
    process.env.NEXT_PUBLIC_SUBCATEGORIES_API_BASE_URL ??
    "http://localhost:5000/api/subcategories";
const PUBLICATIONS_API_BASE =
    process.env.NEXT_PUBLIC_PUBLICATIONS_API_BASE_URL ??
    "http://localhost:5000/api/publications";
const SERVICES_API_BASE =
    process.env.NEXT_PUBLIC_SERVICES_API_BASE_URL ??
    "http://localhost:5000/api/services";

type Tab = "offers" | "publish" | "likes" | "events" | "explore" | "achievements"; // Added achievements tab
type PublishType = "product" | "service" | "exchange";
type NavRole = "admin" | "user";
type Role = NavRole | "entrepreneur";

interface Offer {
    id: number;
    title: string;
    description: string;
    image?: string;
    price?: number;
}

interface ProductFormState {
    name: string;
    weightKg: string;
    material: string;
    category: string;
    subcategory: string;
    quality: string;
    description: string;
    priceTokens: string;
    image: File | null;
}

interface ServiceFormState {
    name: string;
    duration: string;
    category: string;
    description: string;
    priceTokens: string;
    image: File | null;
}

interface UserApi {
    cod_us: number;
    cod_rol: number;
    handle_name: string;
    nom_us: string;
    ap_pat_us: string;
    ap_mat_us?: string | null;
    correo_us: string;
    telefono_us: string;
    ci_us?: string | null;
    fecha_nac_us?: string | null;
    genero_us?: string | null;
    fecha_registro?: string | null;
}

interface Category {
    cod_cat: number;
    nom_cat: string;
    descr_cat?: string;
    tipo_cat: string;
}

interface Subcategory {
    cod_subcat_prod: number;
    nom_subcat_prod: string;
    descr_subcat_prod: string;
    cod_cat: number;
}

interface UserProfileProps {
    role?: Role;
}

const mapCodRolToRole = (codRol?: number): Role => {
    if (codRol === 2) return "entrepreneur";
    if (codRol === 3) return "admin";
    return "user";
};

export default function UserProfile({
    role: roleProp = "admin",
}: UserProfileProps) {
    const [activeTab, setActiveTab] = useState<Tab>("offers");

    // Modal State
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("¡Publicación Exitosa!");
    const [modalMessage, setModalMessage] = useState("Tu producto ha sido publicado correctamente y ya está visible en el mercado.");

    const [publishType, setPublishType] = useState<PublishType>("product");
    const [showMoreInfo, setShowMoreInfo] = useState(false);

    const [productForm, setProductForm] = useState<ProductFormState>({
        name: "",
        weightKg: "",
        material: "",
        category: "",
        subcategory: "",
        quality: "",
        description: "",
        priceTokens: "",
        image: null,
    });

    const [serviceForm, setServiceForm] = useState<ServiceFormState>({
        name: "",
        duration: "",
        category: "",
        description: "",
        priceTokens: "",
        image: null,
    });

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState<UserApi | null>(null);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [services, setServices] = useState<Offer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [resolvedHandle, setResolvedHandle] = useState<string | null>(null);
    const [resolvedRoleFromStorage, setResolvedRoleFromStorage] =
        useState<Role | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [filteredSubcategories, setFilteredSubcategories] = useState<
        Subcategory[]
    >([]);

    const pathname = usePathname();
    const searchParams = useSearchParams();
    const handleFromUrl = searchParams.get("handle");
    const roleFromUrl = searchParams.get("role") as Role | null;

    useEffect(() => {
        if (handleFromUrl) {
            setResolvedHandle(handleFromUrl);
        } else if (typeof window !== "undefined") {
            const storedHandle = window.localStorage.getItem("currentUserHandle");
            if (storedHandle) {
                setResolvedHandle(storedHandle);
            }
        }
        if (roleFromUrl) {
            setResolvedRoleFromStorage(roleFromUrl);
        } else if (typeof window !== "undefined") {
            const storedRole = window.localStorage.getItem(
                "currentUserRole"
            ) as Role | null;
            if (
                storedRole === "admin" ||
                storedRole === "user" ||
                storedRole === "entrepreneur"
            ) {
                setResolvedRoleFromStorage(storedRole);
            }
        }
    }, [handleFromUrl, roleFromUrl]);

    const roleFromBackend = user ? mapCodRolToRole(user.cod_rol) : null;
    const effectiveRole: Role =
        resolvedRoleFromStorage || roleFromBackend || roleProp || "user";
    const navRole: NavRole = effectiveRole === "admin" ? "admin" : "user";
    const navList = getNavItems(navRole);

    useEffect(() => {
        const fetchCategoriesAndSubcats = async () => {
            try {
                const resCat = await fetch(
                    `${CATEGORIES_API_BASE}?tipo_cat=Producto`
                );
                const jsonCat = await resCat.json().catch(() => ({} as any));
                if (resCat.ok && jsonCat.data && Array.isArray(jsonCat.data)) {
                    setCategories(jsonCat.data as Category[]);
                } else {
                    setCategories([]);
                }
                const resSub = await fetch(`${SUBCATEGORIES_API_BASE}`);
                const jsonSub = await resSub.json().catch(() => ({} as any));
                if (resSub.ok && jsonSub.data && Array.isArray(jsonSub.data)) {
                    setSubcategories(jsonSub.data as Subcategory[]);
                } else {
                    setSubcategories([]);
                }
            } catch (err) {
                console.error("Error cargando categorías/subcategorías:", err);
            }
        };
        fetchCategoriesAndSubcats();
    }, []);

    useEffect(() => {
        if (!productForm.category) {
            setFilteredSubcategories([]);
            return;
        }
        const codCat = parseInt(productForm.category, 10);
        if (isNaN(codCat)) {
            setFilteredSubcategories([]);
            return;
        }
        const filtered = subcategories.filter((s) => s.cod_cat === codCat);
        setFilteredSubcategories(filtered);
    }, [productForm.category, subcategories]);

    const fetchOffersForUser = async (codUs: number) => {
        try {
            const resPosts = await fetch(
                `${POSTS_API_BASE}/all_active_product_posts`
            );
            const jsonPosts = await resPosts.json().catch(() => ({} as any));
            if (resPosts.ok && jsonPosts.data && Array.isArray(jsonPosts.data)) {
                const mappedOffers: Offer[] = jsonPosts.data
                    .filter((p: any) => p.cod_us === codUs)
                    .map((p: any) => ({
                        id: p.cod_pub ?? p.id ?? 0,
                        title: p.nom_prod ?? p.titulo_pub ?? p.title ?? "Sin título",
                        description: p.descr_pub ?? p.desc_prod ?? p.contenido ?? "",
                        image: `${PUBLICATIONS_API_BASE}/${p.cod_pub ?? p.id ?? 0}/image`,
                        price: p.precio_pub ?? p.precio_prod ?? 0,
                    }));
                setOffers(mappedOffers);
            } else {
                setOffers([]);
            }
        } catch (err) {
            console.error("Error al cargar publicaciones de productos:", err);
            setOffers([]);
        }
    };

    const fetchServicesForUser = async (codUs: number) => {
        try {
            const resServices = await fetch(
                `${SERVICES_API_BASE}/user/${codUs}`
            );
            const jsonServices = await resServices.json().catch(() => ({} as any));
            if (resServices.ok && Array.isArray(jsonServices)) {
                const mappedServices: Offer[] = jsonServices.map((s: any) => ({
                    id: s.cod_serv ?? 0,
                    title: s.nom_serv ?? "Sin título",
                    description: s.descr_serv ?? "",
                    image: s.foto_serv ? `data:image/jpeg;base64,${Buffer.from(s.foto_serv).toString('base64')}` : undefined,
                    price: s.precio_serv_token ?? 0,
                }));
                setServices(mappedServices);
            } else {
                setServices([]);
            }
        } catch (err) {
            console.error("Error al cargar servicios:", err);
            setServices([]);
        }
    };

    useEffect(() => {
        if (!resolvedHandle) {
            setError("No se encontró información de sesión del usuario.");
            setLoading(false);
            return;
        }
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const resUser = await fetch(
                    `${USERS_API_BASE}/get_user_data?handle_name=${encodeURIComponent(
                        resolvedHandle
                    )}`
                );
                const jsonUser = await resUser.json();
                if (!resUser.ok || jsonUser.success === false || !jsonUser.data) {
                    throw new Error(
                        jsonUser.message || "No se pudieron cargar los datos del usuario."
                    );
                }
                const rawData = jsonUser.data;
                const userData: UserApi = Array.isArray(rawData)
                    ? rawData[0]
                    : rawData;
                setUser(userData);
                if (userData.cod_us) {
                    await fetchOffersForUser(userData.cod_us);
                    await fetchServicesForUser(userData.cod_us);
                }
            } catch (err: any) {
                console.error(err);
                setError(
                    err?.message ?? "Ocurrió un error al cargar los datos del perfil."
                );
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [resolvedHandle]);

    const handleProductChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        if (name === "category") {
            setProductForm((prev) => ({
                ...prev,
                category: value,
                subcategory: "",
            }));
            return;
        }
        setProductForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleServiceChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target;
        setServiceForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmitProduct = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();
        if (!user?.cod_us) {
            setError("No se encontró el código de usuario para publicar.");
            return;
        }
        if (!productForm.subcategory) {
            setError("Debes seleccionar una subcategoría de producto.");
            return;
        }
        try {
            setError(null);
            const pesoNumber =
                productForm.weightKg.trim() === ""
                    ? 1
                    : Number(productForm.weightKg);
            const precioNumber =
                productForm.priceTokens.trim() === ""
                    ? 0
                    : Number(productForm.priceTokens);
            const productPayload: any = {
                nom_prod:
                    productForm.name && productForm.name.trim() !== ""
                        ? productForm.name
                        : "Producto sin nombre",
                peso_prod: isNaN(pesoNumber) ? 1 : pesoNumber,
                calidad_prod:
                    (productForm.quality as "nuevo" | "usado") || "nuevo",
                estado_prod: "disponible",
                precio_prod: isNaN(precioNumber) ? 0 : precioNumber,
                marca_prod:
                    productForm.material && productForm.material.trim() !== ""
                        ? productForm.material
                        : null,
                desc_prod:
                    productForm.description &&
                        productForm.description.trim() !== ""
                        ? productForm.description
                        : null,
            };
            const resProduct = await fetch(
                `${PRODUCTS_API_BASE}/register?cod_subcat_prod=${encodeURIComponent(
                    productForm.subcategory
                )}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(productPayload),
                }
            );
            const jsonProduct = await resProduct
                .json()
                .catch(() => ({} as any));
            console.log("Respuesta /products/register:", jsonProduct);
            if (!resProduct.ok || jsonProduct.success === false) {
                const backendMsg =
                    (jsonProduct.message ||
                        "No se pudo registrar el producto.") +
                    (jsonProduct.error ? ` ${jsonProduct.error}` : "");
                throw new Error(backendMsg);
            }
            let codProd: number | string | undefined;
            if (
                typeof jsonProduct.data === "number" ||
                typeof jsonProduct.data === "string"
            ) {
                codProd = jsonProduct.data;
            } else if (jsonProduct.data && typeof jsonProduct.data === "object") {
                const createdProduct: any = jsonProduct.data;
                codProd =
                    createdProduct.cod_prod ??
                    createdProduct.cod_producto ??
                    createdProduct.sp_registrarproducto ??
                    createdProduct.id;
            } else if (typeof jsonProduct.cod_prod !== "undefined") {
                codProd = jsonProduct.cod_prod;
            }
            if (!codProd) {
                throw new Error(
                    "No se recibió el código del producto creado (cod_prod) desde el backend."
                );
            }
            const formData = new FormData();
            formData.append("estado_pub", "activo");
            formData.append(
                "contenido",
                productForm.description || productForm.name || ""
            );
            formData.append(
                "cant_prod",
                productForm.weightKg.trim() === ""
                    ? "1"
                    : productForm.weightKg
            );
            formData.append("unidad_medida", "kg");
            if (productForm.image) {
                formData.append("foto_pub", productForm.image);
            }
            const resPost = await fetch(
                `${POSTS_API_BASE}/create?cod_us=${user.cod_us}&cod_prod=${codProd}`,
                {
                    method: "POST",
                    body: formData,
                }
            );
            const jsonPost = await resPost.json().catch(() => ({} as any));
            console.log("Respuesta /posts/create:", jsonPost);
            if (!resPost.ok || jsonPost.success === false) {
                const errorMsg = jsonPost.message || "No se pudo crear la publicación.";
                const errorDetail = jsonPost.error ? ` Detalle: ${jsonPost.error}` : "";
                console.error("Error del backend:", jsonPost);
                throw new Error(errorMsg + errorDetail);
            }
            console.log("Publicación creada con éxito!");

            setModalTitle("¡Publicación Exitosa!");
            setModalMessage("Tu producto ha sido publicado correctamente y ya está visible en el mercado.");
            setShowSuccessModal(true);

            handleCancelProduct();
        } catch (err: any) {
            console.error(err);
            alert(`Error: ${err.message}`);
        }
    };

    const handleSubmitService = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Servicio a publicar:", serviceForm);
    };

    const handleCancelProduct = () => {
        setProductForm({
            name: "",
            weightKg: "",
            material: "",
            category: "",
            subcategory: "",
            quality: "",
            description: "",
            priceTokens: "",
            image: null,
        });
    };

    const handleCancelService = () => {
        setServiceForm({
            name: "",
            duration: "",
            category: "",
            description: "",
            priceTokens: "",
            image: null,
        });
    };

    const fullName =
        user &&
        `${user.nom_us} ${user.ap_pat_us} ${user.ap_mat_us ?? ""}`.trim();
    const roleLabel =
        effectiveRole === "admin"
            ? "Administrador"
            : effectiveRole === "entrepreneur"
                ? "Emprendedor"
                : "Usuario Común";
    const avatarUrl =
        user && user.cod_us ? `${USERS_API_BASE}/${user.cod_us}/image` : null;

    return (
        <section className={styles.profilePage}>
            <header className={styles.header}>
                <div className={styles.headerTop}>
                    <div className={styles.avatarWrapper}>
                        {avatarUrl ? (
                            <div className={styles.avatarCircle}>
                                <img
                                    src={avatarUrl}
                                    alt={user?.handle_name || "Foto de perfil"}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                    }}
                                />
                            </div>
                        ) : (
                            <div className={styles.avatarCircle}>
                                <span className={styles.avatarEmoji}>😊</span>
                            </div>
                        )}
                    </div>
                    <button
                        className={styles.menuButton}
                        type="button"
                        aria-label="Menú"
                        onClick={() => setIsMenuOpen(true)}
                    >
                        <span />
                        <span />
                        <span />
                    </button>
                </div>
                <div className={styles.userInfo}>
                    <h1 className={styles.userName}>
                        {fullName || (loading ? "Cargando..." : "Sin usuario")}
                    </h1>
                    {/* Información de Contacto */}
                    <div className={styles.infoSection}>
                        <h3 className={styles.infoSectionTitle}>Información de Contacto:</h3>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <i className="bi bi-person-circle" style={{ fontSize: '20px', color: '#1fb7a1' }}></i>
                                <div className={styles.infoContent}>
                                    <span className={styles.infoLabel}>Nombre de Usuario:</span>
                                    <span className={styles.infoValue}>@{user?.handle_name ?? "—"}</span>
                                </div>
                            </div>
                            <div className={styles.infoItem}>
                                <i className="bi bi-gear" style={{ fontSize: '20px', color: '#1fb7a1' }}></i>
                                <div className={styles.infoContent}>
                                    <span className={styles.infoLabel}>Rol de Perfil:</span>
                                    <span className={styles.infoValue}>{roleLabel}</span>
                                </div>
                            </div>
                            <div className={styles.infoItem}>
                                <i className="bi bi-telephone" style={{ fontSize: '20px', color: '#1fb7a1' }}></i>
                                <div className={styles.infoContent}>
                                    <span className={styles.infoLabel}>Teléfono/Celular:</span>
                                    <span className={styles.infoValue}>{user?.telefono_us ?? "—"}</span>
                                </div>
                            </div>
                            <div className={styles.infoItem}>
                                <i className="bi bi-envelope" style={{ fontSize: '20px', color: '#1fb7a1' }}></i>
                                <div className={styles.infoContent}>
                                    <span className={styles.infoLabel}>Correo Electrónico:</span>
                                    <span className={styles.infoValue}>{user?.correo_us ?? "—"}</span>
                                </div>
                            </div>
                            <div className={styles.infoItem}>
                                <i className="bi bi-calendar-event" style={{ fontSize: '20px', color: '#1fb7a1' }}></i>
                                <div className={styles.infoContent}>
                                    <span className={styles.infoLabel}>Fecha de Registro:</span>
                                    <span className={styles.infoValue}>
                                        {user?.fecha_registro
                                            ? new Date(user.fecha_registro).toLocaleDateString('es-ES', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            })
                                            : "—"}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/* Información Adicional (Expandible) */}
                        {showMoreInfo && (
                            <div className={styles.additionalInfo}>
                                <h3 className={styles.infoSectionTitle}>Información Personal:</h3>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <i className="bi bi-card-text" style={{ fontSize: '20px', color: '#1fb7a1' }}></i>
                                        <div className={styles.infoContent}>
                                            <span className={styles.infoLabel}>Cédula de Identidad:</span>
                                            <span className={styles.infoValue}>{user?.ci_us ?? "—"}</span>
                                        </div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <i className="bi bi-calendar-check" style={{ fontSize: '20px', color: '#1fb7a1' }}></i>
                                        <div className={styles.infoContent}>
                                            <span className={styles.infoLabel}>Fecha de Nacimiento:</span>
                                            <span className={styles.infoValue}>
                                                {user?.fecha_nac_us
                                                    ? new Date(user.fecha_nac_us).toLocaleDateString('es-ES', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric'
                                                    })
                                                    : "—"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <i className="bi bi-gender-ambiguous" style={{ fontSize: '20px', color: '#1fb7a1' }}></i>
                                        <div className={styles.infoContent}>
                                            <span className={styles.infoLabel}>Género/Sexo:</span>
                                            <span className={styles.infoValue}>
                                                {user?.genero_us
                                                    ? (user.genero_us === 'M' ? 'Masculino' : user.genero_us === 'F' ? 'Femenino' : user.genero_us)
                                                    : "—"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <i className="bi bi-check-circle" style={{ fontSize: '20px', color: '#1fb7a1' }}></i>
                                        <div className={styles.infoContent}>
                                            <span className={styles.infoLabel}>Estado de la Cuenta:</span>
                                            <span className={styles.infoValue} style={{ color: '#1fb7a1', fontWeight: '600' }}>activo</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Botón Ver Más/Menos */}
                        <button
                            className={styles.toggleButton}
                            onClick={() => setShowMoreInfo(!showMoreInfo)}
                        >
                            {showMoreInfo ? (
                                <>
                                    Ver Menos... <i className="bi bi-chevron-up"></i>
                                </>
                            ) : (
                                <>
                                    Ver Más... <i className="bi bi-chevron-down"></i>
                                </>
                            )}
                        </button>
                    </div>
                </div>
                <nav className={styles.tabs}>
                    <button
                        type="button"
                        className={`${styles.tab} ${activeTab === "offers" ? "tabActive" : ""
                            }`}
                        onClick={() => setActiveTab("offers")}
                    >
                        Ofertas Propias
                    </button>
                    <button
                        type="button"
                        className={`${styles.tab} ${activeTab === "publish" ? "tabActive" : ""
                            }`}
                        onClick={() => setActiveTab("publish")}
                    >
                        Publicar
                    </button>
                    <button
                        type="button"
                        className={`${styles.tab} ${activeTab === "likes" ? "tabActive" : ""
                            }`}
                        onClick={() => setActiveTab("likes")}
                    >
                        Me gusta
                    </button>
                    <button
                        type="button"
                        className={`${styles.tab} ${activeTab === "events" ? "tabActive" : ""
                            }`}
                        onClick={() => setActiveTab("events")}
                    >
                        Eventos
                    </button>
                    <button
                        type="button"
                        className={`${styles.tab} ${activeTab === "explore" ? "tabActive" : ""
                            }`}
                        onClick={() => setActiveTab("explore")}
                    >
                        Explorar
                    </button>
                    <button
                        type="button"
                        className={`${styles.tab} ${activeTab === "achievements" ? "tabActive" : ""
                            }`}
                        onClick={() => setActiveTab("achievements")}
                    >
                        Logros 🏆
                    </button>
                </nav>
            </header>
            <div className={styles.tabContent}>
                {loading && (
                    <div className={styles.placeholderTab}>
                        <p>Cargando información del perfil...</p>
                    </div>
                )}
                {!loading && error && (
                    <div className={styles.placeholderTab}>
                        <p>{error}</p>
                    </div>
                )}
                {!loading && !error && activeTab === "offers" && (
                    <OffersSection offers={offers} services={services} />
                )}
                {!loading && !error && activeTab === "publish" && (
                    <PublishSection
                        publishType={publishType}
                        setPublishType={setPublishType}
                        productForm={productForm}
                        serviceForm={serviceForm}
                        handleProductChange={handleProductChange}
                        handleServiceChange={handleServiceChange}
                        handleSubmitProduct={handleSubmitProduct}
                        handleSubmitService={handleSubmitService}
                        handleCancelProduct={handleCancelProduct}
                        handleCancelService={handleCancelService}
                        onChangeProductImage={(file) =>
                            setProductForm((prev) => ({ ...prev, image: file }))
                        }
                        onChangeServiceImage={(file) =>
                            setServiceForm((prev) => ({ ...prev, image: file }))
                        }
                        categories={categories}
                        filteredSubcategories={filteredSubcategories}
                        userId={user?.cod_us ?? 0}
                        setModalTitle={setModalTitle}
                        setModalMessage={setModalMessage}
                        setShowSuccessModal={setShowSuccessModal}
                    />
                )}
                {!loading && !error && activeTab === "likes" && (
                    <LikesSection userId={user?.cod_us ?? 0} />
                )}
                {!loading && !error && activeTab === "events" && (
                    <EventsSection userId={user?.cod_us ?? 0} />
                )}
                {!loading && !error && activeTab === "explore" && (
                    <ExploreSection userId={user?.cod_us ?? 0} />
                )}
                {!loading && !error && activeTab === "achievements" && (
                    <AchievementsSection userId={user?.cod_us ?? 0} />
                )}
            </div>
            {isMenuOpen && (
                <>
                    <div
                        className={styles.menuOverlay}
                        onClick={() => setIsMenuOpen(false)}
                    />
                    <aside className={styles.sideMenu}>
                        <div className={styles.sideMenuHeader}>
                            <span className={styles.sideMenuTitle}>MERRRCADITO</span>
                            <button
                                type="button"
                                className={styles.sideMenuClose}
                                onClick={() => setIsMenuOpen(false)}
                                aria-label="Cerrar menú"
                            >
                                ×
                            </button>
                        </div>
                        <nav className={styles.sideMenuNav}>
                            {navList.map((item) => {
                                const isActive = pathname === item.route;
                                return (
                                    <Link
                                        key={item.route}
                                        href={item.route}
                                        className={`${styles.sideMenuLink} ${isActive ? "sideMenuLinkActive" : ""
                                            }`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </aside>
                </>
            )}
        </section>
    );
}
