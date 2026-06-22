import clsx from "clsx";

/**
 * Primary button component — large, thumb-friendly, mobile-first
 */
export default function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  className = "",
  type = "button",
  icon: Icon,
  fullWidth = false,
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all duration-150 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

  const variants = {
    primary:
      "bg-brand-500 text-white hover:bg-brand-600 focus-visible:ring-brand-500 shadow-sm",
    secondary:
      "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus-visible:ring-slate-400",
    danger:
      "bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500",
    ghost:
      "bg-transparent text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-400",
    success:
      "bg-field-500 text-white hover:bg-field-600 focus-visible:ring-field-500",
  };

  const sizes = {
    sm: "px-3 py-2 text-sm min-h-[36px]",
    md: "px-5 py-3 text-base min-h-[48px]",
    lg: "px-6 py-4 text-lg min-h-[56px]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        base,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        (disabled || loading) && "opacity-50 cursor-not-allowed active:scale-100",
        className
      )}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : Icon ? (
        <Icon size={size === "sm" ? 14 : size === "lg" ? 20 : 16} />
      ) : null}
      {children}
    </button>
  );
}
