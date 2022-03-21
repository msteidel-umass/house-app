<script>
import { defineComponent, ref } from "@nuxtjs/composition-api";
import Map from "../components/map.vue";

export default defineComponent({
  name: "UnitedStatesOverview",
  components: { Map },
  setup() {},
});
</script>

<template>
  <v-card>
    <Map />
  </v-card>
</template>