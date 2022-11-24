import BookmarkIcon from "@material-symbols/svg-400/rounded/bookmark.svg";
import CalculateIcon from "@material-symbols/svg-400/rounded/calculate.svg";
import HelpIcon from "@material-symbols/svg-400/rounded/help.svg";
import LogoutIcon from "@material-symbols/svg-400/rounded/logout.svg";
import SettingsIcon from "@material-symbols/svg-400/rounded/settings.svg";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC, PropsWithChildren } from "react";

import { pictureHandler, usersHandler } from "@/api/handlers";
import { queries } from "@/api/keys";

import { JwtStore } from "@/utils/jwt-store";

import { ReactSVGElement } from "../typings/svg";
import { CircularAvatar } from "./circular-avatar";
import { MaterialIcon } from "./material-icon";

export interface NavigationItem {
  href: string;
  activeRoute?: string;
  label: string;
  icon: ReactSVGElement;
}

const navigation: NavigationItem[] = [
  {
    href: "/saved",
    label: "Guardados",
    icon: BookmarkIcon,
  },
  {
    href: "/calculator/basic",
    label: "Calculadora",
    icon: CalculateIcon,
  },
  {
    activeRoute: "/settings",
    href: "/settings/general",
    label: "Ajustes",
    icon: SettingsIcon,
  },
  {
    href: "/help",
    label: "Ayuda",
    icon: HelpIcon,
  },
];

export interface Props {
  className?: string;
  mainClassName?: string;
}

export const Layout: FC<PropsWithChildren<Props>> = props => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const user = useQuery({ ...queries.users.me, queryFn: usersHandler });
  const picture = useQuery({ ...queries.users.picture, queryFn: pictureHandler });

  const logoutHandler = async () => {
    await JwtStore.clear();
    await queryClient.invalidateQueries({ queryKey: queries.users._def });
    router.push("/auth/login");
  };

  if (user.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={clsx(props.className, "w-full h-full flex")}>
      {!user.isError && (
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
                <li
                  className="flex items-center px-4 py-3 relative hover:bg-sky-100 cursor-pointer"
                  onClick={logoutHandler}
                >
                  <MaterialIcon icon={LogoutIcon} className="text-xl mr-2 text-slate-400" />
                  <span className="text-sm font-medium text-slate-600">Salir</span>
                </li>
              </ul>
            </nav>
          </div>
          <div className="p-4 flex items-center">
            <CircularAvatar
              picture={picture.data}
              alt={`foto de perfil de ${user.data.preferredName}`}
              placeholder={user.data.preferredName}
            />
            <div className="ml-4 flex flex-col w-full text-xs space-y-1">
              <span className="font-medium text-sky-700">Hola, {user.data.preferredName}</span>
              <Link href="/settings/general">
                <span className="text-slate-600">Ver perfil</span>
              </Link>
            </div>
          </div>
        </aside>
      )}
      <main className={clsx(props.mainClassName, !user.isError && "shadow-md", "w-full h-full overflow-y-scroll")}>
        {props.children}
      </main>
    </div>
  );
};
