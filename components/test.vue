<script>
import { defineComponent, ref } from "@nuxtjs/composition-api";

export default defineComponent({
  name: "Test",
  setup() {
    const myname = ref("Joe");

    return {
      myname,
    };
  },
});
</script>

<template>
  <p>
    {{ myname }}
  </p>
</template>