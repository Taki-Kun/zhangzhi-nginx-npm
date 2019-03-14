<style lang="less">
  .word {
    font-size: 14px;
    width: 100%;
    word-wrap: break-word;
    word-break: break-all;
    height: 500px;
    overflow: auto;
  }
  a:hover {
    color: #ff9900;
  }
  a:active {
    color: #ff6600;
  }
  .edittable-self-con {
    height: 100%;
  }
  @import '../../styles/common.less';
  @import '../Order/components/table.less';
</style>
<template>
  <div>
    <Row>
      <Card>
        <div slot="title">
          <Row>
          <Col span="2">
              <i-button type="primary" @click="adduser"><Icon type="person-add"></Icon>&nbsp添加用户</i-button>
          </Col>
          <Col span="4" offset="16">
            <Input v-model="searchCol">
              <span slot="prepend"><Icon type="search"></Icon></span>
            </Input>
          </Col>
          <Col span="2">
            <Button type="default" @click="searchTable">查询</Button>
          </Col>
          </Row>
        </div>
        <Row>
          <Col span="24">

            <Table border :columns="colums" :data="data1" stripe ref="selection"></Table>
            <br>
            <Page :total="totalPage" show-total show-elevator @on-change="changePage"></Page>

          </Col>
        </Row>
      </Card>
    </Row>

    <Modal v-model="userInfodModal" :width="800" @on-ok="actionUser">
      <h3 slot="header" style="color:#2D8CF0">用户信息修改</h3>
      <Form :model="userObj" :label-width="120" label-position="right">
        <FormItem label="名称:">
          <Input v-model='userObj.name' placeholder="请输入名称"></Input>
        </FormItem>
        <hr style="height:1px;border:none;border-top:1px dashed #dddee1;"/>
        <br>
        <FormItem label="用户名:">
          <Input v-model='userObj.username' placeholder="请输入用户名"></Input>
        </FormItem>
        <hr style="height:1px;border:none;border-top:1px dashed #dddee1;"/>
        <br>

        <FormItem label="密码:">
          <Input type="password" v-model='userObj.password' placeholder="请输入密码"></Input>
        </FormItem>
        <hr style="height:1px;border:none;border-top:1px dashed #dddee1;"/>
        <br>
        <FormItem label="电话:">
          <Input v-model='userObj.telephone' placeholder="请输入电话"></Input>
        </FormItem>
        <hr style="height:1px;border:none;border-top:1px dashed #dddee1;"/>
        <br>
        <FormItem label="邮箱:">
          <Input v-model='userObj.email' placeholder="请输入邮箱"></Input>
        </FormItem>
        <hr style="height:1px;border:none;border-top:1px dashed #dddee1;"/>
        <br>
        <FormItem label="所属组:">
          <Select v-model="userObj.groups" filterable multiple>
            <Option v-for="group in groupList" :value="group.id" :key="group.id">{{group.project.name}}《===》{{ group.name }}</Option>
          </Select>
        </FormItem>
        <hr style="height:1px;border:none;border-top:1px dashed #dddee1;"/>
        <br>
      </Form>
    </Modal>

  </div>
</template>



<script>
  import ICol from '../../../node_modules/iview/src/components/grid/col.vue'
  import util from '../../libs/util'
  import axios from 'axios'
  export default {
    components: {
      ICol
    },
    name: 'DataBaseDic',
    data () {
      return {
        searchCol: '',
        allsearchdata: [],
        totalPage: 1,
        groupList: [],
        userInfodModal: false,
        name: '',
        userObj: {
          id: '',
          name: '',
          username: '',
          telephone: '',
          email: '',
          groups: [],
          password: ''
        },
        userDefaultObj: {
          id: '',
          name: '',
          username: '',
          telephone: '',
          email: '',
          groups: [],
          password: ''
        },
        colums: [
          {
            title: 'id',
            key: 'id'
          },
          {
            title: '名称',
            key: 'name'
          },
          {
            title: '用户名',
            key: 'username'
          },
          {
            title: '邮箱',
            key: 'email'
          },
          {
            title: '电话',
            key: 'telephone'
          },
          {
            title: 'Action',
            key: 'action',
            width: 150,
            align: 'center',
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.show(params.index)
                    }
                  }
                }, '详情'),
                h('Button', {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.remove(params.index)
                    }
                  }
                }, '删除')
              ]);
            }
          }
        ],
        data1: []
      }
    },
    methods: {
      changePage (page) {
        console.log(page)
        this.data1 = this.allsearchdata.slice(page * 10 - 10, page * 10)
      },
      show (index) {
        axios.get(`${util.url}/user/${this.data1[index].id}/`)
          .then(res => {
            if (res.data.code === 20000) {
              this.userObj = res.data.data
              this.userObj.groups = res.data.data.group_ids
              this.userInfodModal = true
            } else {
               util.err_notice(res.data.msg)
            }
          }).catch(error => {
          util.ajanxerrorcode(this, error)
        })
      },
      remove (index) {
        this.$Modal.confirm({
          title: '删除提醒',
          content: '<p>是否删除【' + this.data1[index].name + '】</p>',
          onOk: () => {
            axios.post(`${util.url}/delete/`, {'resource': 'user', 'id': this.data1[index].id}).then(res => {
              if (res.data.code === 20000) {
                this.data1.splice(index, 1);
                this.$Message.info('删除成功');
              } else {
                util.err_notice(res.data.msg)
              }
            }).catch(error => {
              util.ajanxerrorcode(this, error)
            })
          }
        });
      },
      actionUser () {
        this.userObj['pswd'] = this.userObj.password
        axios.post(`${util.url}/user/edit/`, this.userObj)
          .then(res => {
            if (res.data.code === 20000) {
                let permissGroup = {}
                permissGroup.priv_groups = this.userObj.groups
                this.setUserPermiss(permissGroup, res.data.data.id)
            } else {
              util.err_notice(res.data.msg)
            }
          }).catch(error => {
          util.ajanxerrorcode(this, error)
        })
      },
      adduser () {
        this.userObj = this.userDefaultObj
        this.userInfodModal = true
      },
      userinit (values = this.searchCol) {
          if (values.length !== 0) {
              var searchValue = `?q=${values}`
          } else {
              searchValue = ''
          }
        axios.get(`${util.url}/users/${searchValue}`)
          .then(res => {
            this.allsearchdata = res.data.data.reverse()
            this.totalPage = res.data.data.length
            this.data1 = this.allsearchdata.slice(0, 10)
          }).catch(error => {
          util.ajanxerrorcode(this, error)
        })
      },
      setUserPermiss (permissGroup, userid) {
        axios.post(`${util.url}/user/${userid}/privileges/edit/`, permissGroup)
          .then(res => {
             if (res.data.code === 20000) {
               this.userinit()
               this.$Message.info('操作成功')
             } else {
                 util.err_notice(res.data.msg)
             }
        }).catch(error => {
          util.ajanxerrorcode(this, error)
        })
      },
      searchTable () {
          // console.log(this.searchCol)
          this.userinit(this.searchCol)
      }
    },
    mounted () {
      this.userinit()
      axios.get(`${util.url}/priv_groups/`)
        .then(res => {
          this.groupList = res.data.data
        }).catch(error => {
        util.ajanxerrorcode(this, error)
      })
    }
  }
</script>
