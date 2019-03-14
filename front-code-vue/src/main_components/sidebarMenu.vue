<style>
  .Menu span {
    color: #ffffff;
    font-weight: bold;
    margin-left: 10%;
  }

  .MenuIcon {
    margin-left: 10%;
    margin-top: 0.1%;
    color: #5cadff;
  }
</style>
<template>
  <Menu width="auto" :theme="theme" @on-select="currentPageTab" :active-name="currentPageName" accordion>
    <MenuItem name="main">
      <img width="160" height="60" src="../assets/comlogo.png"/>
    </MenuItem>
    <MenuItem name="home_index">
      <Icon type="md-home" :size="iconSize"></Icon>
      <span class="layout-text">首页</span>
    </MenuItem>
    <template v-for="item in menuList">
      <Submenu v-if="item.children.length>=1 && item.name !== 'main' && $store.state.filtermenulist[item.name] === 1" :name="item.name" :key="item.path">
        <template slot="title">
          <Icon :type="item.icon" :size="iconSize"></Icon>
          <span class="layout-text">{{ item.title }}</span>
        </template>
        <template v-for="child in item.children">
          <template v-if="$store.state.filtermenulist[child.name] === 1">
            <MenuItem :name="child.name" :key="child.name" style="margin-left: -5%">
              <Icon :type="child.icon" :size="iconSize" :key="child.name"></Icon>
              <span class="layout-text" :key="child.name + 1">{{ child.title }}</span>
            </MenuItem>
          </template>
        </template>
      </Submenu>
     </template>
   <!--<Submenu name="3">
      <template slot="title">
        <Icon type="ios-cart-outline" :size="iconSize"></Icon>
        <span class="layout-text">购买机器</span>
      </template>
      <template>
        <MenuItem name="host-conf">
          <Icon type="md-cog" :size="iconSize"></Icon>
          <span class="layout-text">机器配置</span>
        </MenuItem>
      </template>
      <template>
        <MenuItem name="host-order">
          <Icon type="logo-freebsd-devil" :size="iconSize"></Icon>
          <span class="layout-text">申请机器</span>
        </MenuItem>
      </template>
      <template>
        <MenuItem name="host-deal">
          <Icon type="md-paper"  :size="iconSize"></Icon>
          <span class="layout-text">工单审核</span>
        </MenuItem>
      </template>
    </Submenu>-->
  <!--  <Submenu name="3">
   <template slot="title">
     <Icon type="ios-cart-outline" :size="iconSize"></Icon>
     <span class="layout-text">灰度新品</span>
   </template>
   <template>
     <MenuItem name="action-type">
       <Icon type="md-paper"  :size="iconSize"></Icon>
       <span class="layout-text">动作类型</span>
     </MenuItem>
   </template>
 </Submenu>-->
    <Menu-item name="login">
      <Icon type="md-log-out" :size="iconSize"></Icon>
      <span class="layout-text">退出</span>
    </Menu-item>
  </Menu>
</template>
<script>
  //
  import util from '../libs/util'
  // import axios from 'axios'

  export default {
    name: 'sidebarMenu',
    props: {
      menuList: Array,
      iconSize: Number
    },
    data () {
      return {
        // filtermenulist: {
        // }
      }
    },
    computed: {
      theme () {
        return this.$store.state.menuTheme
      },
      currentPageName () {
        return this.$store.state.currentPageName
      }
    },
    methods: {
      currentPageTab (val) {
        if (val === 'login') {
          localStorage.clear()
          sessionStorage.clear()
          this.$router.push({
            name: 'login'
          })
        } else {
          util.openPage(this, val)
        }
      }
    },
   created () {
       // this.filtermenulist = this.$store.state.filtermenulist
       // console.log(this.$store.state.filtermenulist, 1111111)
    }
  }
</script>
