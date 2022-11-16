import { FC, PropsWithChildren } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import clsx from "clsx";
import BookmarkIcon from "@material-symbols/svg-400/rounded/bookmark.svg";
import CalculateIcon from "@material-symbols/svg-400/rounded/calculate.svg";
import SettingsIcon from "@material-symbols/svg-400/rounded/settings.svg";
import HelpIcon from "@material-symbols/svg-400/rounded/help.svg";
import LogoutIcon from "@material-symbols/svg-400/rounded/logout.svg";

import { MaterialIcon } from "./material-icon";
import { ReactSVGElement } from "../typings/svg";

export interface NavigationItem {
  href: string;
  activeRoute?: string;
  label: string;
  icon: ReactSVGElement;
}

const navigation: NavigationItem[] = [
  {
    href: "/saved",
    label: "Saved",
    icon: BookmarkIcon,
  },
  {
    href: "/calculator",
    label: "Calculator",
    icon: CalculateIcon,
  },
  {
    activeRoute: "/settings",
    href: "/settings/general",
    label: "Settings",
    icon: SettingsIcon,
  },
  {
    href: "/help",
    label: "Help",
    icon: HelpIcon,
  },
  {
    href: "/logout",
    label: "Logout",
    icon: LogoutIcon,
  },
];

export interface Props {
  className?: string;
  mainClassName?: string;
}

export const Layout: FC<PropsWithChildren<Props>> = props => {
  const router = useRouter();

  return (
    <div className={clsx(props.className, "w-full h-full flex")}>
      <aside className="w-64 h-full flex shrink-0 flex-col justify-between bg-sky-50">
        <div>
          <div className="p-4">
            <h1 className="text-2xl font-semibold text-sky-700">EasyLeasing</h1>
          </div>
          <nav className="mt-2">
            <ul className="flex flex-col">
              {navigation.map(item => {
                const { href, activeRoute, icon, label } = item;
                const active = router.pathname.startsWith(activeRoute ?? href);
                const className = clsx(
                  "flex items-center px-4 py-3 relative hover:bg-sky-100",
                  active && "bg-sky-100 text-sky-700",
                );

                return (
                  <Link key={href} href={href}>
                    <li className={className}>
                      {active && <span className="absolute w-1 left-0 inset-y-0 bg-sky-700" />}
                      <MaterialIcon icon={icon} className={clsx("text-xl mr-2", !active && "text-slate-400")} />
                      <span className={clsx("text-sm font-medium", !active && "text-slate-600")}>{label}</span>
                    </li>
                  </Link>
                );
              })}
            </ul>
          </nav>
        </div>
        <div className="p-4 flex items-center">
          <div className="aspect-square rounded-full w-12 h-12 overflow-hidden shrink-0">
            <Image
              className="h-full object-cover"
              alt="user's profile picture"
              src="https://unsplash.com/photos/YUu9UAcOKZ4/download?w=640"
              width={640}
              height={427}
            />
          </div>
          <div className="ml-4 flex flex-col w-full text-xs space-y-1">
            <span className="font-medium text-sky-700">Hi, John</span>
            <Link href="/settings/general">
              <span className="text-slate-600">View profile</span>
            </Link>
          </div>
        </div>
      </aside>
      <main className={clsx(props.mainClassName, "w-full h-full shadow-md")}>{props.children}</main>
    </div>
  );
};
