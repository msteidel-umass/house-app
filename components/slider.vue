<script>
import { defineComponent } from "@nuxtjs/composition-api";

export default defineComponent({
  name: "Slider",
  setup() {},
});
</script>

<template>
  <div>
    <v-slider class="slider" hint="Im a hint" max="50" min="-50"></v-slider>
  </div>
</template>

<style scoped>
.slider {
  width: 100%;
}
</style>
