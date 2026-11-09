import styles from './Footer.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <span>© {new Date().getFullYear()} PF. Shoes · Trang quản trị</span>
            <a href={`${API_URL}/swagger-ui/index.html`} target="_blank" rel="noopener noreferrer" className={styles.link}>
                Tài liệu API
            </a>
        </footer>
    );
}
