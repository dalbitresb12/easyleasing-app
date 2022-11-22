import { FC } from "react";

import { User } from "@/shared/models/user";

import { SettingsFormLayout, SettingsPage } from "@/components/settings-page";

const layout: SettingsFormLayout[] = [
  {
    title: "Predeterminados",
    description: "Usaremos esta información para rellenar algunos campos en la calculadora por ti.",
    fields: [
      {
        label: "Moneda",
        key: "currency",
        zodValidator: User.shape.currency,
      },
      {
        label: "Frecuencia de pagos",
        key: "paymentFrequency",
        zodValidator: User.shape.paymentFrequency,
      },
      {
        label: "Tipo de interés",
        key: "interestRateType",
        zodValidator: User.shape.interestRateType,
      },
      {
        label: "Tipo de capitalización",
        key: "capitalizationType",
        zodValidator: User.shape.capitalizationType,
      },
    ],
  },
];

const DefaultsSettingsPage: FC = () => {
  return <SettingsPage layout={layout} />;
};

export default DefaultsSettingsPage;
