import clsx from "clsx";
import { ComponentPropsWithoutRef, forwardRef, ReactNode, useId } from "react";
import { FieldError } from "react-hook-form";

export interface Props extends ComponentPropsWithoutRef<"input"> {
  label?: string;
  helper?: string;
  errors?: FieldError | string;
  unstyled?: boolean;
  divClassName?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  mask?: () => ReactNode;
  maskClassName?: string;
}

export const FormInput = forwardRef<HTMLInputElement, Props>((props, ref) => {
  const id = useId();
  const { className, label, helper, errors, unstyled, divClassName, leading, trailing, mask, maskClassName, ...attrs } =
    props;

  const styles = clsx(
    divClassName,
    "relative w-full overflow-hidden",
    label && "mt-1",
    !unstyled && "rounded-md shadow-sm transition-all border",
    errors
      ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-500"
      : !unstyled && "border-gray-300 focus-within:border-sky-700 focus-within:ring-sky-700",
  );

  return (
    <>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className={styles}>
        {leading}
        {mask && <span className={clsx(maskClassName, "absolute bg-white sm:text-sm")}>{mask()}</span>}
        <input
          ref={ref}
          id={id}
          className={clsx(className, "block w-full border-0 rounded-md focus:ring-0 sm:text-sm", mask && "text-white")}
          {...attrs}
        />
        {trailing}
      </div>
      {helper && <span className="text-sm">{helper}</span>}
      {errors && <span className="text-sm text-red-500">{typeof errors === "string" ? errors : errors.message}</span>}
    </>
  );
});

FormInput.displayName = "FormInput";
