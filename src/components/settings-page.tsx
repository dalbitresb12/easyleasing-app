import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, PropsWithChildren } from "react";
import { z } from "zod";

import { UpdatableUser } from "@/shared/models/user";

import { pictureHandler, usersHandler, usersPatchHandler } from "@/api/handlers";
import { queries } from "@/api/keys";

import { HTMLInputStringTypeAttribute, SettingsInput } from "@/components/settings-input";
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
      type?: HTMLInputStringTypeAttribute;
      component?: never;
    }
  | {
      label?: never;
      type?: never;
      component?: FC;
    }
);

export type SettingsFormLayout<T extends UpdatableUserFormKeys = UpdatableUserFormKeys> = {
  title: string;
  description?: string;
  fields: SettingsField<T>[];
};

export interface Props {
  layout: SettingsFormLayout[];
}

export const SettingsPage: FC<PropsWithChildren<Props>> = props => {
  const { layout, children } = props;

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
                  <SettingsInput
                    key={key}
                    type={item.type}
                    label={item.label || ""}
                    initialValue={initialValue}
                    onSave={handleSave}
                  />
                );
              })}
              {children}
            </div>
          </>
        );
      })}
    </SettingsLayout>
  );
};
