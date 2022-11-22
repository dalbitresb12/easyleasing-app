import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC } from "react";
import { z } from "zod";

import { UpdatableUser } from "@/shared/models/user";

import { pictureHandler, usersHandler, usersPatchHandler } from "@/api/handlers";
import { queries } from "@/api/keys";

import { PictureInput } from "@/components/picture-input";
import { SettingsInput } from "@/components/settings-input";
import { SettingsLayout } from "@/components/settings-layout";

const UpdatableUserForm = UpdatableUser.extend({
  picture: z.string().optional(),
});
type UpdatableUserForm = z.infer<typeof UpdatableUserForm>;

type UpdatableUserFormShape = typeof UpdatableUserForm.shape;
type UpdatableUserFormKeys = keyof UpdatableUserFormShape;

type SettingsField<T extends UpdatableUserFormKeys = UpdatableUserFormKeys> = {
  key: T;
} & (
  | {
      label: string;
      component?: never;
    }
  | {
      label?: never;
      component?: FC;
    }
);

type FormLayout<T extends UpdatableUserFormKeys = UpdatableUserFormKeys> = {
  title: string;
  description?: string;
  fields: SettingsField<T>[];
};

const layout: FormLayout[] = [
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
  const user = useQuery({ ...queries.users.me, queryFn: usersHandler });
  const picture = useQuery({ ...queries.users.picture, queryFn: pictureHandler });

  const data: UpdatableUserForm = { ...(user.data || {}), picture: picture.data };

  const queryClient = useQueryClient();
  const usersMutation = useMutation({
    mutationFn: usersPatchHandler,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queries.users._def });
    },
  });

  return (
    <SettingsLayout>
      {layout.map(section => {
        const { title, description, fields } = section;

        return (
          <>
            <div className="space-y-1 mt-8">
              <h3 className="text-xl text-slate-800 font-bold">{title}</h3>
              {description && <span className="text-sm text-slate-500">{description}</span>}
            </div>
            <div className="border-y border-slate-200 divide-y divide-slate-200 text-sm mt-4">
              {fields.map(item => {
                const { key } = item;

                if (item.component) {
                  return <item.component key={key} />;
                }

                const initialValue = data[key] || "";
                const handleSave = (value: typeof data[typeof key]) => {
                  usersMutation.mutate({ [key]: value });
                };

                return (
                  <SettingsInput key={key} label={item.label || ""} initialValue={initialValue} onSave={handleSave} />
                );
              })}
            </div>
          </>
        );
      })}
    </SettingsLayout>
  );
};

export default GeneralSettingsPage;
