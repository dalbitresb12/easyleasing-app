import clsx from "clsx";
import { ComponentPropsWithoutRef, forwardRef, PropsWithChildren } from "react";

export interface Props extends Omit<ComponentPropsWithoutRef<"button">, "style"> {
  style?: "primary" | "secondary" | "text" | "custom";
  alignment?: "start" | "center" | "end";
  size?: "sm" | "md" | "lg";
  padding?: boolean;
  transition?: boolean;
  ring?: boolean;
}

export const FormButton = forwardRef<HTMLButtonElement, PropsWithChildren<Props>>((props, ref) => {
  const {
    className,
    style = "primary",
    alignment = "center",
    transition = style !== "text",
    size = "md",
    padding = true,
    ring = style !== "text",
    ...attrs
  } = props;
  const styles = clsx(
    className,
    transition && "transition-all",
    style === "primary" && "bg-sky-700 text-white hover:bg-sky-800",
    style === "primary" && ring && "focus:ring-sky-700",
    style === "secondary" && "bg-sky-100 text-sky-700 hover:bg-sky-200",
    style === "secondary" && ring && "focus:ring-sky-100",
    style === "text" && "text-sky-700 hover:text-sky-900",
    alignment === "start" && "justify-start",
    alignment === "center" && "justify-center",
    alignment === "end" && "justify-end",
    size === "sm" && "text-xs",
    size === "sm" && padding && "py-1 px-2",
    size === "md" && "text-sm",
    size === "md" && padding && "py-2 px-4",
    size === "lg" && "text-lg",
    size === "lg" && padding && "py-4 px-6",
    "flex w-full rounded-md border border-transparent font-medium",
    ring && "focus:ring-2 focus:ring-offset-2",
    !ring && "focus:ring-0 focus:ring-transparent",
  );

  return (
    <button ref={ref} className={styles} {...attrs}>
      {props.children}
    </button>
  );
});

FormButton.displayName = "FormButton";
