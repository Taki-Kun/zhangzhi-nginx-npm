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
          <Icon type="ios-redo"></Icon>
          历史记录查看
        </p>
        <Row>
          <Col span="24">
               <Form>
                   <FormItem label="只看收藏">
                       <i-switch v-model="allOrcollect" size="large">
                           <span slot="open">On</span>
                           <span slot="close">Off</span>
                       </i-switch>
                   </FormItem>
               </Form>
          </Col>
        </Row>
        <Row>
          <Col span="24">

            <Table :loading="loading" border :columns="colums" :data="data1" stripe ref="selection"
            ></Table>
            <br>
            <Page :total="totalPage" show-total show-elevator @on-change="changePage"></Page>

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
        startpage: '',
        endpage: '',
        allOrcollect: false,
        loading: true,
        allsearchdata: [],
        totalPage: 1,
        actionName: '添加salt模块',
        saltObj: {
          id: '',
          name: '',
          func: '',
          args: ''
        },
        saltdefaultObj: {
          id: '',
          name: '',
          func: '',
          args: ''
        },
        colums: [
          {
            title: 'id',
            key: 'id',
            width: 100
          },
          {
            title: '任务名称',
            key: 'name',
            render: (h, params) => {
              if (params.row) {
                 if (!params.row.name) {
                     var pname = '【快速命令执行】' + params.row.tasks[0].action.name
                 } else {
                     pname = '【作业执行】' + params.row.name
                 }
                 return h('div', [
                     h('strong', pname)
                 ]);
              }
            }
          },
          {
            title: '执行人',
            key: 'user',
            render: (h, params) => {
              return h('div', [
                h('strong', params.row.user.name)
              ]);
            }
          },
            {
                title: '执行时间',
                key: 'run_time'
            },
            {
                title: '完成时间',
                key: 'complete_at'
            },
            {
                title: '状态',
                key: 'status',
                render: (h, params) => {
                    const row = params.row;
                    if (row.complete_at) {
                        var color = 'success'
                        var text = '执行完成'
                    } else {
                         color = 'warning'
                         text = '正在执行'
                    }
                    return h('Tag', {
                        props: {
                            type: 'dot',
                            color: color
                        }
                    }, text)
                }
            },
          {
            title: 'Action',
            key: 'action',
            width: 200,
            align: 'center',
            render: (h, params) => {
              return h('div', [
                h('Button', {
                    props: {
                        type: 'success',
                        size: 'small'
                    },
                    style: {
                        marginRight: '5px'
                    },
                    on: {
                        click: () => {
                            this.execAgain(params)
                        }
                    }
                }, '再次调度'),
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
                }, '详情')
                ]
              )
            }
          },
            {
                title: '收藏',
                key: 'status',
                width: 100,
                render: (h, params) => {
                    if (params.row.star) {
                        var shape = 'md-star'
                    } else {
                        shape = 'md-star-outline'
                    }
                    return h('Icon', {
                        props: {
                            type: shape,
                            color: 'orange',
                            size: 25
                        },
                        on: {
                            click: () => {
                                this.ifcollect(params)
                            }
                        }
                    })
                }
            }
        ],
        data1: [],
        saltInfodModal: false
      }
    },
    watch: {
      allOrcollect: function (val) {
          this.saltHistoryInit(0, 10, val)
      }
    },
    methods: {
      resListToStr (res) {
          for (let reslist of res.tasks) {
              for (let outputResult in reslist.output) {
                  if (!reslist.output[outputResult]['return'].stdout) {
                      reslist.output[outputResult]['return'] = reslist.output[outputResult]['return'].join('\n')
                  }
              }
          }
      },
      show (index) {
        localStorage.setItem('currentHomeworkId', JSON.stringify(this.data1[index]))
        this.$router.push({name: 'salt-detail', params: {result: this.data1[index]}})
        this.saltObj = {id: this.data1[index].id, name: this.data1[index].name, func: this.data1[index].func, args: this.data1[index].args}
      },
      changePage (page) {
        console.log(page)
        this.saltHistoryInit(page * 10 - 10, 10, this.allOrcollect)
      },
      actionModel () {
        axios.post(`${util.url}/job/action/edit/`, this.saltObj)
          .then(res => {
            if (res.data.code === 20000) {
              this.saltInit()
              this.$Message.info('操作成功')
            } else {
              util.err_notice(res.data.msg)
            }
          }).catch(error => {
          util.err_notice(error)
        })
      },
      saltHistoryInit (start = 0, end = 10, star = false) {
        this.startpage = start
        this.endpage = end
        this.loading = true
        if (star) {
            var ifstar = '&star=1'
        } else {
            ifstar = ''
        }
        axios.get(`${util.url}/job/logs/?offset=${start}&limit=${end}${ifstar}`)
          .then(res => {
              if (res.data.code === 20000) {
                this.data1 = res.data.data
                this.totalPage = res.data.count
                this.loading = false
              } else {
                  util.err_notice(res.data.msg)
              }
          }).catch(error => {
          util.err_notice(error)
        })
      },
      execAgain (vl) {
          if (vl.row.name.length === 0) {
              // 如果是快速执行命令的话
              this.$router.push({name: 'debug', params: {result: vl.row}})
          } else {
              // 如果是作业调度的话
              this.$router.push({name: 'run', params: {result: vl.row}})
          }
        },
     ifcollect (vl) {
         if (vl.row.star) {
             var action = 'down'
         } else {
             action = 'up'
         }
         axios.get(`${util.url}/job/log/${vl.row.id}/star/?action=${action}`)
             .then(res => {
                 if (res.data.code === 20000) {
                     if (action === 'down') {
                         this.data1[vl.index]['star'] = false
                         this.$Message.info('取消收藏成功')
                         if (this.allOrcollect) {
                             this.data1.splice(vl.index, 1)
                         }
                     } else {
                         this.data1[vl.index]['star'] = true
                         this.$Message.info('收藏成功')
                     }
                 } else {
                     util.err_notice(res.data.msg)
                 }
             }).catch(error => {
             util.err_notice(error)
         })
        }
    },
    mounted () {
      this.saltHistoryInit()
    }
  }
</script>
