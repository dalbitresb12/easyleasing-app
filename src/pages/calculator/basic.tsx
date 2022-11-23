import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { FC, useEffect } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { InterestRateTypesValues, NumericalTypeValues, TimeFrequenciesValues } from "@/shared/models/common";
import { leasingBuybackValidation, LeasingModel, leasingRateTypeValidation } from "@/shared/models/leasing";
import { capitalize } from "@/shared/utils/strings";

import { usersHandler } from "@/api/handlers";
import { queries } from "@/api/keys";

import { CalculatorInput } from "@/components/calculator-input";
import { FormButton } from "@/components/form-button";
import { FormInput } from "@/components/form-input";
import { ListboxInput } from "@/components/listbox-input";
import { ProgressLayout } from "@/components/progress-layout";
import { SwitchInput } from "@/components/switch-input";

const LeasingTimeUnit = z.enum(["months", "years"]);
const LeasingTimeUnitValues = Object.values(LeasingTimeUnit.Values);

const BasicCalculatorForm = LeasingModel.pick({
  name: true,
  sellingPrice: true,
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
})
  .extend({
    leasingTimeUnit: LeasingTimeUnit.optional(),
  })
  .superRefine(leasingRateTypeValidation)
  .superRefine(leasingBuybackValidation);
type BasicCalculatorForm = z.infer<typeof BasicCalculatorForm>;

const BasicCalculatorPage: FC = () => {
  const user = useQuery({ ...queries.users.me, queryFn: usersHandler });

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
      buyback: false,
      currency: "PEN",
      paymentFrequency: "monthly",
      leasingTimeUnit: "years",
      rateType: "effective",
      rateFrequency: "monthly",
    },
  });

  const rateType = watch("rateType");
  const buyback = watch("buyback");

  useEffect(() => {
    if (user.isSuccess && !isDirty) {
      setValue("currency", user.data.currency);
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

  const onSubmit: SubmitHandler<BasicCalculatorForm> = form => {
    console.log(form);
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
            <div className="flex flex-col space-y-1">
              <FormInput
                id={id}
                type="number"
                errors={errors.sellingPrice}
                {...register("sellingPrice", { valueAsNumber: true })}
              />
            </div>
          )}
        </CalculatorInput>
        <CalculatorInput label="Frencuencia de pagos" description="¿Cada cuánto estarás pagando?">
          <div className="flex flex-col space-y-1">
            <Controller
              control={control}
              name="paymentFrequency"
              render={({ field: { value, name, onChange } }) => (
                <ListboxInput
                  name={name}
                  value={value}
                  options={TimeFrequenciesValues.map(i => ({ key: i, value: i }))}
                  transform={capitalize}
                  onChange={onChange}
                />
              )}
            />
          </div>
        </CalculatorInput>
        <CalculatorInput label="Duración del leasing" description="¿Cuánto tiempo tomará pagarlo?">
          {id => (
            <div className="w-full flex space-x-1">
              <div className="flex flex-col space-y-1 w-full">
                <FormInput
                  id={id}
                  type="number"
                  errors={errors.leasingTime}
                  {...register("leasingTime", { valueAsNumber: true })}
                />
              </div>
              <div className="flex flex-col space-y-1 w-28 shrink">
                <Controller
                  control={control}
                  name="leasingTimeUnit"
                  render={({ field: { value, name, onChange } }) => (
                    <ListboxInput
                      name={name}
                      value={value}
                      options={LeasingTimeUnitValues.map(i => ({ key: i, value: i }))}
                      transform={v => capitalize(v || "")}
                      onChange={onChange}
                    />
                  )}
                />
              </div>
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
                      transform={capitalize}
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
                      transform={capitalize}
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
                    transform={v => capitalize(v || "")}
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
                          transform={v => capitalize(v || "")}
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
                      {...register("buybackValue", { valueAsNumber: true })}
                    />
                  </div>
                </div>
              )}
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
