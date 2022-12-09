<template>
    <div class="root"></div>
    </template>
    <script>
    import vSelect from "vue-select"
    export default {
        data () {
            return {
                states:["Massachusetts", "Maine"]
            }
        },
        components:{
            vSelect
        }
    }
    </script>
    (html comment removed:  Add "scoped" attribute to limit CSS to this component only )
    <style scoped>
    .root{
        margin: 0 auto;
        max-width: 600px;}
    </style>