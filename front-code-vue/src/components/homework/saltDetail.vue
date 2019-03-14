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
  .demo-spin-col{
    height: 100px;
    position: relative;
    border: 1px solid #eee;
  }
  .demo-spin-icon-load{
    animation: ani-demo-spin 1s linear infinite;
  }
  @keyframes ani-demo-spin {
    from { transform: rotate(0deg);}
    50%  { transform: rotate(180deg);}
    to   { transform: rotate(360deg);}
  }
  @import '../../styles/common.less';
  @import '../Order/components/table.less';
</style>
<template>
  <div>
    <Row>
      <Card>
        <p slot="title">
          <Icon type="ios-redo"></Icon>
          详细执行记录
        </p>
        <Row>
          <Col class="demo-spin-col" span="24" v-if="ifcomplete === false">
            <Spin fix>
              <Icon type="ios-loading" size=60 class="demo-spin-icon-load"></Icon>
              <div>执行中,请稍后....</div>
            </Spin>
          </Col>
          <Col class="demo-spin-col" span="24" v-if="ifcomplete === true">
            <Spin fix>
              <Icon type="md-checkmark" size=60></Icon>
              <div>执行完成</div>
            </Spin>
          </Col>
        </Row>
        <br/>
        <Row>
          <Col span="24">

            <Table border :columns="columns1" :data="data1" stripe ref="selection"></Table>
          </Col>
        </Row>
      </Card>
    </Row>


  </div>
</template>


<script>
  import ICol from '../../../node_modules/iview/src/components/grid/col.vue'
  import util from '../../libs/util'
  import axios from 'axios'
  import expandRow from './table-expand.vue';
  export default {
    components: {
      ICol, expandRow
    },
    name: 'DataBaseDic',
    data () {
      return {
        workstatus: '',
        iconText: '',
        ifcomplete: false,
        allresult: '',
        loading: true,
        columns1: [
        {
          type: 'expand',
          width: 50,
          render: (h, params) => {
            return h(expandRow, {
              props: {
                row: params.row
              }
            })
          }
        },
        {
          title: 'ID',
          key: 'id',
          width: 90
        },
        {
          title: '功能名称',
          key: 'name',
          render: (h, params) => {
            if (params.row.action) {
              return h('div', [
                h('strong', params.row.action.name)
              ]);
            }
          }
        },
        {
          title: '执行模块',
          key: 'run_time',
          render: (h, params) => {
            if (params.row.action) {
              return h('div', [
                h('strong', params.row.action.func)
              ]);
            }
          }
        },
        {
            title: '模块参数',
            key: 'run_time',
            render: (h, params) => {
                if (params.row.action) {
                    return h('div', [
                        h('strong', params.row.action.args)
                    ]);
                }
            }
            },
            {
                title: '执行参数',
                key: 'run_time',
                render: (h, params) => {
                    if (params.row.action) {
                        return h('div', [
                            h('strong', params.row.clp)
                        ]);
                    }
                }
            },
            {
                title: 'pillar参数',
                key: 'run_time',
                render: (h, params) => {
                    if (params.row.action) {
                        return h('div', [
                            h('strong', JSON.stringify(params.row.pillar))
                        ]);
                    }
                }
            },
        {
          title: '运行时间',
          key: 'create_at'
        },
        {
          title: '完成时间',
          key: 'complete_at'
        },
        {
          title: '执行状态',
            width: 100,
          key: 'tasks',
          render: (h, params) => {
            if (params.row) {
              const row = params.row;
              var color
              var text
              if (params.row) {
                  color = row.status === 0 ? 'warning' : row.status === 1 ? 'success' : row.status === 2 ? 'danger' : 'warning';
                  text = row.status === 0 ? '正在执行' : row.status === 1 ? '执行成功' : row.status === 2 ? '执行失败' : '正在执行';
              }
              if (row.status === 1) {
                this.loading = false
              }
              return h('div', [
                  h('Button', {
                      props: {
                          type: color,
                          size: 'small'
                      }
                  }, text)
              ]);
            }
          }
        },
         {
             title: '',
             key: 'completererw',
             render: (h, params) => {
                 if (params.row.status === 0) {
                     return h('Spin', {})
                 } else if (params.row.status === 1) {
                     return h('i', {
                         class: 'ivu-icon ivu-icon-checkmark'
                     })
                 } else if (params.row.status === 2) {
                     return h('i', {
                         class: 'ivu-icon ivu-icon-close'
                     })
                 } else {
                     return h('i', {
                         class: 'ivu-icon ivu-icon-ionic'
                     })
                 }
             }
          }
        ],
        data1: [],
        showTimeInterval: ''
      }
    },
    methods: {
      reflashStatus () {
        this.getResult()
      },
      getResult () {
        axios.get(`${util.url}/job/log/${this.allresult.id}/`)
          .then(res => {
            this.data1 = res.data.data.tasks
              if (res.data.data.complete_at) {
                  this.ifcomplete = true
              }
          }).catch(error => {
          util.err_notice(error)
        })
      },
        Aqw  () {
            this.showTimeInterval = setInterval(() => {
                if (!this.ifcomplete) {
                    this.Bqw();
                }
            }, 2000)
        },
        Bqw () {
            this.getResult()
        }
    },
    mounted () {
      this.allresult = JSON.parse(localStorage.getItem('currentHomeworkId'))
      if (this.allresult.complete_at) {
         this.ifcomplete = true
      }
      this.data1 = this.allresult.tasks
      this.getResult()
      this.Aqw()
    },
    beforeDestroy () {
        clearInterval(this.showTimeInterval)
    }
  }
</script>
