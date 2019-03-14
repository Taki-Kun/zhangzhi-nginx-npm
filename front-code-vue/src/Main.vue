<style lang="less">
  .main-header .header-avator-con .user-dropdown-innercon {
    height: 100% !important;
    padding-right: 12px !important;
  }
  .ivu-menu-dark {
    background: #495060 !important;
  }
  @import "./main.less";
</style>
<template>
  <div id="main" class="main" :class="{'main-hide-text': hideMenuText}">
    <div class="sidebar-menu-con" v-if="$store.state.filtermenulist.length !== 0"
         :style="{width: hideMenuText?'60px':'200px', overflow: hideMenuText ? 'visible' : 'auto', background: $store.state.menuTheme === 'dark'?'#495060':'white'}">
      <!--<div class="logo-con">
      </div>-->
      <sidebar-menu v-if="!hideMenuText" :menuList="menuList" :iconSize="14"/>
      <sidebar-menu-shrink :icon-color="menuIconColor" v-else :menuList="menuList"/>
    </div>
    <div class="main-header-con" :style="{paddingLeft: hideMenuText?'60px':'200px'}">
      <div class="main-header">
        <div class="navicon-con">
          <Button :style="{transform: 'rotateZ(' + (this.hideMenuText ? '-90' : '0') + 'deg)'}" type="text"
                  @click="toggleClick">
            <Icon type="md-menu" size="32"></Icon>
          </Button>
        </div>
        <div class="header-middle-con">
          <div class="main-breadcrumb">
            <breadcrumb-nav :currentPath="currentPath"></breadcrumb-nav>
          </div>
        </div>
        <div class="header-avator-con">
          <a @click="getc = true">赞赏</a>
          <Modal
                  v-model="getc"
                  title="赞赏运维开发工程师"
                  width="640">
            <h3>让运维开发和运维人员持续提供更好的功能与服务。</h3>
            <br>
            <img height="300" width="300" src="./assets/wechat.jpg"/>
            <img height="300" width="300" src="./assets/wechat2.png"/>
          </Modal>
          <Poptip trigger="hover" title="请选择链接跳转" content="content" placement="bottom-end" width="800">
            <a>快捷跳转</a>
            <div class="api" slot="content">
                <Row>
                  <Col span="6" v-for="item in linkList">
                    <Card>
                      <a style="color:black" @click="linkAction('edit', item)">
                        <Icon type="md-list" />
                      </a>
                          <a :href="item.link" target="_blank">{{item.name}}</a>
                    </Card>
                  </Col>
                  <Col span="6">
                    <Card>
                      <a @click="linkAction('add')"><Icon type="md-add-circle" size="18"/>&nbsp添加快捷方式</a>
                    </Card>
                  </Col>
                </Row>
              <Modal
                :title="linkText"
                v-model="modal10"
                class-name="vertical-center-modal"
                width="700">
                <Form :model="formItem" :label-width="80">
                  <FormItem label="名称">
                    <Input v-model="formItem.name" placeholder="请输入名称..."></Input>
                  </FormItem>
                  <FormItem label="链接">
                    <Input v-model="formItem.link" placeholder="请输入链接..."></Input>
                  </FormItem>
                </Form>
                <div slot="footer">
                  <Button type="error" @click="removeLink" :disabled="iflinkAdd">移除</Button>
                  <Button type="primary" @click="sumLink">提交</Button>
                </div>
              </Modal>
            </div>
          </Poptip>
          <div @click="handleFullScreen" v-if="showFullScreenBtn" class="full-screen-btn-con">
            <Tooltip :content="isFullScreen ? '退出全屏' : '全屏'" placement="bottom">
              <Icon :type="isFullScreen ? 'ios-contract' : 'ios-expand'" :size="23"></Icon>
            </Tooltip>
          </div>
          <div @click="lockScreen" class="lock-screen-btn-con">
            <Tooltip content="锁屏" placement="bottom">
              <Icon type="md-lock" :size="20"></Icon>
            </Tooltip>
          </div>
          <div @click="showMessage" class="message-con">
            <Tooltip :content="messageCount > 0 ? '有' + messageCount + '条未读消息' : '无未读消息'" placement="bottom">
              <Badge :count="messageCount" dot>
                <Icon type="md-notifications" :size="22"></Icon>
              </Badge>
            </Tooltip>
          </div>
          <div class="switch-theme-con">
            <Row class="switch-theme" type="flex" justify="center" align="middle">
              <theme-dropdown-menu></theme-dropdown-menu>
            </Row>
          </div>
          <div class="user-dropdown-menu-con">
            <Row type="flex" justify="end" align="middle" class="user-dropdown-innercon">
              <Dropdown trigger="click" @on-click="handleClickUserDropdown">
                <a href="javascript:void(0)">
                  <span class="main-user-name">{{ userName }}</span>
                  <Icon type="md-arrow-dropdown"></Icon>
                </a>
                <DropdownMenu slot="list">
                  <DropdownItem name="ownSpace">个人中心</DropdownItem>
                  <DropdownItem name="loginout" divided>退出登录</DropdownItem>
                </DropdownMenu>
              </Dropdown>
              <Avatar :src="avatorPath" style="background: #ffffff;margin-left: 10px;"></Avatar>
            </Row>
          </div>
        </div>
      </div>
      <div class="tags-con">
        <tags-page-opened :pageTagsList="pageTagsList"></tags-page-opened>
      </div>
    </div>
    <div class="single-page-con" :style="{paddingLeft: hideMenuText?'60px':'200px'}">
      <div class="single-page">
        <template
                v-if="$route.name === 'management-user'
        || $route.name === 'management-project'
        || $route.name === 'management-game'
        || $route.name === 'management-host'
        ">
          <keep-alive>
            <router-view></router-view>
          </keep-alive>
        </template>
        <template v-else>
          <router-view></router-view>
        </template>
      </div>
    </div>
  </div>
</template>
<script>
    import sidebarMenu from './main_components/sidebarMenu.vue'
    import tagsPageOpened from './main_components/tagsPageOpened.vue'
    import breadcrumbNav from './main_components/breadcrumbNav.vue'
    import themeDropdownMenu from './main_components/themeDropdownMenu.vue'
    import sidebarMenuShrink from './main_components/sidebarMenuShrink.vue'
    import axios from 'axios'
    // ;
    import util from './libs/util.js'

    export default {
        components: {
            sidebarMenu,
            tagsPageOpened,
            breadcrumbNav,
            themeDropdownMenu,
            sidebarMenuShrink
        },
        data () {
            return {
              linkList: [],
              formItem: {
                id: '',
                link: '',
                name: ''
              },
              linkText: '增加快捷方式',
              iflinkAdd: false,
                modal10: false,
                spanLeft: 4,
                spanRight: 20,
                currentPageName: '',
                hideMenuText: false,
                userName: sessionStorage.getItem('user'),
                showFullScreenBtn: window.navigator.userAgent.indexOf('MSIE') < 0,
                isFullScreen: false,
                lockScreenSize: 0,
                avatorPath: 'https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=3592051691,2745663905&fm=26&gp=0.jpg',
                getc: false,
                statement: false,
                filtermenulist: {
                }
            }
        },
        computed: {
            menuList () {
                return this.$store.state.menuList
            },
            pageTagsList () {
                return this.$store.state.pageOpenedList // 打开的页面的页面对象
            },
            currentPath () {
                return this.$store.state.currentPath // 当前面包屑数组
            },
            menuIconColor () {
                return this.$store.state.menuTheme === 'dark' ? 'white' : '#495060'
            },
            messageCount () {
                return this.$store.state.messageCount
            }
        },
        methods: {
              linkAction (action, editStr = null) {
                this.modal10 = true
                if (action === 'add') {
                  this.iflinkAdd = true
                  this.linkText = '增加快捷方式'
                  this.formItem = {link: '', name: ''}
                } else {
                  this.iflinkAdd = false
                  this.linkText = '修改快捷方式'
                  this.formItem = editStr
                }
             },
             sumLink () {
               // console.log(this.formItem, 1111111111111111111111111111111111)
               axios.post(`${util.url}/site/edit/`, this.formItem)
                 .then(res => {
                   if (res.data.code === 20000) {
                     this.$Message.info('操作成功')
                     this.modal10 = false
                     this.getlinkList()
                   } else {
                     util.err_notice(res.data.msg)
                   }
                 }).catch(error => {
                 util.err_notice(error)
               })
             },
            // 导航栏收缩
            toggleClick () {
                this.hideMenuText = !this.hideMenuText
            },
            // 个人中心
            handleClickUserDropdown (name) {
                if (name === 'ownSpace') {
                    util.openPage(this, 'ownspace_index', '个人中心')
                } else if (name === 'loginout') {
                    // 退出登录
                    localStorage.clear()
                    sessionStorage.clear()
                    util.removeToken()
                    this.$router.push({
                        name: 'login'
                    })
                }
            },
            // 全屏
            handleFullScreen () {
                let main = document.body
                if (this.isFullScreen) {
                    if (document.exitFullscreen) {
                        document.exitFullscreen()
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen()
                    } else if (document.webkitCancelFullScreen) {
                        document.webkitCancelFullScreen()
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen()
                    }
                } else {
                    if (main.requestFullscreen) {
                        main.requestFullscreen()
                    } else if (main.mozRequestFullScreen) {
                        main.mozRequestFullScreen()
                    } else if (main.webkitRequestFullScreen) {
                        main.webkitRequestFullScreen()
                    } else if (main.msRequestFullscreen) {
                        main.msRequestFullscreen()
                    }
                }
            },
            // 消息中心
            showMessage () {
                util.openPage(this, 'message_index', '消息中心')
            },
            // 锁屏
            lockScreen () {
                let lockScreenBack = document.getElementById('lock_screen_back')
                lockScreenBack.style.transition = 'all 3s'
                lockScreenBack.style.zIndex = 10000
                lockScreenBack.style.boxShadow = '0 0 0 ' + this.lockScreenSize + 'px #667aa6 inset'
                this.showUnlock = true
                this.$store.commit('lock')
                sessionStorage.setItem('last_page_name', this.$route.name) // 本地存储锁屏之前打开的页面以便解锁后打开
                setTimeout(() => {
                    lockScreenBack.style.transition = 'all 0s'
                    this.$router.push({
                        name: 'locking'
                    })
                }, 800)
            },
            init () {
                // 全屏相关
                document.addEventListener('fullscreenchange', () => {
                    this.isFullScreen = !this.isFullScreen
                })
                document.addEventListener('mozfullscreenchange', () => {
                    this.isFullScreen = !this.isFullScreen
                })
                document.addEventListener('webkitfullscreenchange', () => {
                    this.isFullScreen = !this.isFullScreen
                })
                document.addEventListener('msfullscreenchange', () => {
                    this.isFullScreen = !this.isFullScreen
                })
                // 锁屏相关
                let lockScreenBack = document.getElementById('lock_screen_back')
                let x = document.body.clientWidth
                let y = document.body.clientHeight
                let r = Math.sqrt(x * x + y * y)
                let size = parseInt(r)
                this.lockScreenSize = size
                window.addEventListener('resize', () => {
                    let x = document.body.clientWidth
                    let y = document.body.clientHeight
                    let r = Math.sqrt(x * x + y * y)
                    let size = parseInt(r)
                    this.lockScreenSize = size
                    lockScreenBack.style.transition = 'all 0s'
                    lockScreenBack.style.width = lockScreenBack.style.height = size + 'px'
                })
                lockScreenBack.style.width = lockScreenBack.style.height = size + 'px'
                // 问候信息相关
                if (!sessionStorage.getItem('hasGreet')) {
                    let now = new Date()
                    let hour = now.getHours()
                    let greetingWord = {
                        title: '',
                        words: ''
                    }
                    let userName = sessionStorage.getItem('user')
                    if (hour < 6) {
                        greetingWord = {
                            title: '凌晨好~' + userName,
                            words: '早起的鸟儿有虫吃~'
                        }
                    } else if (hour >= 6 && hour < 9) {
                        greetingWord = {
                            title: '早上好~' + userName,
                            words: '来一杯咖啡开启美好的一天~'
                        }
                    } else if (hour >= 9 && hour < 12) {
                        greetingWord = {
                            title: '上午好~' + userName,
                            words: '工作要加油哦~'
                        }
                    } else if (hour >= 12 && hour < 14) {
                        greetingWord = {
                            title: '中午好~' + userName,
                            words: '午饭要吃饱~'
                        }
                    } else if (hour >= 14 && hour < 17) {
                        greetingWord = {
                            title: '下午好~' + userName,
                            words: '下午也要活力满满哦~'
                        }
                    } else if (hour >= 17 && hour < 19) {
                        greetingWord = {
                            title: '傍晚好~' + userName,
                            words: '下班没事问候下爸妈吧~'
                        }
                    } else if (hour >= 19 && hour < 21) {
                        greetingWord = {
                            title: '晚上好~' + userName,
                            words: '工作之余品一品书香吧~'
                        }
                    } else {
                        greetingWord = {
                            title: '深夜好~' + userName,
                            words: '夜深了，注意休息哦~'
                        }
                    }
                    this.$Notice.config({
                        top: 130
                    })
                    this.$Notice.info({
                        title: greetingWord.title,
                        desc: greetingWord.words,
                        duration: 4,
                        name: 'greeting'
                    })
                    sessionStorage.setItem('hasGreet', 1)
                }
            },
          getlinkList () {
            axios.get(`${util.url}/site/list/`)
              .then(res => {
                if (res.data.code === 20000) {
                  this.linkList = res.data.data
                } else {
                  util.err_notice(res.data.msg)
                }
              }).catch(error => {
              util.err_notice(error)
            })
          },
          removeLink () {
            axios.get(`${util.url}/site/delete/?id=${this.formItem.id}`)
              .then(res => {
                if (res.data.code === 20000) {
                  this.modal10 = false
                  this.$Message.info('操作成功')
                  this.getlinkList()
                } else {
                  util.err_notice(res.data.msg)
                }
              }).catch(error => {
              util.err_notice(error)
            })
          }
        },
        mounted () {
            this.$store.commit('Breadcrumbset', this.$route.matched[1].name)
            this.$store.state.currentPageName = this.$route.matched[1].name
            if (localStorage.getItem('pageOpenedList')) {
                this.$store.state.pageOpenedList = JSON.parse(localStorage.getItem('pageOpenedList'))
            } else {
                this.$store.state.pageOpenedList = [{
                    title: '首页',
                    path: '',
                    name: 'home_index'
                }]
            }
            this.getlinkList()
        },
        created () {
            // 权限菜单过滤相关
            this.$store.commit('Menulist')
            axios.defaults.headers.common['Authorization'] = sessionStorage.getItem('sdf')
            axios.get(`${util.url}/me/`)
                .then(res => {
                    if (res.data.code === 20000) {
                        sessionStorage.setItem('user', res.data.data.username)
                        this.avatorPath = res.data.data.avatar ? res.data.data.avatar : this.avatorPath
                        this.userName = res.data.data.username
                        this.init()
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
                    } else {
                        util.err_notice(res.data.msg)
                    }
                }).catch(error => {
                util.err_notice(error)
            })
        }
    }
</script>
