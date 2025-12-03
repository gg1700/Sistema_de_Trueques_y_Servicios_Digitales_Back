import React from 'react';
import styles from './AchievementCard.module.css';

interface AchievementCardProps {
    title: string;
    description: string;
    iconUrl?: string; // URL to fetch the icon
    progress: number; // Current progress count
    target?: number; // Target count (if applicable, though backend might just give progress)
    status: 'completado' | 'en_progreso' | 'no_iniciado';
    dateObtained?: string;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
    title,
    description,
    iconUrl,
    progress,
    status,
    dateObtained,
}) => {
    const isCompleted = status === 'completado';

    return (
        <div className={`${styles.card} ${isCompleted ? styles.completed : ''}`}>
            <div className={styles.iconContainer}>
                {iconUrl ? (
                    <img src={iconUrl} alt={title} className={styles.icon} />
                ) : (
                    <div className={styles.placeholderIcon}>🏆</div>
                )}
            </div>
            <div className={styles.content}>
                <h4 className={styles.title}>{title}</h4>
                <p className={styles.description}>{description}</p>

                {isCompleted ? (
                    <div className={styles.completedBadge}>
                        <span>¡Completado!</span>
                        {dateObtained && <span className={styles.date}>{new Date(dateObtained).toLocaleDateString()}</span>}
                    </div>
                ) : (
                    <div className={styles.progressContainer}>
                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{ width: `${Math.min(progress * 10, 100)}%` }} // Assuming progress is roughly 0-10 or similar for now
                            ></div>
                        </div>
                        <span className={styles.progressText}>En progreso</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AchievementCard;
