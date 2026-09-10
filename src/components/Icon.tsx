interface IconProps {
  name: string;
  className?: string;
  fill?: boolean;
}

export function Icon({ name, className = 'text-[18px]', fill = false }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      data-icon={name}
      style={fill ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
      {name}
    </span>
  );
}
