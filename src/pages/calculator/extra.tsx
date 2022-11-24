import AddIcon from "@material-symbols/svg-400/rounded/add.svg";
import DeleteIcon from "@material-symbols/svg-400/rounded/delete.svg";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";
import { Controller, SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { ExpenseTypeValues, NumericalTypeValues } from "@/shared/models/common";
import { leasingExtrasValueValidation, LeasingModel, PartialEditableLeasing } from "@/shared/models/leasing";
import { createCurrencyFormatter, percentFormatter } from "@/shared/utils/numbers";
import { capitalize } from "@/shared/utils/strings";

import { leasingGetHandler, leasingPatchHandler } from "@/api/handlers/leasings";
import { queries } from "@/api/keys";

import { FormButton } from "@/components/form-button";
import { FormInput } from "@/components/form-input";
import { ListboxInput } from "@/components/listbox-input";
import { MaterialIcon } from "@/components/material-icon";
import { ProgressLayout } from "@/components/progress-layout";

import { takeFirstQuery } from "@/utils/query";

const ExtraCalculatorForm = LeasingModel.pick({
  extras: true,
}).superRefine(({ extras }, ctx) => leasingExtrasValueValidation(extras, ctx));
type ExtraCalculatorForm = z.infer<typeof ExtraCalculatorForm>;

const ExtraCalculatorPage: FC = () => {
  const [currencyFormatter, setCurrencyFormatter] = useState<Intl.NumberFormat>();

  const router = useRouter();
  const id = takeFirstQuery(router.query.id);

  const leasing = useQuery(!id ? {} : { ...queries.leasings.getById(id), queryFn: () => leasingGetHandler(id) });
  const mutation = useMutation(
    !id
      ? {}
      : {
          mutationFn: (data: PartialEditableLeasing) => leasingPatchHandler(id, data),
          onSuccess: () => {
            router.push({ pathname: "/leasings/details", query: { id } });
          },
        },
  );

  useEffect(() => {
    if (leasing.data?.currency) {
      setCurrencyFormatter(createCurrencyFormatter(leasing.data.currency));
    }
  }, [leasing.data?.currency]);

  const { control, register, watch, handleSubmit } = useForm<ExtraCalculatorForm>({
    defaultValues: {
      extras: [
        {
          name: "",
          valueType: "number",
          value: 0,
          expenseType: "one-time",
        },
      ],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "extras" });

  useEffect(() => {
    if (fields.length === 0) {
      append({
        name: "",
        valueType: "number",
        value: 0,
        expenseType: "one-time",
      });
    }
  }, [append, fields.length]);

  const extras = watch("extras");

  const onSubmit: SubmitHandler<ExtraCalculatorForm> = form => {
    mutation.mutate(form);
  };

  if (!router.isReady) return <span>Loading...</span>;

  if (!id) {
    router.push("/saved");
    return null;
  }

  return (
    <ProgressLayout>
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Información extra</h2>
        <span className="text-sm text-slate-500">
          Si necesitas algún detalle extra a considerar, puedes añadirlo aquí.
        </span>
      </div>
      <form
        className="border-t border-slate-200 divide-y divide-slate-200 text-sm"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div className="flex py-4 space-x-4">
          <div className="flex flex-col space-y-1 w-full">
            <span className="text-sm font-medium text-slate-700">Nombre</span>
            <span className="text-xs font-light text-slate-600">Solo una referencia para ti</span>
          </div>
          <div className="flex flex-col space-y-1 w-full">
            <span className="text-sm font-medium text-slate-700">Tipo de valor</span>
            <span className="text-xs font-light text-slate-600">Numérico o porcentual</span>
          </div>
          <div className="flex flex-col space-y-1 w-full">
            <span className="text-sm font-medium text-slate-700">Valor</span>
            <span className="text-xs font-light text-slate-600">El valor a utilizar</span>
          </div>
          <div className="flex flex-col space-y-1 w-full">
            <span className="text-sm font-medium text-slate-700">Tipo de gasto</span>
            <span className="text-xs font-light text-slate-600">¿Un solo pago o periódico?</span>
          </div>
          <div className="flex items-center space-x-1">
            <MaterialIcon icon={DeleteIcon} className="invisible text-2xl" />
            <MaterialIcon icon={AddIcon} className="invisible text-2xl" />
          </div>
        </div>
        {fields.map((field, index) => (
          <div key={field.id} className="flex py-4 space-x-4">
            <div className="flex flex-col space-y-1 w-full">
              <FormInput type="text" {...register(`extras.${index}.name` as const)} />
            </div>
            <div className="flex flex-col space-y-1 w-full">
              <Controller
                control={control}
                name={`extras.${index}.valueType` as const}
                render={({ field: { value, name, onChange } }) => (
                  <ListboxInput
                    name={name}
                    value={value}
                    options={NumericalTypeValues.map(i => ({ key: i, value: i }))}
                    transform={capitalize}
                    onChange={onChange}
                  />
                )}
              />
            </div>
            <div className="flex flex-col space-y-1 w-full">
              <FormInput
                type="number"
                mask={() => {
                  let value = extras[index].value;
                  value = Number.isNaN(value) ? 0 : value ?? 0;
                  const type = extras[index].valueType;
                  if (type === "percent") {
                    return percentFormatter.format(value / 100);
                  }
                  return currencyFormatter?.format(value) ?? value;
                }}
                maskClassName="py-2 px-3"
                {...register(`extras.${index}.value` as const, { valueAsNumber: true })}
              />
            </div>
            <div className="flex flex-col space-y-1 w-full">
              <Controller
                control={control}
                name={`extras.${index}.expenseType` as const}
                render={({ field: { value, name, onChange } }) => (
                  <ListboxInput
                    name={name}
                    value={value}
                    options={ExpenseTypeValues.map(i => ({ key: i, value: i }))}
                    transform={capitalize}
                    onChange={onChange}
                  />
                )}
              />
            </div>
            <div className="flex items-center space-x-1">
              <MaterialIcon
                icon={DeleteIcon}
                className="text-2xl text-red-500 cursor-pointer"
                onClick={() => remove(index)}
              />
              <MaterialIcon
                icon={AddIcon}
                className="text-2xl text-sky-700 cursor-pointer"
                onClick={() =>
                  append({
                    name: "",
                    valueType: "number",
                    value: 0,
                    expenseType: "one-time",
                  })
                }
              />
            </div>
          </div>
        ))}
        <div className="w-full py-4 flex justify-end space-x-2">
          <Link href="/saved">
            <FormButton type="button" style="secondary" className="max-w-fit">
              Cancel
            </FormButton>
          </Link>
          <FormButton type="submit" className="max-w-fit">
            Next
          </FormButton>
        </div>
      </form>
    </ProgressLayout>
  );
};

export default ExtraCalculatorPage;
