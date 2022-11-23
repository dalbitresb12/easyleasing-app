import { Switch } from "@headlessui/react";
import clsx from "clsx";
import { FC } from "react";

export interface Props {
  name?: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
  onBlur: () => void;
  alt?: string;
}

export const SwitchInput: FC<Props> = props => {
  const { name, enabled, onChange, onBlur, alt } = props;

  return (
    <Switch
      name={name}
      checked={enabled}
      onChange={onChange}
      onBlur={onBlur}
      className={clsx(
        "relative inline-flex h-6 w-11 items-center rounded-full",
        enabled ? "bg-sky-700" : "bg-slate-400",
      )}
    >
      <span className="sr-only">{alt}</span>
      <span
        className={clsx(
          "inline-block h-4 w-4 transform rounded-full bg-white transition z-10",
          enabled ? "translate-x-6" : "translate-x-1",
        )}
      />
    </Switch>
  );
};
