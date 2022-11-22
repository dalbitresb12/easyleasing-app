import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, MouseEventHandler, ReactElement, ReactNode, SetStateAction, useState } from "react";
import { SubmitHandler, useForm, FieldPath } from "react-hook-form";
import { z, ZodType } from "zod";

import { formatDate } from "@/utils/date-formatter";

import { FormInput } from "./form-input";

type MaybePromise<T> = Promise<T> | T;

type SingleValueForm<T> = {
  value: T;
};

type AcceptedValues = string | Date;

export type HTMLInputStringTypeAttribute =
  | "text"
  | "password"
  | "email"
  | "number"
  | "color"
  | "tel"
  | "url"
  | "week"
  | "time"
  | "month"
  | "date"
  | "datetime-local"
  | "search";

export interface Props<T extends AcceptedValues> {
  label: string;
  type?: HTMLInputStringTypeAttribute;
  zodValidator?: ZodType;
  initialValue?: T;
  disabled?: boolean;
  editable?: boolean;
  deletable?: boolean;
  hideToolbar?: boolean;
  children?: ReactNode | ((ctx: { editable: boolean; setEditable: Dispatch<SetStateAction<boolean>> }) => ReactNode);
  onUpdate?: (value?: T) => MaybePromise<boolean | void | undefined>;
  onCancel?: (value?: T) => MaybePromise<boolean | void | undefined>;
  onDelete?: (value?: T) => MaybePromise<boolean | void | undefined>;
  onSave?: (value?: T) => MaybePromise<boolean | void | undefined>;
}

const getInputInitialValue = (value?: AcceptedValues): string | undefined => {
  if (value instanceof Date) return value.toISOString();
  return value;
};

const getDisplayValue = (type: HTMLInputStringTypeAttribute, value?: AcceptedValues): string | undefined => {
  if (type === "password") return "********";
  if (value instanceof Date) return formatDate(value);
  return value;
};

export const SettingsInput = <T extends AcceptedValues>(props: Props<T>): ReactElement<Props<T>> => {
  const {
    label,
    type = "text",
    initialValue,
    disabled,
    hideToolbar,
    children,
    onUpdate,
    onCancel,
    onDelete,
    onSave,
  } = props;
  const deletable = props.deletable && typeof onDelete !== "undefined";

  const [zodValidator] = useState(
    props.zodValidator
      ? z.object({
          value: props.zodValidator,
        })
      : undefined,
  );
  const [internalEditable, setEditable] = useState(false);

  const shouldUseInternalEditable = () => typeof props.editable === "undefined";
  const editable = typeof props.editable !== "undefined" ? props.editable : internalEditable;

  const { register, handleSubmit, reset, formState } = useForm<SingleValueForm<T>>({
    resolver: zodValidator ? zodResolver(zodValidator) : undefined,
  });

  const handleRender = () => {
    if (children) {
      if (typeof children === "function") {
        return children({ editable, setEditable });
      }
      return children;
    }
    if (editable) {
      return (
        <div className="flex flex-col space-y-1">
          <FormInput
            type={type}
            disabled={disabled}
            defaultValue={getInputInitialValue(initialValue)}
            errors={formState.errors.value?.message?.toString()}
            {...register("value" as FieldPath<SingleValueForm<T>>, { valueAsDate: type === "date" })}
          />
        </div>
      );
    }
    return getDisplayValue(type, initialValue);
  };

  const handleUpdate: MouseEventHandler<HTMLButtonElement> = async event => {
    event.persist();
    if (onUpdate && (await onUpdate(initialValue))) return;
    if (!shouldUseInternalEditable()) return;
    setEditable(true);
    reset();
  };

  const handleCancel: MouseEventHandler<HTMLButtonElement> = async event => {
    event.persist();
    if (onCancel && (await onCancel(initialValue))) return;
    if (!shouldUseInternalEditable()) return;
    setEditable(false);
    reset();
  };

  const handleDelete: MouseEventHandler<HTMLButtonElement> = async event => {
    event.persist();
    if (deletable && onDelete && (await onDelete(initialValue))) return;
    if (!shouldUseInternalEditable()) return;
    reset();
  };

  const onSubmit: SubmitHandler<SingleValueForm<T>> = async (form, event) => {
    event?.persist();
    if (onSave && (await onSave(form.value))) return;
    if (!shouldUseInternalEditable()) return;
    setEditable(false);
    reset();
  };

  return (
    <form className="flex py-4 space-x-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="w-full">
        <span className="text-slate-500 font-medium">{label}</span>
      </div>
      <div className="w-full text-slate-900">{handleRender()}</div>
      <div className="w-full space-x-8">
        {!hideToolbar && !editable && (
          <>
            <button className="text-sky-700 font-medium" onClick={handleUpdate}>
              Update
            </button>
            {deletable && (
              <button className="text-red-500 font-medium" onClick={handleDelete}>
                Delete
              </button>
            )}
          </>
        )}
        {!hideToolbar && editable && (
          <>
            <button type="submit" className="text-sky-700 font-medium">
              Save
            </button>
            <button className="text-red-500 font-medium" onClick={handleCancel}>
              Cancel
            </button>
          </>
        )}
      </div>
    </form>
  );
};
