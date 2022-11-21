import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC } from "react";

export interface TabProps {
  label: string;
  href: string;
}

export interface Props {
  tabs: TabProps[];
  className?: string;
}

export const TabBar: FC<Props> = props => {
  const { className, tabs } = props;

  const router = useRouter();
  const isActive = (path: string) => router.pathname === path;

  const styles = clsx(className, "border-b-2 border-slate-200 pb-4");

  return (
    <div className={styles}>
      <div className="space-x-8">
        {tabs.map(item => (
          <div key={item.href} className="relative inline">
            {isActive(item.href) && <span className="absolute w-full inset-0 border-b-2 border-sky-700 z-0 -mb-5" />}
            <Link
              href={item.href}
              className={clsx(
                "relative px-4 text-sm font-medium z-10",
                isActive(item.href) ? "text-sky-700" : "text-slate-900",
              )}
            >
              {item.label}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
