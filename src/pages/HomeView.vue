<template>
  <main>
    HomeView
  </main>
</template>
<script setup lang="ts">
import { healthUsingGet } from '@/api/mainController'

healthUsingGet().then((res) => {
  console.log(res)
})
</script>
