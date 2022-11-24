import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC, useEffect } from "react";
import { Controller, SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { getPeriods } from "@/shared/finance/initial-data";
import { GracePeriod, GracePeriodValues, localizeGracePeriod } from "@/shared/models/common";
import { PartialEditableLeasing } from "@/shared/models/leasing";
import { capitalize } from "@/shared/utils/strings";

import { leasingGetHandler, leasingPatchHandler } from "@/api/handlers/leasings";
import { queries } from "@/api/keys";

import { FormButton } from "@/components/form-button";
import { ListboxInput } from "@/components/listbox-input";
import { ProgressLayout } from "@/components/progress-layout";

import { takeFirstQuery } from "@/utils/query";

const PeriodsCalculatorForm = z.object({
  gracePeriods: z.array(
    z.object({
      value: GracePeriod,
    }),
  ),
});
type PeriodsCalculatorForm = z.infer<typeof PeriodsCalculatorForm>;

const PeriodsCalculatorPage: FC = () => {
  const router = useRouter();
  const id = takeFirstQuery(router.query.id);

  const queryClient = useQueryClient();

  const leasing = useQuery(!id ? {} : { ...queries.leasings.getById(id), queryFn: () => leasingGetHandler(id) });
  const mutation = useMutation(
    !id
      ? {}
      : {
          mutationFn: (data: PartialEditableLeasing) => leasingPatchHandler(id, data),
          onSuccess: response => {
            queryClient.setQueryData(queries.leasings.getById(id).queryKey, response);
            router.push({ pathname: "/leasings/details", query: { id } });
          },
        },
  );

  const { control, handleSubmit } = useForm<PeriodsCalculatorForm>({
    defaultValues: {
      gracePeriods: [],
    },
  });
  const { fields, append } = useFieldArray({ control, name: "gracePeriods" });

  const periods = leasing.data ? getPeriods(leasing.data.leasingTime, leasing.data.paymentFrequency) : undefined;

  useEffect(() => {
    if (periods && fields.length === 0) {
      for (let i = 0; i < periods; ++i) {
        append({ value: "no" });
      }
    }
  }, [append, fields.length, periods]);

  const onSubmit: SubmitHandler<PeriodsCalculatorForm> = form => {
    mutation.mutate({
      gracePeriods: form.gracePeriods.map(i => i.value),
    });
  };

  if (!router.isReady) return null;

  if (!id) {
    router.push("/saved");
    return null;
  }

  if (leasing.isLoading) return <span>Loading...</span>;

  if (leasing.isError) return <span>Error</span>;

  return (
    <ProgressLayout>
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Periodos de gracia</h2>
        <span className="text-sm text-slate-500">
          Escoja aquí los tipos de plazo de gracia a considerar durante el cronograma de pagos.
        </span>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="border-t border-slate-200 divide-y divide-slate-200 text-sm"
        noValidate
      >
        <div className="flex py-4 space-x-4">
          <div className="flex items-center w-24">
            <span className="text-sm font-medium text-slate-700">Periodo</span>
          </div>
          <div className="flex flex-col space-y-1 w-full">
            <span className="text-sm font-medium text-slate-700">Tipo</span>
          </div>
        </div>
        {fields.map((field, index, arr) => (
          <div key={field.id} className="flex py-4 space-x-4">
            <div className="flex items-center w-24">
              <span className="text-sm">{index + 1}</span>
            </div>
            <div className="flex flex-col space-y-1 w-full">
              <Controller
                control={control}
                name={`gracePeriods.${index}.value` as const}
                render={({ field: { value, name, onChange } }) => (
                  <ListboxInput
                    name={name}
                    value={value}
                    options={GracePeriodValues.map(i => ({
                      key: i,
                      value: i,
                      disabled: index === arr.length - 1 && i !== "no",
                    }))}
                    transform={v => capitalize(v ? localizeGracePeriod(v as GracePeriod) : "")}
                    onChange={onChange}
                  />
                )}
              />
            </div>
          </div>
        ))}
        <div className="w-full py-4 flex justify-end space-x-2">
          <Link href="/saved">
            <FormButton type="button" style="secondary" className="max-w-fit">
              Cancelar
            </FormButton>
          </Link>
          <FormButton type="submit" className="max-w-fit">
            Siguiente
          </FormButton>
        </div>
      </form>
    </ProgressLayout>
  );
};

export default PeriodsCalculatorPage;
