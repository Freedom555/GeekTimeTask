import HelloWorld from './helloWorld.vue'
import Vue from 'Vue';

new Vue({
  el: "#app",
  render: h => h(HelloWorld)
});
