import React from "react";
import { Icon } from "@tremor/react";
import Image from "next/image";
import { Text } from "@tremor/react";
import { FacetValueProps } from "./alert-table-facet-types";
import { getStatusIcon, getStatusColor } from "./alert-table-facet-utils";
import {
  UserCircleIcon,
  BellIcon,
  BellSlashIcon,
  FireIcon,
} from "@heroicons/react/24/outline";
import AlertSeverity from "./alert-severity";
import { Severity } from "./models";

export const FacetValue: React.FC<FacetValueProps> = ({
  label,
  count,
  isSelected,
  onSelect,
  facetKey,
  showIcon = false,
  facetFilters,
}) => {
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(label, false, false);
  };

  const isExclusivelySelected = () => {
    const currentFilter = facetFilters[facetKey] || [];
    return currentFilter.length === 1 && currentFilter[0] === label;
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isExclusivelySelected()) {
      onSelect("", false, true);
    } else {
      onSelect(label, true, true);
    }
  };

  const currentFilter = facetFilters[facetKey] || [];
  const isValueSelected =
    !currentFilter?.length || currentFilter.includes(label);

  return (
    <div
      className="flex items-center px-2 py-1 hover:bg-gray-100 rounded-sm cursor-pointer group"
      onClick={handleCheckboxClick}
    >
      <div className="flex items-center min-w-[24px]">
        <input
          type="checkbox"
          checked={isValueSelected}
          onClick={handleCheckboxClick}
          onChange={() => {}}
          style={{ accentColor: "#eb6221" }}
          className="h-4 w-4 rounded border-gray-300 cursor-pointer"
        />
      </div>

      <div className="flex-1 flex items-center min-w-0" title={label}>
        {showIcon && (
          <div className="flex items-center min-w-[24px]">
            {facetKey === "source" && (
              <Image
                className="inline-block"
                alt={label}
                height={16}
                width={16}
                title={label}
                src={
                  label.includes("@")
                    ? "/icons/mailgun-icon.png"
                    : `/icons/${label}-icon.png`
                }
              />
            )}
            {facetKey === "severity" && (
              <AlertSeverity severity={label as Severity} />
            )}
            {facetKey === "assignee" && (
              <Icon
                icon={UserCircleIcon}
                size="sm"
                className="text-gray-600 !p-0"
              />
            )}
            {facetKey === "status" && (
              <Icon
                icon={getStatusIcon(label)}
                size="sm"
                color={getStatusColor(label)}
                className="!p-0"
              />
            )}
            {facetKey === "dismissed" && (
              <Icon
                icon={label === "true" ? BellSlashIcon : BellIcon}
                size="sm"
                className="text-gray-600 !p-0"
              />
            )}
            {facetKey === "incident" && (
              <Icon icon={FireIcon} size="sm" className="text-gray-600 !p-0" />
            )}
          </div>
        )}
        <Text className="truncate">{label}</Text>
      </div>

      <div className="flex-shrink-0 w-8 text-right flex justify-end">
        <button
          onClick={handleActionClick}
          className="text-xs text-orange-600 hover:text-orange-800 hidden group-hover:block"
        >
          {isExclusivelySelected() ? "All" : "Only"}
        </button>
        {count > 0 && (
          <Text className="text-xs text-gray-500 group-hover:hidden">
            {count}
          </Text>
        )}
      </div>
    </div>
  );
};