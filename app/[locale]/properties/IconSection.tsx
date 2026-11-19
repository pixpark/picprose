"use client";
import React from "react";
import { Button, Select, SelectItem } from "@heroui/react";
import type { Selection } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useDevicons } from "@/lib/devicons";
import type { UpdateProperty } from "./types";

interface IconSectionProps {
  /** 改一项属性。 */
  updateProperty: UpdateProperty;
}

/**
 * 图标设置：devicon 下拉 + 上传图片图标。
 */
export const IconSection = ({ updateProperty }: IconSectionProps) => {
  const t = useTranslations("RightPropertyPanel");

  const iconInputRef = React.useRef<HTMLInputElement>(null);

  // 图标表是运行时按需拉的（见 lib/devicons.ts）。
  // 数据到达前 Select 的 items 是空的，直接挂载拿不到默认选中项 ——
  // 数据到了就整块重挂一次，行为跟之前静态 import 时一致。
  const deviconList = useDevicons();
  const deviconSelectKey = deviconList.length ? "devicons-ready" : "devicons-loading";

  const handleIconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const file = URL.createObjectURL(event.target.files[0]);
      updateProperty("icon", file);
      updateProperty("devicon", "");
    }
  };

  const handleDeviconChange = (selection: Selection) => {
    let icon = "";
    if (selection && typeof selection !== "string" && selection.size > 0) {
      icon = Array.from(selection)[0].toString();
    }
    updateProperty("devicon", icon);
  };

  const handleIconButtonClick = () => {
    if (iconInputRef.current) {
      iconInputRef.current.click();
    }
  };

  return (
    <div className="flex w-full py-2 items-end gap-2">
      <div className="flex-grow">
        <Select
          key={deviconSelectKey}
          label={t("icon")}
          className="w-full"
          items={deviconList}
          isLoading={deviconList.length === 0}
          onSelectionChange={handleDeviconChange}
          defaultSelectedKeys={["aarch64-plain"]}
          renderValue={(items) => {
            return items.map((item) => (
              <div key={item.key} className="flex gap-2 items-center">
                <i
                  className={`devicon-${String(item.key)} text-foreground dev-icon text-base`}
                ></i>
                <div className="flex flex-col">{item.data?.name}</div>
              </div>
            ));
          }}
        >
          {(item) => (
            <SelectItem
              key={item.name + "-" + item.versions.font[0]}
              textValue={item.name}
            >
              <div className="flex gap-2 items-center">
                <i
                  className={`devicon-${item.name}-${item.versions.font[0]} text-foreground dev-icon text-2xl`}
                ></i>
                <div className="flex flex-col">{item.name}</div>
              </div>
            </SelectItem>
          )}
        </Select>
      </div>
      <div>
        <input
          type="file"
          className="hidden"
          onChange={handleIconUpload}
          ref={iconInputRef}
        />
        <Button
          isIconOnly
          color="primary"
          variant="flat"
          size="lg"
          onClick={handleIconButtonClick}
        >
          <svg
            className="w-5 h-5 text-primary"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.3"
              d="M4 15v2a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-2M12 4v12m0-12 4 4m-4-4L8 8"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
};
