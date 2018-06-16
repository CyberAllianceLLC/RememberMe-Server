<template>
  <div class="verify-email">
    <!-- Body -->
    <div class="row justify-content-center">
      <div class="col-md-6 center-height">
        <div class="card">
          <div class="card-body">
            <div class="card-title text-center text-dark">
              <h3><i class="material-icons">email</i></h3>
              <h2>Verify Email</h2>
              <p class="text-muted">Please confirm this email is correct:<br><b>{{email}}</b></p>
            </div>
            <button @click="verifyEmail" class="btn btn-primary btn-block">Verify</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios';

  export default {
    data() {
      return {
        isLoading: false,
        user_id: decodeURIComponent(this.$route.params['user_id']),
        recovery_key: decodeURIComponent(this.$route.params['recovery_key']),
        email: decodeURIComponent(this.$route.params['email'])
      };
    },
    methods: {
      verifyEmail: function () {
        if (!this.isLoading) {
          this.isLoading = true;
          axios.post('/api/verifyNewEmail', {
            user_id: this.user_id,
            recovery_key: this.recovery_key,
            new_email: this.email
          }).then((data) => {
            if (data.data.success === false) {
              throw data.data.response;
            }
            this.isLoading = false;
            this.$router.replace('/');
          }).catch((error) => {
            this.isLoading = false;
          });
        }
      }
    }
  }
</script>

<style lang="less">
  .verify-email {
    .material-icons {
      font-size: 72px;
    }
    .center-height {
      transform: translateY(50%);
    }
  }
</style>