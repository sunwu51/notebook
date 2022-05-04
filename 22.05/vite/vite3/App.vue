<script>
export default {
  data(){
    return {count: 0}
  },
  methods: {
    increse(){
      this.count ++;
    },
  }
}
</script>

<template>
  <div>
    {{ count }}<button @click="increse">+</button>
  </div>
</template>