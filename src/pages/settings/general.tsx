import { FC } from "react";

import { User } from "@/shared/models/user";

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
        zodValidator: User.shape.fullName,
      },
      {
        label: "Nombre preferido",
        key: "preferredName",
        zodValidator: User.shape.preferredName,
      },
      {
        key: "picture",
        component: PictureInput,
      },
      {
        label: "Email",
        key: "email",
        type: "email",
        zodValidator: User.shape.email,
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
        zodValidator: User.shape.language,
      },
      {
        label: "Formato de fecha",
        key: "dateFormat",
        zodValidator: User.shape.dateFormat,
      },
      {
        label: "Zona horaria",
        key: "timezone",
        zodValidator: User.shape.timezone,
      },
    ],
  },
];

const GeneralSettingsPage: FC = () => {
  return <SettingsPage layout={layout} />;
};

export default GeneralSettingsPage;
