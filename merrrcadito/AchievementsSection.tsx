import React, { useEffect, useState } from 'react';
import AchievementCard from '../../Molecules/Cards/AchievementCard';
import styles from './AchievementsSection.module.css';

interface Achievement {
    cod_logro: number;
    titulo_logro: string;
    descr_logro: string;
    calidad_logro: string;
    progreso: number;
    estado_logro: 'completado' | 'en_progreso' | 'no_iniciado';
    fecha_obtencion_logro?: string;
}

interface AchievementsSectionProps {
    userId: number;
}

const ACHIEVEMENTS_API_BASE = process.env.NEXT_PUBLIC_ACHIEVEMENTS_API_BASE_URL ?? "http://localhost:5000/api/achievements";

const AchievementsSection: React.FC<AchievementsSectionProps> = ({ userId }) => {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'completed' | 'in_progress'>('all');

    useEffect(() => {
        const fetchAchievements = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${ACHIEVEMENTS_API_BASE}/user/${userId}`);
                const result = await response.json();

                if (result.success) {
                    setAchievements(result.data);
                } else {
                    setError(result.message || "Error al cargar logros");
                }
            } catch (err) {
                console.error("Error fetching achievements:", err);
                setError("Error de conexión al cargar logros");
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchAchievements();
        }
    }, [userId]);

    const filteredAchievements = achievements.filter(a => {
        if (filter === 'all') return true;
        if (filter === 'completed') return a.estado_logro === 'completado';
        if (filter === 'in_progress') return a.estado_logro !== 'completado';
        return true;
    });

    const completedCount = achievements.filter(a => a.estado_logro === 'completado').length;
    const totalCount = achievements.length;

    if (loading) return <div className={styles.loading}>Cargando logros...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Mis Logros</h2>
                <div className={styles.stats}>
                    <span className={styles.statItem}>
                        <strong>{completedCount}</strong> / {totalCount} Completados
                    </span>
                </div>
            </div>

            <div className={styles.filters}>
                <button
                    className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
                    onClick={() => setFilter('all')}
                >
                    Todos
                </button>
                <button
                    className={`${styles.filterBtn} ${filter === 'completed' ? styles.active : ''}`}
                    onClick={() => setFilter('completed')}
                >
                    Completados
                </button>
                <button
                    className={`${styles.filterBtn} ${filter === 'in_progress' ? styles.active : ''}`}
                    onClick={() => setFilter('in_progress')}
                >
                    En Progreso
                </button>
            </div>

            <div className={styles.grid}>
                {filteredAchievements.length > 0 ? (
                    filteredAchievements.map((achievement) => (
                        <AchievementCard
                            key={achievement.cod_logro}
                            title={achievement.titulo_logro}
                            description={achievement.descr_logro}
                            progress={achievement.progreso}
                            status={achievement.estado_logro}
                            dateObtained={achievement.fecha_obtencion_logro}
                        // iconUrl={`${ACHIEVEMENTS_API_BASE}/${achievement.cod_logro}/image`} // Uncomment if image endpoint is ready
                        />
                    ))
                ) : (
                    <div className={styles.emptyState}>
                        No hay logros en esta sección.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AchievementsSection;
