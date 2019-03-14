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
        <p slot="title">
             <Icon type="ios-paper-outline"></Icon>&nbsp工作流列表
        </p>
        <Row>
          <Col span="24">

            <Table :loading="loading" border :columns="colums" :data="data1" stripe ref="selection"
            ></Table>
            <br>
            <Page :total="totalPage" show-total show-elevator @on-change="changePage"></Page>

            <Spin fix v-if="workStart">
              <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
              <div>准备发起...</div>
            </Spin>
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
  export default {
    components: {
      ICol
    },
    name: 'DataBaseDic',
    data () {
      return {
       copyTip: '',
       copyResult: {},
       workStart: false,
       loading: false,
       totalPage: 0,
       modal1: false,

       colums: [
          {
            title: '工作ID',
            key: 'id',
           width: 100
          },
          {
            title: '工作流名称',
            key: 'name'
          },
           {
               title: '创建人',
               key: 'user',
               render: (h, params) => {
                   return h('div', [
                       h('strong', params.row.creator.name)
                   ]);
               }
           },
           {
               title: '创建时间',
               key: 'created_time'
           },
            {
              title: '可用',
              key: 'can_do',
              render: (h, params) => {
                const color = params.row.can_do ? 'success' : 'error';
                const text = params.row.can_do ? '可用' : '不可用';

                return h('Tag', {
                  props: {
                    type: 'dot',
                    color: color
                  }
                }, text);
              }
            },
          {
            title: '操作',
            key: 'action',
            width: 250,
            align: 'center',
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    type: 'default',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.copy(params.row)
                    }
                  }
                }, '拷贝'),
                  h('Button', {
                      props: {
                          type: 'info',
                          size: 'small'
                      },
                      style: {
                          marginRight: '5px'
                      },
                      on: {
                          click: () => {
                              this.show(params.row)
                          }
                      }
                  }, '发起'),
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
                              this.edit(params.index)
                          }
                      }
                  }, '编辑'),
                  h('Button', {
                    props: {
                      type: 'error',
                      size: 'small'
                    },
                    on: {
                      click: () => {
                        this.del(params.row)
                      }
                    }
                  }, '删除')
              ]);
            }
          }
        ],
        data1: [
        ]
      }
    },
    methods: {
      copy (vl) {
        // this.modal1 = true
        this.copyTip = '是否拷贝工作流模板【' + vl.name + '】'
        this.copyResult = vl
        this.copyResult.id = ''
        this.copyResult.partners = []
        for (let uu of this.copyResult.periods) {
          uu.users = []
          uu.id = ''
        }
        this.$router.push({name: 'stream-new', params: {result: this.copyResult}})
      },
        changePage () {
        },
        del (vl) {
          this.$Modal.confirm({
            title: '删除提醒',
            content: '<p>是否删除模板【' + vl.name + '】</p>',
            onOk: () => {
              axios.get(`${util.wflowssh}/stream/delete/?id=${vl.id}`)
                      .then(res => {
                        if (res.data.code === 20000) {
                          this.getWorkList()
                          this.$Message.info('操作成功')
                        } else {
                          util.err_notice(res.data.msg)
                        }
                      }).catch(error => {
                util.err_notice(error)
                util.err_notice('内部错误，请找后端管理员')
              })
            }})
        },
        show (vl) {
              this.workStart = true
              axios.get(`${util.wflowssh}/dispatch/?id=${vl.id}`)
                      .then(res => {
                        if (res.data.code === 20000) {
                          this.$router.push({name: 'execWorkList', params: {result: res.data.data}})
                        } else {
                          util.err_notice(res.data.msg)
                        }
                      }).catch(error => {
                util.err_notice(error)
                util.err_notice('内部错误，请找后端管理员')
              })
        },
        edit (vl) {
            this.$router.push({name: 'stream-new', params: {result: this.data1[vl]}})
        },
        getWorkList () {
            this.loading = true
            axios.get(`${util.wflowssh}/streams/`)
                .then(res => {
                    if (res.data.code === 20000) {
                        this.data1 = res.data.data
                    } else {
                        util.err_notice(res.data.msg)
                    }
                  this.loading = false
                }).catch(error => {
                util.err_notice(error)
                util.err_notice('内部错误，请找后端管理员')
            })
        }
    },
    mounted () {
        this.getWorkList()
    }
  }
</script>
