import clsx from "clsx";

export default function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  name,
  required = false,
  error,
  hint,
  className = "",
  autoComplete,
  multiline = false,
  rows = 3,
}) {
  const inputClass = clsx(
    "w-full px-4 py-3 rounded-xl border bg-white text-slate-800 placeholder-slate-400",
    "focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400",
    "transition-colors duration-150 text-base",
    error ? "border-red-400" : "border-slate-200",
    className
  );

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {multiline ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          required={required}
          className={clsx(inputClass, "resize-none")}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={inputClass}
        />
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
