import { FC, PropsWithChildren } from "react";

import { SearchBarLayout } from "./search-bar-layout";
import { TabBar } from "./tab-bar";

export interface Props {
  title?: string;
}

export const SettingsLayout: FC<PropsWithChildren<Props>> = props => {
  const { title = "Ajustes", children } = props;

  return (
    <SearchBarLayout>
      <h2 className="text-slate-900 text-2xl font-bold">{title}</h2>
      <TabBar
        className="mt-8"
        tabs={[
          {
            label: "General",
            href: "/settings/general",
          },
          {
            label: "Security",
            href: "/settings/security",
          },
          {
            label: "Defaults",
            href: "/settings/defaults",
          },
        ]}
      />
      <div className="mt-4">{children}</div>
    </SearchBarLayout>
  );
};
