<template>
  <div>
    <span class="loader"></span>
  </div>
</template>

<style scoped>
.loader {
  top: 100px;
  width: 100px;
  height: 100px;
  border: 5px solid #fff;
  border-bottom-color: transparent;
  border-radius: 50%;
  position: absolute;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
