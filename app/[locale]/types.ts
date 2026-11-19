/**
 * 编辑器里「一份海报长什么样」的元素类型。
 *
 * 之前 page.tsx 和 ImageEditor.tsx 各写了一份结构一样的类型（字段一模一样、
 * 名字不一样），改一个字段要记得改两处。这里收敛成一份。
 */

export interface EditorElementPosition {
  x: number;
  y: number;
  visible: boolean;
}

export interface EditorElements {
  title: EditorElementPosition;
  author: EditorElementPosition;
  icon: EditorElementPosition;
  image: { x: number; y: number };
}

/** 新建一份初始布局。 */
export function createInitialElements(): EditorElements {
  return {
    title: { x: 0, y: 0, visible: true },
    author: { x: 0, y: 0, visible: true },
    icon: { x: 0, y: 0, visible: true },
    image: { x: 0, y: 0 },
  };
}
