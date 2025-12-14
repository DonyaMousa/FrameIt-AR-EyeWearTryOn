import { Link } from "react-router-dom";
import styles from "./Button.module.css";

export default function Button({
  children,
  to,
  onClick,
  variant = "primary",
  size = "md",
  icon,
  disabled,
  type = "button",
  className = "",
}) {
  const classes = `${styles.button} ${styles[variant]} ${styles[size]} ${className}`.trim();

  if (to) {
    return (
      <Link to={to} className={classes}>
        {icon && <span className={styles.icon}>{icon}</span>}
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </button>
  );
}
