import { useNavigate } from 'react-router-dom';
import styles from './MainMenu.module.css';

const MENU_ITEMS = [
  { path: '/cust', label: '客戶維護', icon: '👥', desc: 'cust' },
  { path: '/fact', label: '廠商維護', icon: '🏭', desc: 'fact' },
  { path: '/item', label: '商品維護', icon: '📦', desc: 'item' },
  { path: '/user', label: '用戶維護', icon: '🔑', desc: 'user' },
];

export default function MainMenu() {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');

  function handleLogout() {
    sessionStorage.removeItem('user');
    navigate('/login');
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>資料維護系統</h1>
        <div className={styles.userInfo}>
          <span>歡迎，{user.user_name}</span>
          <button onClick={handleLogout} className={styles.logoutBtn}>登出</button>
        </div>
      </header>
      <main className={styles.main}>
        <h2 className={styles.subtitle}>請選擇功能</h2>
        <div className={styles.grid}>
          {MENU_ITEMS.map(item => (
            <button
              key={item.path}
              className={styles.menuCard}
              onClick={() => navigate(item.path)}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.label}>{item.label}</span>
              <span className={styles.desc}>{item.desc}</span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
