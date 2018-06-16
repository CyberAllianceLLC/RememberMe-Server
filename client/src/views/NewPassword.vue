<template>
  <div class="new-password">
    <!-- Body -->
    <div class="row justify-content-center">
      <div class="col-md-6 center-height">
        <div class="card">
          <div class="card-body">
            <div class="card-title text-center text-dark">
              <h3><i class="material-icons">lock</i></h3>
              <h2>Password Reset</h2>
              <p class="text-muted">Please enter your new password here.</p>
            </div>
            <form @submit.prevent="newPassword()">
              <div class="form-group">
                <input v-model="password" minlength="6" class="form-control"
                       name="password" type="password" placeholder="New Password">
              </div>
              <div class="col">
                <button type="submit" class="btn btn-primary btn-block">Submit</button>
              </div>
            </form>
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
        password: '',
        user_id: decodeURIComponent(this.$route.params['user_id']),
        recovery_key: decodeURIComponent(this.$route.params['recovery_key'])
      }
    },
    methods: {
      newPassword: function () {
        if (!this.isLoading) {
          this.isLoading = true;
          axios.post('/api/verifyRecoveryEmail', {
            user_id: this.user_id,
            recovery_key: this.recovery_key,
            new_password: this.password
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
  .new-password {
    .material-icons {
      font-size: 72px;
    }
    .center-height {
      transform: translateY(50%);
    }
  }
</style>