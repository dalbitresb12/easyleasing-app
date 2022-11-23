import { FC, ReactNode, useId } from "react";

export interface Props {
  label: string;
  description?: string;
  children: ReactNode | ((id: string) => ReactNode);
}

export const CalculatorInput: FC<Props> = props => {
  const { label, description, children } = props;
  const id = useId();

  const handleRender = () => {
    if (typeof children === "function") return children(id);
    return children;
  };

  return (
    <div className="flex py-4 space-x-4">
      <div className="w-96 max-w-sm shrink text-slate-800">
        <label htmlFor={id} className="font-medium flex flex-col space-y-1">
          <span>{label}</span>
          {description && <span className="text-xs font-light">{description}</span>}
        </label>
      </div>
      <div className="w-full">{handleRender()}</div>
    </div>
  );
};
