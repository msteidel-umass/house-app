<script>
import { defineComponent } from "@nuxtjs/composition-api";
import Map from "../components/map.vue";

export default defineComponent({
  name: "Sample",
  components: { Map },
  setup() {
    console.log("sample page load");
  },
});
</script>

<template>
  <v-card>
    <Map />
  </v-card>
</template>