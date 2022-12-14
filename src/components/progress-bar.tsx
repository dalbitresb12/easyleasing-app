import clsx from "clsx";
import { useRouter } from "next/router";
import { FC } from "react";

export interface ProgressBarStep {
  label: string;
  href: string;
  startsWith?: boolean;
}

export interface Props {
  steps: ProgressBarStep[];
  divClassName?: string;
}

const isActive = (pathname: string, { href, startsWith }: ProgressBarStep) => {
  return startsWith ? pathname.startsWith(href) : pathname === href;
};

export const ProgressBar: FC<Props> = props => {
  const { steps, divClassName } = props;
  const router = useRouter();

  const current = steps.reduce<number>((acc, value, index) => {
    const active = isActive(router.pathname, value);
    if (active) return index;
    return acc;
  }, -1);

  return (
    <div className={clsx(divClassName, "w-full flex space-x-4")}>
      {steps.map((step, index) => {
        const { href, label, startsWith } = step;
        const active = index < current || (startsWith ? router.pathname.startsWith(href) : router.pathname === href);
        return (
          <div
            key={href}
            className={clsx(
              "w-full flex flex-col border-t-2 text-xs font-medium pt-2",
              active ? "border-sky-700" : "border-slate-400",
            )}
          >
            <span className="text-sky-700">Paso {index + 1}</span>
            <span className="text-slate-800">{label}</span>
          </div>
        );
      })}
    </div>
  );
};
