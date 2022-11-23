import { FC, PropsWithChildren } from "react";

import { ProgressBar, ProgressBarStep } from "./progress-bar";

const steps: ProgressBarStep[] = [
  {
    label: "Información general",
    href: "/calculator/basic",
  },
  {
    label: "Información extra",
    href: "/calculator/extra",
  },
  {
    label: "Resultados",
    href: "/leasings/",
    startsWith: true,
  },
];

export const ProgressLayout: FC<PropsWithChildren> = props => {
  return (
    <div className="p-8">
      <ProgressBar divClassName="mb-8" steps={steps} />
      {props.children}
    </div>
  );
};
