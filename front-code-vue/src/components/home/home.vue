<style lang="less">
  @import "./home.less";
  @import "../../styles/common.less";

  .fuc {
  }

  .fuc li {
    margin-top: 2%;
    margin-left: 15%;
  }

  .fuc h4 {
    margin-top: 2%;
    margin-left: 10%;
  }

  .fuc h3 {
  }
</style>
<template>
  <div class="home-main">
    <Row>
      <Col span="8">
        <Row>
          <Card>
            <Row type="flex" class="user-infor">
              <Col span="8">
                <Row class-name="made-child-con-middle" type="flex" align="middle">
                  <img class="avator-img" src="../../assets/avatar.png"/>
                </Row>
              </Col>
              <Col span="16" style="padding-left:6px;">
                <Row class-name="made-child-con-middle" type="flex" align="middle">
                  <div>
                    <b class="card-user-infor-name">{{username}}</b>
                    <p>欢迎使用史蒂夫蓝幺鸡运维平台</p>
                  </div>
                </Row>
              </Col>
            </Row>
            <div class="line-gray"></div>
            <Row class="margin-top-8">
              <Col span="8">
                <p class="notwrap">登陆时间:</p>
              </Col>
              <Col span="16" class="padding-left-8">{{time}}</Col>
            </Row>
          </Card>
        </Row>
        <Row class="margin-top-10">
          <Card style="height: 550px">
            <div slot="title" class="card-title">
              <Select v-model="proVal" @on-change="filterPro"  placeholder="请选择项目查看数据">
                <Option v-for="item in proList" :value="item.id" :key="item.name">{{ item.name }}</Option>
              </Select>
            </div>
            <chart-pie style="height: 550px;" :value="pieData" text="查看不同资源的数据" ref="pieEef"></chart-pie>
          </Card>
        </Row>
      </Col>
      <Col span="16" class-name="padding-left-5">
        <Row>
          <Col span="6">
            <infor-card id-name="user_created_count" :end-val="count.user" iconType="md-people"
                        color="#2d8cf0" intro-text="平台用户"></infor-card>
          </Col>
          <Col span="6" class-name="padding-left-5">
            <infor-card id-name="visit_count" :end-val="count.joblog" iconType="ios-create" color="#64d572" :iconSize="50"
                        intro-text="作业执行数"></infor-card>
          </Col>
          <Col span="6" class-name="padding-left-5">
            <infor-card id-name="collection_count" :end-val="count.sqllog" iconType="logo-buffer" color="#ffd572"
                        intro-text="数据库查询次数"></infor-card>
          </Col>
          <Col span="6" class-name="padding-left-5">
            <infor-card id-name="transfer_count" :end-val="count.cdn" iconType="md-infinite" color="#f25e43"
                        intro-text="CDN刷新数"></infor-card>
          </Col>
        </Row>
        <Row class="margin-top-10">
          <Col span="24">
            <Card>
              <p slot="title" class="card-title">
                <Icon type="md-walk" />
                您正在参与的工作流程
              </p>
              <div class="data-sourcefunc-row" style="height: 550px">
                <Table :loading="loading" border :columns="colums" :data="data1" stripe ref="selection"
                ></Table>
              </div>
            </Card>
          </Col>
        </Row>
      </Col>
    </Row>
  </div>
</template>

<script>
  import axios from 'axios'
  import util from '../../libs/util'
  import dataSourcePie from './components/dataSourcePie.vue'
  import inforCard from './components/inforCard.vue'
  import toDoListItem from './components/toDoListItem.vue'
  import ChartPie from './pie.vue'

  export default {
    components: {
      'chart-pie': ChartPie,
      dataSourcePie,
      inforCard,
      toDoListItem
    },
    data () {
      return {
        loading: false,
        colums: [
          {
            title: '工作ID',
            key: 'id',
            width: 80
          },
          {
            title: '工作流名称',
            key: 'name'
          },
          {
            title: '项目',
            key: 'project',
            render: (h, params) => {
              return h('div', [
                h('strong', params.row.project.name)
              ]);
            }
          },
          {
            title: '发起人',
            key: 'user',
            render: (h, params) => {
              return h('div', [
                h('strong', params.row.leader.name)
              ]);
            }
          },
          {
            title: '是否完成',
            key: 'complete',
            render: (h, params) => {
              let color = ''
              let text = ''
              if (params.row.complete === true) {
                color = 'success'
                text = '已完成'
              } else {
                if (params.row.status < 0) {
                  color = 'error'
                  text = '已关闭'
                } else {
                  color = 'warning'
                  text = '正在进行'
                }
              }
              return h('Tag', {
                props: {
                  color: color
                }
              }, text);
            }
          },
          {
            title: '创建时间',
            key: 'created_time'
          },
          {
            title: '操作',
            key: 'action',
            align: 'center',
            width: 100,
            render: (h, params) => {
              if (params.row.status > 0) {
                return h('div', [
                  h('Button', {
                    props: {
                      type: 'primary',
                      size: 'small'
                    },
                    on: {
                      click: () => {
                        this.runCall(params.index)
                      }
                    }
                  }, '查看')
                ]);
              } else {
                return h('div', '已关闭')
              }
            }
          }
        ],
        data1: [
        ],
        assets: {},
        proVal: '',
        proList: [],
        pieData: [
        ],
        cityList: [
          {
            value: 'New York',
            label: 'New York'
          }
        ],
        model1: '',
        toDoList: [{
          title: ''
        }],
        count: {
          cdn: 0,
          joblog: 0,
          sqllog: 0,
          user: 0
        },
        showAddNewTodo: false,
        newToDoItemValue: '',
        time: '',
        username: sessionStorage.getItem('user')
      }
    },
    methods: {
      runCall (vl) {
        this.$router.push({name: 'execWorkList', params: {result: this.data1[vl]}})
      },
      filterPro (vl) {
        let proChoose = []
         for (let pp of this.assets) {
              if (vl === pp[vl].key && pp[vl].count !== 0) {
                   proChoose.push({name: pp.project.name, value: pp[vl].count})
              }
         }
        this.pieData = proChoose
         this.$refs.pieEef.reloadData()
      },
      addNewToDoItem () {
        this.showAddNewTodo = true
      },
      addNew () {
        if (this.newToDoItemValue.length !== 0) {
          axios.post(`${util.url}/homedata/todolist/`, {
            'todo': this.newToDoItemValue
          })
            .then(() => {
              let vm = this
              this.toDoList.unshift({
                title: this.newToDoItemValue
              })
              setTimeout(function () {
                vm.newToDoItemValue = ''
              }, 200)
              this.showAddNewTodo = false
            })
            .catch(error => {
              util.err_notice(error)
            })
        } else {
          this.$Message.error('请输入待办事项内容')
        }
      },
      cancelAdd () {
        this.showAddNewTodo = false
        this.newToDoItemValue = ''
      },
      deltodo (val) {
      },
      gettodo () {
      },
      dataInit () {
          axios.get(`${util.url}/dashboard/`)
              .then(res => {
                  res.data.data.statistics['joblog'] = res.data.data.statistics['job-log']
                  res.data.data.statistics['sqllog'] = res.data.data.statistics['sql-log']
                  this.assets = res.data.data.assets
                  let proList = []
                  for (let dd in this.assets[0]) {
                       if (dd !== 'project') {
                          proList.push({id: dd, name: this.assets[0][dd].name})
                       }
                  }
                  this.proList = proList
                  // 默认选择第1个
                  this.filterPro('host')
                  this.proVal = 'host'
                  this.count = res.data.data.statistics
              })
      },
      workflowIng () {
        this.loading = true
        axios.get(`${util.wflowssh}/ongoing/`)
          .then(res => {
            if (res.data.code === 20000) {
              this.loading = false
              this.data1 = res.data.data
            } else {
              util.err_notice(res.data.msg)
            }1
          }).catch(error => {
          util.err_notice(error)
        })
      },
      getMeInit () {
        axios.get(`${util.url}/me/`)
          .then(res => {
            if (res.data.code === 20000) {
              this.time = res.data.data.last_login
            } else {
              util.err_notice(res.data.msg)
            }
          }).catch(error => {
          util.err_notice(error)
        })
      }
    },
    mounted () {
        this.dataInit()
        this.workflowIng()
        this.getMeInit()
       //  this.proinit()
    }
  }
</script>
