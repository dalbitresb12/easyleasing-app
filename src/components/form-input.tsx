import clsx from "clsx";
import { ComponentPropsWithoutRef, forwardRef, useId } from "react";
import { FieldError } from "react-hook-form";

export interface Props extends ComponentPropsWithoutRef<"input"> {
  label?: string;
  helper?: string;
  errors?: FieldError | string;
  unstyled?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, Props>((props, ref) => {
  const id = useId();
  const { className, label, helper, errors, unstyled, ...attrs } = props;

  const styles = clsx(
    className,
    label && "mt-1",
    !unstyled && "block w-full rounded-md shadow-sm sm:text-sm transition-all",
    errors
      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
      : !unstyled && "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500",
  );

  return (
    <>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input ref={ref} id={id} className={styles} {...attrs} />
      {helper && <span className="text-sm">{helper}</span>}
      {errors && <span className="text-sm text-red-500">{typeof errors === "string" ? errors : errors.message}</span>}
    </>
  );
});

FormInput.displayName = "FormInput";
