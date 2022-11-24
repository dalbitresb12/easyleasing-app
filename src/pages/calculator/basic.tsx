import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import {
  CurrenciesValues,
  InterestRateTypes,
  InterestRateTypesValues,
  localizeInterestRateType,
  localizeNumericalType,
  localizeTimeFrequency,
  NumericalType,
  NumericalTypeValues,
  TimeFrequencies,
  TimeFrequenciesValues,
} from "@/shared/models/common";
import {
  EditableLeasing,
  leasingBuybackValidation,
  LeasingModel,
  leasingRateTypeValidation,
} from "@/shared/models/leasing";
import { createCurrencyFormatter, percentFormatter } from "@/shared/utils/numbers";
import { capitalize } from "@/shared/utils/strings";

import { usersHandler } from "@/api/handlers";
import { leasingsPostHandler } from "@/api/handlers/leasings";
import { queries } from "@/api/keys";

import { CalculatorInput } from "@/components/calculator-input";
import { FormButton } from "@/components/form-button";
import { FormInput } from "@/components/form-input";
import { ListboxInput } from "@/components/listbox-input";
import { ProgressLayout } from "@/components/progress-layout";
import { SwitchInput } from "@/components/switch-input";

const BasicCalculatorForm = LeasingModel.pick({
  name: true,
  sellingPrice: true,
  percentageInitialFee: true,
  currency: true,
  paymentFrequency: true,
  leasingTime: true,
  rateType: true,
  rateValue: true,
  rateFrequency: true,
  capitalizationFrequency: true,
  buyback: true,
  buybackType: true,
  buybackValue: true,
  ksRate: true,
  waccRate: true,
})
  .superRefine(leasingRateTypeValidation)
  .superRefine(leasingBuybackValidation);
type BasicCalculatorForm = z.infer<typeof BasicCalculatorForm>;

const BasicCalculatorPage: FC = () => {
  const router = useRouter();
  const [currencyFormatter, setCurrencyFormatter] = useState<Intl.NumberFormat>();

  const user = useQuery({ ...queries.users.me, queryFn: usersHandler });
  const mutation = useMutation({
    mutationFn: leasingsPostHandler,
    onSuccess: leasing => {
      router.push({
        pathname: "/calculator/extra",
        query: {
          id: leasing.id,
        },
      });
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isDirty },
  } = useForm<BasicCalculatorForm>({
    resolver: zodResolver(BasicCalculatorForm),
    defaultValues: {
      percentageInitialFee: 0,
      currency: "PEN",
      paymentFrequency: "monthly",
      rateValue: 0,
      rateFrequency: "monthly",
      rateType: "effective",
      buyback: false,
      ksRate: 0,
      waccRate: 0,
    },
  });

  const sellingPrice = watch("sellingPrice");
  const percentageInitialFee = watch("percentageInitialFee");
  const currency = watch("currency");
  const rateValue = watch("rateValue");
  const rateType = watch("rateType");
  const buyback = watch("buyback");
  const buybackType = watch("buybackType");
  const buybackValue = watch("buybackValue");
  const ksRate = watch("ksRate");
  const waccRate = watch("waccRate");

  useEffect(() => {
    if (user.isSuccess && !isDirty) {
      setValue("currency", user.data.currency);
      setCurrencyFormatter(createCurrencyFormatter(user.data.currency));
      setValue("paymentFrequency", user.data.paymentFrequency);
      setValue("rateType", user.data.interestRateType);
      if (user.data.interestRateType === "nominal") {
        setValue("capitalizationFrequency", user.data.capitalizationType);
      }
    }
  }, [
    isDirty,
    setValue,
    user.isSuccess,
    user.data?.paymentFrequency,
    user.data?.currency,
    user.data?.interestRateType,
    user.data?.capitalizationType,
  ]);

  useEffect(() => {
    if (!buyback && !user.isInitialLoading) {
      setValue("buybackType", undefined);
      setValue("buybackValue", undefined);
    }
  }, [buyback, setValue, user.isInitialLoading]);

  useEffect(() => {
    if (rateType === "effective" && !user.isInitialLoading) {
      setValue("capitalizationFrequency", undefined);
    }
  }, [rateType, setValue, user.isInitialLoading]);

  useEffect(() => {
    setCurrencyFormatter(createCurrencyFormatter(currency));
  }, [currency]);

  const onSubmit: SubmitHandler<BasicCalculatorForm> = form => {
    mutation.mutate(form as EditableLeasing);
  };

  if (user.isInitialLoading) {
    return null;
  }

  return (
    <ProgressLayout>
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Información general</h2>
        <span className="text-sm text-slate-500">
          La información más básica que necesitamos para calcular tu plan de leasing. Podrás añadir información extra
          más adelante.
        </span>
      </div>
      <form
        className="border-t border-slate-200 divide-y divide-slate-200 text-sm"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <CalculatorInput label="Nombre" description="Solo es una referencia para ti">
          {id => (
            <div className="flex flex-col space-y-1">
              <FormInput id={id} type="text" errors={errors.name} {...register("name")} />
            </div>
          )}
        </CalculatorInput>
        <CalculatorInput label="Precio de venta" description="¿Cuánto cuesta este ítem?">
          {id => (
            <div className="w-full flex space-x-1">
              <div className="flex flex-col space-y-1 w-full">
                <FormInput
                  id={id}
                  type="number"
                  errors={errors.sellingPrice}
                  mask={() => {
                    return currencyFormatter?.format(Number.isNaN(sellingPrice) ? 0 : sellingPrice) ?? sellingPrice;
                  }}
                  maskClassName="py-2 px-3"
                  {...register("sellingPrice", { valueAsNumber: true })}
                />
              </div>
              <div className="flex flex-col w-28 shrink">
                <Controller
                  control={control}
                  name="currency"
                  render={({ field: { value, name, onChange } }) => (
                    <ListboxInput
                      name={name}
                      value={value}
                      options={CurrenciesValues.map(i => ({ key: i, value: i }))}
                      transform={v => v}
                      onChange={onChange}
                    />
                  )}
                />
              </div>
            </div>
          )}
        </CalculatorInput>
        <CalculatorInput label="Cuota inicial" description="¿Qué porcentaje pagará por adelantado?">
          {id => (
            <div className="flex flex-col space-y-1 w-full">
              <FormInput
                id={id}
                type="number"
                errors={errors.percentageInitialFee}
                mask={() => percentFormatter.format(percentageInitialFee / 100)}
                maskClassName="py-2 px-3"
                {...register("percentageInitialFee", { valueAsNumber: true })}
              />
            </div>
          )}
        </CalculatorInput>
        <CalculatorInput label="Frecuencia de pagos" description="¿Cada cuánto estarás pagando?">
          <div className="flex flex-col space-y-1">
            <Controller
              control={control}
              name="paymentFrequency"
              render={({ field: { value, name, onChange } }) => (
                <ListboxInput
                  name={name}
                  value={value}
                  options={TimeFrequenciesValues.map(i => ({ key: i, value: i }))}
                  transform={v => capitalize(localizeTimeFrequency(v as TimeFrequencies))}
                  onChange={onChange}
                />
              )}
            />
          </div>
        </CalculatorInput>
        <CalculatorInput label="Duración del leasing" description="¿Cuántos años tomará pagarlo?">
          {id => (
            <div className="flex flex-col space-y-1 w-full">
              <FormInput
                id={id}
                type="number"
                errors={errors.leasingTime}
                {...register("leasingTime", { valueAsNumber: true })}
              />
            </div>
          )}
        </CalculatorInput>
        <CalculatorInput label="Tasa de interés" description="¿Nominal o efectiva?">
          {id => (
            <div className="w-full flex space-x-1">
              <div className="flex flex-col space-y-1 w-48 shrink">
                <Controller
                  control={control}
                  name="rateType"
                  render={({ field: { value, name, onChange } }) => (
                    <ListboxInput
                      name={name}
                      value={value}
                      options={InterestRateTypesValues.map(i => ({ key: i, value: i }))}
                      transform={v => capitalize(localizeInterestRateType(v as InterestRateTypes))}
                      onChange={onChange}
                    />
                  )}
                />
              </div>
              <div className="flex flex-col space-y-1 w-full">
                <FormInput
                  id={id}
                  type="number"
                  errors={errors.rateValue}
                  mask={() => percentFormatter.format(rateValue / 100)}
                  maskClassName="py-2 px-3"
                  {...register("rateValue", { valueAsNumber: true })}
                />
              </div>
              <div className="flex flex-col space-y-1 w-64 shrink">
                <Controller
                  control={control}
                  name="rateFrequency"
                  render={({ field: { value, name, onChange } }) => (
                    <ListboxInput
                      name={name}
                      value={value}
                      options={TimeFrequenciesValues.map(i => ({ key: i, value: i }))}
                      transform={v => capitalize(localizeTimeFrequency(v as TimeFrequencies))}
                      onChange={onChange}
                    />
                  )}
                />
              </div>
            </div>
          )}
        </CalculatorInput>
        {rateType === "nominal" && (
          <CalculatorInput label="Capitalización" description="Solo utilizado para tasas nominales">
            <div className="flex flex-col space-y-1">
              <Controller
                control={control}
                name="capitalizationFrequency"
                render={({ field: { value, name, onChange } }) => (
                  <ListboxInput
                    name={name}
                    value={value}
                    options={TimeFrequenciesValues.map(i => ({ key: i, value: i }))}
                    transform={v => capitalize(v ? localizeTimeFrequency(v as TimeFrequencies) : "")}
                    onChange={onChange}
                  />
                )}
              />
            </div>
          </CalculatorInput>
        )}
        <CalculatorInput label="Recompra" description="¿Vas a mantener este ítem?">
          {id => (
            <div className="w-full h-full flex items-center space-x-4">
              <div className="flex">
                <Controller
                  control={control}
                  name="buyback"
                  render={({ field: { onChange, onBlur, value, name } }) => (
                    <SwitchInput name={name} enabled={value} onChange={onChange} onBlur={onBlur} />
                  )}
                />
              </div>
              {buyback && (
                <div className="w-full flex space-x-1">
                  <div className="flex flex-col space-y-1 w-48 shrink">
                    <Controller
                      control={control}
                      name="buybackType"
                      render={({ field: { value, name, onChange } }) => (
                        <ListboxInput
                          name={name}
                          value={value}
                          options={NumericalTypeValues.map(i => ({ key: i, value: i }))}
                          transform={v => capitalize(v ? localizeNumericalType(v as NumericalType) : "")}
                          onChange={onChange}
                        />
                      )}
                    />
                  </div>
                  <div className="flex flex-col space-y-1 w-full">
                    <FormInput
                      id={id}
                      type="number"
                      errors={errors.buybackValue}
                      disabled={!buybackType}
                      mask={() => {
                        if (!buybackType) return "";
                        const value = Number.isNaN(buybackValue) ? 0 : buybackValue ?? 0;
                        if (buybackType === "percent") {
                          return percentFormatter.format(value / 100);
                        }
                        return currencyFormatter?.format(value) ?? buybackValue;
                      }}
                      maskClassName="py-2 px-3"
                      {...register("buybackValue", { valueAsNumber: true })}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </CalculatorInput>
        <CalculatorInput label="Tasa de descuento KS">
          {id => (
            <div className="flex flex-col space-y-1 w-full">
              <FormInput
                id={id}
                type="number"
                errors={errors.ksRate}
                mask={() => percentFormatter.format(ksRate / 100)}
                maskClassName="py-2 px-3"
                {...register("ksRate", { valueAsNumber: true })}
              />
            </div>
          )}
        </CalculatorInput>
        <CalculatorInput label="Tasa de descuento WACC">
          {id => (
            <div className="flex flex-col space-y-1 w-full">
              <FormInput
                id={id}
                type="number"
                errors={errors.waccRate}
                mask={() => percentFormatter.format(waccRate / 100)}
                maskClassName="py-2 px-3"
                {...register("waccRate", { valueAsNumber: true })}
              />
            </div>
          )}
        </CalculatorInput>
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

export default BasicCalculatorPage;
