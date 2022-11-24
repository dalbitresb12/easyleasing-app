import clsx from "clsx";
import { FC, PropsWithChildren } from "react";

export interface DividedTableItemProps {
  label: string;
  className?: string;
}

export const DividedTableItem: FC<PropsWithChildren<DividedTableItemProps>> = props => (
  <div className={clsx(props.className, "border-y border-slate-200 text-sm w-full -mt-[1px]")}>
    <div className="flex flex-row space-x-4 py-4">
      <div className="w-full">
        <span className="text-sm font-medium text-slate-800">{props.label}</span>
      </div>
      <div className="w-full">
        <span className="text-sm text-slate-800">{props.children}</span>
      </div>
    </div>
  </div>
);

export interface DividedTableProps {
  className?: string;
}

export const DividedTable: FC<PropsWithChildren<DividedTableProps>> = props => (
  <div className={clsx(props.className, "grid grid-cols-2 gap-x-4 w-full mt-[1px]")}>{props.children}</div>
);
