<style>
  .div-relative {
    position: relative;
    width: 100%;
  }

  .div-a {
    position: absolute;
    left: 38%;
    top: 20%;
    width: 350px;
    height: 100px
  }
</style>

<template>
  <div id="band" class="div-relative">
    <div class="div-a">
      <div style='margin-left: 10%'>
        <Icon type="logo-tux" size="60" style="margin-top:5%"></Icon>
        <p style="margin-left: 20%;margin-top: -10%;font-size: 20px">史蒂夫运维管理平台</p>
      </div>
      <br>
      <Card>
        <Tabs value="custom">
          <TabPane label="普通登陆" name="custom">
            <Form ref="formInline" :model="formInline" :rules="ruleInline" inline>
              <Form-item prop="user" style="width: 100%">
                <Input v-model="formInline.user" placeholder="Username">
                </Input>
              </Form-item>
              <Form-item prop="password" style="width: 100%">
                <Input type="password" v-model="formInline.password" placeholder="Password">
                </Input>
              </Form-item>
              <Form-item style="width: 100%">
                <Button type="primary" @click="authdata()" style="width: 100%" size="large">登录</Button>
                <p style="margin-left: 22%;margin-top: 2%">如需注册账号请联系平台管理员</p>
                <p style="margin-left: 5%;">2018 © Power By Ellis.Zhang And Raven.Zhao 使用chrome获得最佳体验</p>
              </Form-item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  </div>
</template>
<script>
    import axios from 'axios'
    import util from './libs/util'
    import ICol from '../node_modules/iview/src/components/grid/col.vue'
    //
    export default {
        components: {
            ICol
        },
        name: 'Login',
        data () {
            return {
                filtermenulist: {},
                formInline: {
                    user: '',
                    password: ''
                },
                ruleInline: {
                    user: [{
                        required: true,
                        message: '请填写用户名',
                        trigger: 'blur'
                    }],
                    password: [{
                        required: true,
                        message: '请填写密码',
                        trigger: 'blur'
                    },
                        {
                            type: 'string',
                            min: 6,
                            message: '密码长度不能小于6位',
                            trigger: 'blur'
                        }
                    ]
                }
            }
        },
        methods: {
            authdata () {
                axios.post(util.auth, {
                    'username': this.formInline.user,
                    'password': this.formInline.password
                })
                    .then(res => {
                        axios.defaults.headers.common['Authorization'] = 'sdf ' + res.data['token']
                        sessionStorage.setItem('user', this.formInline.user)
                        sessionStorage.setItem('sdf', `sdf ${res.data['token']}`)
                        util.setToken(`sdf ${res.data['token']}`)
                        this.getMenu()
                    })
                    .catch(error => {
                        util.err_notice('账号或者密码错误！！')
                        util.ajanxerrorcode(this, error)
                    })
            },
            getMenu () {
                axios.get(`${util.url}/me/`)
                    .then(res => {
                        if (res.data.code === 20000) {
                            for (var a of res.data.data.nav) {
                                for (var b in a) {
                                    if (a['show'] === true) {
                                        this.filtermenulist[a['key']] = 1
                                    }
                                    if (b === 'children') {
                                        for (var c of a[b]) {
                                            if (c['show'] === true) {
                                                this.filtermenulist[c['key']] = 1
                                            }
                                        }
                                    }
                                }
                            }
                            this.$store.state.filtermenulist = this.filtermenulist
                            this.$router.push({
                                name: 'home_index'
                            })
                        } else {
                            util.err_notice(res.data.msg)
                        }
                    }).catch(error => {
                    util.err_notice(error)
                })
            }
        },
        mounted () {
            window.particlesJS.load('band', '/static/particlesjs-config.json')
        }
    }
</script>
