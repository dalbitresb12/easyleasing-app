import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, PropsWithChildren } from "react";
import { z, ZodType } from "zod";

import { User } from "@/shared/models/user";

import { usersHandler, usersPatchHandler } from "@/api/handlers";
import { queries } from "@/api/keys";

import { HTMLInputStringTypeAttribute, SettingsInput } from "@/components/settings-input";
import { SettingsLayout } from "@/components/settings-layout";

const UserForm = User.extend({
  picture: z.string().optional(),
}).partial();
type UserForm = z.infer<typeof UserForm>;

type UserFormShape = typeof UserForm.shape;
type UserFormKeys = keyof UserFormShape;

type SettingsField<T extends UserFormKeys = UserFormKeys> = {
  key: T;
} & (
  | {
      label: string;
      type?: HTMLInputStringTypeAttribute;
      zodValidator?: ZodType;
      readonly?: boolean;
      component?: never;
    }
  | {
      label?: never;
      type?: never;
      zodValidator?: never;
      readonly?: never;
      component?: FC;
    }
);

export type SettingsFormLayout<T extends UserFormKeys = UserFormKeys> = {
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
  const data: UserForm = { ...(user.data || {}) };

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

                const value = data[key];
                const initialValue = typeof value === "boolean" ? value.toString() : value;
                const handleSave = (value: typeof data[typeof key]) => {
                  usersMutation.mutate({ [key]: value });
                };

                return (
                  <SettingsInput
                    key={key}
                    type={item.type}
                    zodValidator={item.zodValidator}
                    label={item.label || ""}
                    hideToolbar={item.readonly}
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
