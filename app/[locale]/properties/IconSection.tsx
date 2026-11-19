"use client";
import React from "react";
import { Button, Label, ListBox, Select } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useDevicons } from "@/lib/devicons";
import type { UpdateProperty } from "./types";

interface IconSectionProps {
  /** 改一项属性。 */
  updateProperty: UpdateProperty;
}

/** 默认选中的图标（HeroUI v2 里是 defaultSelectedKeys={["aarch64-plain"]}）。 */
const DEFAULT_DEVICON = "aarch64-plain";

/**
 * 图标设置：devicon 下拉 + 上传图片图标。
 *
 * HeroUI v3 的 Select 是复合结构（Trigger / Value / Indicator / Popover），
 * 选项用 ListBox.Item，且用 id 而不是 key 标识选项。
 */
export const IconSection = ({ updateProperty }: IconSectionProps) => {
  const t = useTranslations("RightPropertyPanel");

  const iconInputRef = React.useRef<HTMLInputElement>(null);

  // 图标表是运行时按需拉的（见 lib/devicons.ts）。
  // 数据到达前 Select 的选项是空的，直接挂载拿不到默认选中项 ——
  // 数据到了就整块重挂一次，行为跟之前静态 import 时一致。
  const deviconList = useDevicons();
  const deviconSelectKey = deviconList.length ? "devicons-ready" : "devicons-loading";

  const [selectedDevicon, setSelectedDevicon] = React.useState(DEFAULT_DEVICON);

  /** 图标 id 的统一算法：名字 + 字体版本。 */
  const deviconId = (name: string, fontVersion: string) => `${name}-${fontVersion}`;

  /** 当前选中的图标条目。 */
  const selectedEntry = deviconList.find(
    (item) => deviconId(item.name, item.versions.font[0]) === selectedDevicon
  );

  const handleIconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const file = URL.createObjectURL(event.target.files[0]);
      updateProperty("icon", file);
      updateProperty("devicon", "");
    }
  };

  const handleDeviconChange = (key: React.Key | null) => {
    if (key == null) return;
    const id = String(key);
    setSelectedDevicon(id);
    updateProperty("devicon", id);
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
          className="w-full"
          // 图标表还没到时先不选 —— 否则 RAC 会去找一个不存在的选项。
          value={deviconList.length ? selectedDevicon : null}
          onChange={handleDeviconChange}
        >
          <Label>{t("icon")}</Label>
          <Select.Trigger>
            <Select.Value>
              {({ defaultChildren, isPlaceholder }) => {
                if (isPlaceholder || !selectedEntry) {
                  return defaultChildren;
                }
                return (
                  <div className="flex gap-2 items-center">
                    <i
                      className={`devicon-${selectedEntry.name}-${selectedEntry.versions.font[0]} text-foreground dev-icon text-base`}
                    ></i>
                    <div className="flex flex-col">{selectedEntry.name}</div>
                  </div>
                );
              }}
            </Select.Value>
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {deviconList.map((item) => {
                const id = deviconId(item.name, item.versions.font[0]);
                return (
                  <ListBox.Item key={id} id={id} textValue={item.name}>
                    <div className="flex gap-2 items-center">
                      <i
                        className={`devicon-${item.name}-${item.versions.font[0]} text-foreground dev-icon text-2xl`}
                      ></i>
                      <div className="flex flex-col">{item.name}</div>
                    </div>
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                );
              })}
            </ListBox>
          </Select.Popover>
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
          variant="secondary"
          size="lg"
          onPress={handleIconButtonClick}
        >
          <svg
            className="w-5 h-5"
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
