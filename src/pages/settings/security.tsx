import { FC } from "react";

import { User } from "@/shared/models/user";

import { SettingsFormLayout, SettingsPage } from "@/components/settings-page";

const layout: SettingsFormLayout[] = [
  {
    title: "Seguridad",
    description: "Mantén esta información privada.",
    fields: [
      {
        key: "password",
        label: "Contraseña",
        type: "password",
        zodValidator: User.shape.password,
      },
      {
        key: "lastPasswordUpdate",
        label: "Última actualización",
        type: "date",
        readonly: true,
      },
    ],
  },
];

const SecuritySettingsPage: FC = () => {
  return <SettingsPage layout={layout} />;
};

export default SecuritySettingsPage;
