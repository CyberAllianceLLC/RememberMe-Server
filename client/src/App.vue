<template>
  <div>
    <!-- Header -->
    <div class="header container">
      <div class="row justify-content-center">
        <div class="col-md-10">
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="container">
      <router-view :key="$route.fullPath"></router-view>
    </div>

    <!-- Footer -->
    <div class="footer container">
      <div class="row justify-content-center">
        <div class="col-md-10">
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less">

  @import (css) url("https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css");
  @import (css) url("https://fonts.googleapis.com/css?family=Roboto:100,200,300,400,500,600,700");
  @import (css) url("https://fonts.googleapis.com/icon?family=Material+Icons");
  // @import (css) url("https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css");

  body {
    font-family: 'Roboto', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #3a96c8;
  }
</style>
