/**
 * 右面板各个 Section 之间共用的类型。
 *
 * 这些类型全部从 `usePicprose` 的返回值推出来 ——
 * `PicproseContext` 里的 `PropertyInfo` 没有导出，也不想为了拆组件
 * 去动它（那是全局状态的唯一出处）。用 `ReturnType` 取一份结构类型，
 * 既不用手抄字段，也不用 any 糊过去。
 */
import type { usePicprose } from "../PicproseContext";

/** 上下文值的完整类型。 */
export type PicproseContextValue = ReturnType<typeof usePicprose>;

/** 一份海报的属性集合（颜色、比例、字号……）。 */
export type PropertyInfo = PicproseContextValue["propertyInfo"];

/** 改一项属性。 */
export type UpdateProperty = PicproseContextValue["updateProperty"];

/** 导出图片。 */
export type DownloadImage = PicproseContextValue["downloadImage"];

/** 换背景类型。 */
export type SetBackgroundType = PicproseContextValue["setBackgroundType"];

/** 换背景图案。 */
export type SetBackgroundPattern = PicproseContextValue["setBackgroundPattern"];

/** 写 SVG 模板参数。 */
export type SetSvgPatternParams = PicproseContextValue["setSvgPatternParams"];

/** 挪背景图。 */
export type SetImagePosition = PicproseContextValue["setImagePosition"];

/** 背景类型。 */
export type BackgroundType = PicproseContextValue["backgroundType"];
