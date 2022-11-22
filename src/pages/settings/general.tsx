import { FC } from "react";

import { PictureInput } from "@/components/picture-input";
import { SettingsFormLayout, SettingsPage } from "@/components/settings-page";

const layout: SettingsFormLayout[] = [
  {
    title: "General",
    description: "Esta información solo será utilizada para tener un conocimiento básico sobre ti.",
    fields: [
      {
        label: "Nombre completo",
        key: "fullName",
      },
      {
        label: "Nombre preferido",
        key: "preferredName",
      },
      {
        key: "picture",
        component: PictureInput,
      },
      {
        label: "Email",
        key: "email",
      },
    ],
  },
  {
    title: "Cuenta",
    description: "Administra cómo se muestran los datos en tu cuenta.",
    fields: [
      {
        label: "Lenguaje",
        key: "language",
      },
      {
        label: "Formato de fecha",
        key: "dateFormat",
      },
      {
        label: "Zona horaria",
        key: "timezone",
      },
    ],
  },
];

const GeneralSettingsPage: FC = () => {
  return <SettingsPage layout={layout} />;
};

export default GeneralSettingsPage;
