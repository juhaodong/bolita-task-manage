<template>
  <div>
    {{ deliveryMethod
    }}<span v-if="deliveryMethod == DeliveryMethod.Others">| {{ otherDeliveryName }}</span>
  </div>
</template>

<script setup lang="ts">
  import { DeliveryMethod } from '@/api/deliveryMethod';

  interface Props {
    deliveryMethod?: DeliveryMethod;
    otherDeliveryName?: string;
  }
  const props = defineProps<Props>();
</script>

<style scoped></style>
