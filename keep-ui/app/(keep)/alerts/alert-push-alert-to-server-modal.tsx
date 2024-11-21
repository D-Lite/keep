import React, { useState, useEffect } from "react";
import { Button, Textarea, Subtitle, Callout } from "@tremor/react";
import {
  useForm,
  Controller,
  SubmitHandler,
  FieldValues,
} from "react-hook-form";
import Modal from "@/components/ui/Modal";
import { useHydratedSession as useSession } from "@/shared/lib/hooks/useHydratedSession";
import { useApiUrl } from "utils/hooks/useConfig";
import { useProviders } from "utils/hooks/useProviders";
import ImageWithFallback from "@/components/ImageWithFallback";
import { useAlerts } from "utils/hooks/useAlerts";
import { usePresets } from "utils/hooks/usePresets";
import Select from "@/components/ui/Select";

interface PushAlertToServerModalProps {
  handleClose: () => void;
  presetName: string;
}

interface AlertSource {
  name: string;
  type: string;
  alertExample: string;
}

const PushAlertToServerModal = ({
  handleClose,
  presetName,
}: PushAlertToServerModalProps) => {
  const [alertSources, setAlertSources] = useState<AlertSource[]>([]);
  const { useAllPresets } = usePresets();
  const { mutate: presetsMutator } = useAllPresets({
    revalidateIfStale: false,
    revalidateOnFocus: false,
  });
  const { usePresetAlerts } = useAlerts();
  const { mutate: mutateAlerts } = usePresetAlerts(presetName);

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm();

  const selectedSource = watch("source");

  const { data: session } = useSession();
  const { data: providersData } = useProviders();
  const apiUrl = useApiUrl();
  const providers = providersData?.providers || [];

  useEffect(() => {
    if (providers) {
      const sources = providers
        .filter((provider) => provider.alertExample)
        .map((provider) => {
          return {
            name: provider.display_name,
            type: provider.type,
            alertExample: JSON.stringify(provider.alertExample, null, 2),
          };
        });
      setAlertSources(sources);
    }
  }, [providers]);

  const handleSourceChange = (source: AlertSource | null) => {
    if (source) {
      setValue("source", source);
      setValue("alertJson", source.alertExample);
      clearErrors("source");
    }
  };

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    try {
      const response = await fetch(
        `${apiUrl}/alerts/event/${data.source.type}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: data.alertJson,
        }
      );

      if (response.ok) {
        console.log("Alert pushed successfully");
        mutateAlerts();
        presetsMutator();
        handleClose();
      } else {
        const errorData = await response.json();
        setError("apiError", {
          type: "manual",
          message: errorData.detail || "Failed to push alert",
        });
      }
    } catch (error) {
      console.error("An unexpected error occurred", error);
      setError("apiError", {
        type: "manual",
        message: "An unexpected error occurred",
      });
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title="Simulate alert"
      className="w-[600px]"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="relative bg-white p-6 rounded-lg">
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Alert Source
            </label>
            <Controller
              name="source"
              control={control}
              rules={{ required: "Alert source is required" }}
              render={({ field: { value, onChange, ...field } }) => (
                <Select
                  {...field}
                  value={value}
                  onChange={handleSourceChange}
                  options={alertSources}
                  getOptionLabel={(source) => source.name}
                  formatOptionLabel={(source) => (
                    <div className="flex items-center" key={source.type}>
                      <ImageWithFallback
                        src={`/icons/${source.type}-icon.png`}
                        fallbackSrc={`/icons/keep-icon.png`}
                        width={32}
                        height={32}
                        alt={source.type}
                        className=""
                        // Add a key prop to force re-render when source changes
                        key={source.type}
                      />
                      <span className="ml-2">{source.name.toLowerCase()}</span>
                    </div>
                  )}
                  getOptionValue={(source) => source.type}
                  placeholder="Select alert source"
                />
              )}
            />
            {errors.source && (
              <div className="text-sm text-rose-500 mt-1">
                {errors.source.message?.toString()}
              </div>
            )}
          </div>

          {selectedSource && (
            <>
              <Callout
                title="About alert payload"
                color="orange"
                className="break-words mt-4"
              >
                Feel free to edit the payload as you want. However, some of the
                providers expects specific fields, so be careful.
              </Callout>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Alert Payload
                </label>
                <Controller
                  name="alertJson"
                  control={control}
                  rules={{
                    required: "Alert payload is required",
                    validate: (value) => {
                      try {
                        JSON.parse(value);
                        return true;
                      } catch (e) {
                        return "Invalid JSON format";
                      }
                    },
                  }}
                  render={({ field }) => (
                    <Textarea {...field} rows={20} className="w-full mt-1" />
                  )}
                />
                {errors.alertJson && (
                  <div className="text-sm text-rose-500 mt-1">
                    {errors.alertJson.message?.toString()}
                  </div>
                )}
              </div>
            </>
          )}

          {errors.apiError && (
            <div className="text-sm text-rose-500 mt-4">
              <Callout title="Error" color="rose">
                {errors.apiError.message?.toString()}
              </Callout>
            </div>
          )}

          <div className="mt-6 flex gap-2">
            <Button color="orange" type="submit">
              Submit
            </Button>
            <Button
              onClick={handleClose}
              variant="secondary"
              className="border border-orange-500 text-orange-500"
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default PushAlertToServerModal;