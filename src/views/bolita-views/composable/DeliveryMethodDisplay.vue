<template>
  <div>
    {{ deliveryMethod
    }}<span v-if="deliveryMethod == DeliveryMethod.Others">| {{ otherDeliveryName }}</span>
  </div>
</template>

<script setup lang="ts">
  import { DeliveryMethod } from '@/api/dataLayer/modules/deliveryMethod';

  interface Props {
    deliveryMethod?: DeliveryMethod;
    otherDeliveryName?: string;
  }
  defineProps<Props>();
</script>

<style scoped></style>
