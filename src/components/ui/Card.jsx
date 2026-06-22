import clsx from "clsx";

export default function Card({
  children,
  className = "",
  onClick,
  pressable = false,
  padding = "md",
}) {
  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-5",
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        "bg-white rounded-2xl shadow-card",
        paddings[padding],
        pressable && "cursor-pointer active:scale-[0.98] transition-transform duration-100 hover:shadow-card-hover",
        className
      )}
    >
      {children}
    </div>
  );
}
