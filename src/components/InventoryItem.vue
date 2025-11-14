<template>
  <img
    :src="src"
    draggable="true"

    @dragstart="onDesktopDragStart"
    @touchstart.prevent="onTouchStart"
    @touchmove.prevent="onTouchMove"
    class="object-cover border-2 border-gray-500 rounded-md cursor-grab touch-none"
  />
</template>

<script setup lang="ts">
import { useMobileDrag } from "@/composables/useMobileDrag";

const props = defineProps<{
  src: string;
  type: "champion" | "item";
  id: string;
}>();

const emits = defineEmits<{
  (e: "drag-start", payload: any): void;
}>();

const { startMobileDrag, updateMobileDrag } = useMobileDrag();

/* DESKTOP */
function onDesktopDragStart(e: DragEvent) {
  if (!e.dataTransfer) return;

  const payload = {
    src: props.src,
    type: props.type,
    id: props.id,
  };

  // Tell parent something started dragging
  emits("drag-start", payload);

  // Desktop drag data
  e.dataTransfer.setData("application/json", JSON.stringify(payload));
  e.dataTransfer.effectAllowed = "move";
}

function onTouchStart(e: TouchEvent) {
  const touch = e.touches[0];

  const payload = {
    src: props.src,
    type: props.type,
    id: props.id,
  };

  emits("drag-start", payload);

  // Start the global mobile drag state
  startMobileDrag(payload, touch.clientX, touch.clientY);
}

function onTouchMove(e: TouchEvent) {
  const t = e.touches[0];
  updateMobileDrag(t.clientX, t.clientY);
}
</script>
