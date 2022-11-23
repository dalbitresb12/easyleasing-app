import { Listbox, Transition } from "@headlessui/react";
import CheckIcon from "@material-symbols/svg-400/rounded/check.svg";
import UnfoldMoreIcon from "@material-symbols/svg-400/rounded/unfold_more.svg";
import clsx from "clsx";
import { Fragment, ReactElement } from "react";

import { MaterialIcon } from "./material-icon";

export interface ListboxOption<T> {
  key: string;
  value: T;
  disabled?: boolean;
}

export interface Props<T> {
  name?: string;
  value: T;
  options: ListboxOption<T>[];
  placeholder?: string;
  onChange: (value: T) => void;
  transform: (value: T) => string;
  by?: (a: T, b: T) => boolean;
  className?: string;
}

export const ListboxInput = <T,>(props: Props<T>): ReactElement => {
  const { name, value, options, placeholder = "Selecciona una opción...", onChange, transform, by } = props;

  const className = clsx(
    props.className,
    "relative w-full h-full cursor-default rounded-md bg-white border border-gray-300 py-2 pl-3 pr-10",
    "text-left sm:text-sm focus:outline-none focus:border-sky-700 focus:ring-sky-700 shadow-sm",
  );

  const optionsClassName = clsx(
    "absolute max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg",
    "ring-1 ring-black ring-opacity-5 z-20",
    "focus:outline-none sm:text-sm",
  );

  const selectedOption = transform(value);

  return (
    <Listbox name={name} value={value || null} onChange={onChange} by={by}>
      <div className="relative h-full">
        <Listbox.Button className={className}>
          <span className={clsx("block truncate", !selectedOption && "text-gray-400")}>
            {selectedOption || placeholder}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <MaterialIcon icon={UnfoldMoreIcon} />
          </span>
        </Listbox.Button>
        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <Listbox.Options className={optionsClassName}>
            {options.map(option => (
              <Listbox.Option
                key={option.key}
                value={option.value}
                className={({ active }) =>
                  clsx(
                    "relative cursor-default select-none py-2 pl-10 pr-4",
                    active ? "bg-sky-100 text-sky-700" : "text-slate-800",
                  )
                }
              >
                {({ selected }) => (
                  <>
                    <span className={clsx("block truncate", selected ? "font-medium" : "font-normal")}>
                      {transform(option.value)}
                    </span>
                    {selected && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sky-700">
                        <MaterialIcon icon={CheckIcon} />
                      </span>
                    )}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};
