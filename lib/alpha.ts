/**
 * 遮罩透明度的换算。
 *
 * 遮罩颜色是「色号 + 两位 hex 后缀」拼出来的（见 ImageEditor 的
 * `color + blurTrans`），所以百分比 ↔ hex 的换算必须处处一致。
 *
 * 之前这里没有统一入口：滑块写进去的是十进制字符串
 *（`value.toString()`），显示和渲染却都按十六进制读，
 * 于是拖一次滑块，界面显示和实际遮罩浓度就全错了。
 * 统一走这两个函数就不会再有进制混用。
 */

/** 百分比（0-100）→ 8 位 hex 的 alpha 字节（两位小写 hex）。 */
export function percentToHexAlpha(percent: number): string {
  const clamped = Math.min(100, Math.max(0, percent));
  return Math.round((clamped / 100) * 255)
    .toString(16)
    .padStart(2, "0");
}

/** 8 位 hex 的 alpha 字节 → 百分比（0-100，向上取整）。 */
export function hexAlphaToPercent(hex: string): number {
  const parsed = parseInt(hex, 16);
  if (!Number.isFinite(parsed)) return 0;
  return Math.round((parsed / 255) * 100);
}
