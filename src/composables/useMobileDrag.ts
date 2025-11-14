// composables/useMobileDrag.ts
import { ref } from "vue";
import type { DragItem } from "@/components/BoardComponent.vue";

const mobileDragItem = ref<DragItem | null>(null);
const mobileDragPos = ref({ x: 0, y: 0 });

export function useMobileDrag() {
  function startMobileDrag(item: DragItem, x: number, y: number) {
    mobileDragItem.value = item;
    mobileDragPos.value = { x, y };
  }

  function updateMobileDrag(x: number, y: number) {
    mobileDragPos.value = { x, y };
  }

  function endMobileDrag() {
    const item = mobileDragItem.value;
    mobileDragItem.value = null;
    return item;
  }

  return {
    mobileDragItem,
    mobileDragPos,
    startMobileDrag,
    updateMobileDrag,
    endMobileDrag,
  };
}
