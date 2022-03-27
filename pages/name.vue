<script>
import { defineComponent } from "@nuxtjs/composition-api";
import Test from "../components/test.vue";

export default defineComponent({
  name: "Name",
  components: { Test },
  setup() {},
});
</script>

<template>
  <v-card>
    <Test />
  </v-card>
</template>