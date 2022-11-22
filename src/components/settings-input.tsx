import { Dispatch, FC, MouseEventHandler, ReactNode, SetStateAction, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { FormInput } from "./form-input";

type MaybePromise<T> = Promise<T> | T;

type SingleValueForm<T> = {
  value: T;
};

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

export interface Props {
  label: string;
  type?: HTMLInputStringTypeAttribute;
  initialValue?: string;
  editable?: boolean;
  deletable?: boolean;
  hideToolbar?: boolean;
  children?: ReactNode | ((ctx: { editable: boolean; setEditable: Dispatch<SetStateAction<boolean>> }) => ReactNode);
  onUpdate?: (value?: string) => MaybePromise<boolean | void | undefined>;
  onCancel?: (value?: string) => MaybePromise<boolean | void | undefined>;
  onDelete?: (value?: string) => MaybePromise<boolean | void | undefined>;
  onSave?: (value?: string) => MaybePromise<boolean | void | undefined>;
}

export const SettingsInput: FC<Props> = props => {
  const { label, type = "text", initialValue, hideToolbar, children, onUpdate, onCancel, onDelete, onSave } = props;
  const deletable = props.deletable && typeof onDelete !== "undefined";

  const [internalEditable, setEditable] = useState(false);

  const shouldUseInternalEditable = () => typeof props.editable === "undefined";
  const editable = typeof props.editable !== "undefined" ? props.editable : internalEditable;

  const { register, handleSubmit, reset, formState } = useForm<SingleValueForm<string>>();

  const handleRender = () => {
    if (children) {
      if (typeof children === "function") {
        return children({ editable, setEditable });
      }
      return children;
    }
    if (editable) {
      return (
        <FormInput
          type={type}
          defaultValue={initialValue}
          errors={formState.errors.value?.message?.toString()}
          {...register("value")}
        />
      );
    }
    return initialValue;
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

  const onSubmit: SubmitHandler<SingleValueForm<string>> = async (form, event) => {
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
