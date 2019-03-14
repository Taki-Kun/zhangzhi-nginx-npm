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
  #carter .ivu-select-dropdown {
        width: inherit !important;
        max-height: 1000px !important;
        overflow: auto !important;
        margin: 5px 0 !important;
        padding: 5px 0 !important;
        background-color: #fff !important;
        -webkit-box-sizing: border-box !important;
        box-sizing: border-box !important;
        border-radius: 4px !important;
        -webkit-box-shadow: 0 1px 6px rgba(0,0,0,.2) !important;
        box-shadow: 0 1px 6px rgba(0,0,0,.2) !important;
        position: absolute !important;
        z-index: 900 !important;
    }
  @import '../../styles/common.less';
  @import '../Order/components/table.less';
</style>
<template>
  <div>
    <Row>
      <Card>
        <div slot="title" id="carter">
          <Row>
              <Col span="4">
                  <Select v-model="findLabel" multiple style="width:275px;max-height: 1000px;" placeholder="请选择过滤条件" @on-change="multipleChoose">
                      <Option v-for="(item, index) in allLabelList" :value="item" :key="item">{{ item }}</Option>
                  </Select>
              </Col>
              <!--<Col span="2">
                <Button type="default" @click="searchTable">查询</Button>
              </Col>-->
          </Row>
        </div>
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

    <Modal v-model="timeInfodModal" :width="1000" @on-ok="execTime">
      <h3 slot="header" style="color:#2D8CF0">调用时间（为空立即执行）</h3>
      <Form :model="formItem" :label-width="250" label-position="right">
        <Timeline pending>
          <TimelineItem>请选择执行时间</TimelineItem>
        </Timeline>

        <FormItem label="选择时间">
          <Row>
            <Col span="5">
              <DatePicker type="date" placeholder="Select date" v-model="formItem.date"></DatePicker>
            </Col>
            <Col span="2" style="text-align: center">-</Col>
            <Col span="5">
              <TimePicker type="time" placeholder="Select time" v-model="formItem.time"></TimePicker>
            </Col>
          </Row>
        </FormItem>

        <Timeline pending>
          <TimelineItem>下面是添加步骤参数，若没有参数留空，和相应的Pillar值</TimelineItem>
        </Timeline>

           <div v-for="(val, index) in currenttasks">
               <FormItem :label="'第' + (index + 1) + '步 【' + val.action.name + '】'">
                    <Input v-model="val.args" placeholder="请输入这个步骤需要执行的参数"></Input>
               </FormItem>
              <FormItem :label="val.action.name + '.'+ vl " v-for="(vl, index) in val.action.keys">
                  <Input v-model="val.action.pillardict[vl]" placeholder="请输入这个步骤需要执行的参数"></Input>
              </FormItem>
             <FormItem :label="'第' + (index + 1) + '步【' + val.action.name + '】所选服务器'">
               <div v-for="s in val.minions">{{s}}</div>
             </FormItem>
          </div>
      </Form>
    </Modal>

      <Modal v-model="tagModal" width="860">
          <p slot="header" style="color:#f60;text-align:center">
              <Icon type="information-circled"></Icon>
              <span>标签编辑</span>
          </p>
          <div>
              <Row>
                  <Card style="height: 150px">
                      <Tag v-for="item in count" :key="item" :name="item" closable @on-close="handleClose2">{{item}}</Tag>
                  </Card>
              </Row>
              <br>
              <Row>
                  <Col span="4">
                      <Dropdown @on-click="selectLabel">
                          <Button type="primary">
                              已存在标签
                              <Icon type="md-arrow-dropdown"></Icon>
                          </Button>
                          <DropdownMenu slot="list">
                              <DropdownItem v-for='(item, index) in allLabelList' :name="item">{{item}}</DropdownItem>
                          </DropdownMenu>
                      </Dropdown>
                  </Col>
                  <Col span="3">
                      <Input v-model="newLabelName" placeholder="新标签名称"></Input>
                  </Col>
                  <Col span="2">
                      <Button type="default" @click="sumbitAddLabel">
                          新增标签
                      </Button>
                  </Col>
              </Row>
          </div>
          <div slot="footer">
              <Button type="primary" @click="sumbitWorkLabel">提交</Button>
          </div>
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
      findLabel: [],
      newLabelName: '',
      count: [0, 1, 2],
      allLabelList: [],
       selectPro: '',
       searchCol: '',
       tagModal: false,
       loading: true,
        pillarList: [],
        selectStep: '',
        allsearchdata: [],
        execArgsList: [],
        currenttasks: [],
        currentIndex: '', // 表格序号
        currentWorkId: '', // 实际执行调度的id
        formItem: {
          date: '',
          time: ''
        },
        timeInfodModal: false,
        totalPage: 5,
        colums: [
          {
            title: '作业ID',
            key: 'id',
           width: 100
          },
            {
                title: '标签',
                key: 'action',
                width: 100,
                align: 'center',
                render: (h, params) => {
                    return h('a', [
                        h('Icon', {
                            props: {
                                type: 'md-pricetags',
                                size: '20',
                                color: 'black'
                            },
                            on: {
                                click: () => {
                                    this.labelModal(params.row)
                                }
                            }
                        }, '标签')
                    ]);
                }
            },
          {
            title: '作业名称',
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
                title: '作业状态',
                key: 'project',
                render: (h, params) => {
                    const color = params.row.msg ? 'error' : 'success';
                    const text = params.row.msg ? params.row.msg : '可执行';

                    return h('Tag', {
                        props: {
                            type: 'dot',
                            color: color
                        }
                    }, text);
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
                    type: 'default',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.exec(params.index)
                    }
                  }
                }, '运行'),
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
                }, '修改'),
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
      multipleChoose (vl) {
          // console.log(vl, 111111111111111111111111111111)
          this.homeworkInit(vl.join())
      },
      sumbitWorkLabel () {
          console.log(this.count, this.currentWorkId, 111111111111111)
          axios.post(`${util.url}/job/batch/label/`, {job_id: this.currentWorkId, labels: this.count})
              .then(res => {
                  if (res.data.code === 20000) {
                      this.commendList = res.data.data
                      this.tagModal = false
                      this.getWorkLabel()
                      this.$Message.info('操作成功！！')
                  } else {
                      util.err_notice(res.data.msg)
                  }
              }).catch(error => {
              util.err_notice(error)
          })
      },
      sumbitAddLabel () {
          if (this.newLabelName.length !== 0 && !this.count.includes(this.newLabelName)) {
               this.count.push(this.newLabelName)
          }
          this.newLabelName = ''
      },
      selectLabel (name) {
          if (!this.count.includes(name)) {
              this.count.push(name)
          }
      },
      handleClose2 (event, name) {
          const index = this.count.indexOf(name);
          this.count.splice(index, 1);
      },
      execTime () {
        let runningtime = ''
        let clplist = []
        let pillarlist = []
           if (this.formItem.date) {
           runningtime = `${this.formItem.date.getFullYear()}-${this.formItem.date.getMonth() + 1}-${this.formItem.date.getDate()} ${this.formItem.time}`
         } else {
           runningtime = ''
         }
        for (var g = 0; g < this.currenttasks.length; g++) {
            clplist.push(this.currenttasks[g].args)
            pillarlist.push(this.currenttasks[g].action.pillardict)
        }
        axios.post(`${util.url}/job/batch/go/`, {'run_time': runningtime, 'id': this.currentWorkId, 'clp_list': clplist, 'pillar_list': pillarlist})
          .then(res => {
            if (res.data.code === 20000) {
                localStorage.setItem('currentHomeworkId', JSON.stringify(res.data.data))
                this.$router.push({name: 'salt-detail', params: {result: res.data.data}})
            } else {
              util.err_notice(res.data.msg)
            }
          }).catch(error => {
          util.err_notice(error)
        })
      },
      changePage (page) {
          this.homeworkInit(this.findLabel.join(), page * 10 - 10, 10)
      },
      show (vl) {
        this.$router.push({name: 'job', params: {result: this.data1[vl]}})
      },
      remove (index) {
        this.$Modal.confirm({
          title: '删除提醒',
          content: '<p>是否删除作业名称【' + this.data1[index].name + '】</p>',
          onOk: () => {
            axios.get(`${util.url}/job/batch/${this.data1[index].id}/delete/`).then(res => {
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
      exec (index) {
        this.currenttasks = this.data1[index].tasks
        this.selectStep = ''
        for (var i = 0; i < this.currenttasks.length; i++) {
            this.currenttasks[i]['args'] = ''
            let keyList = this.currenttasks[i].action.keys
            this.currenttasks[i].action.pillardict = {}
            if (keyList.length === 0) {
                this.currenttasks[i].action.pillardict = {}
            } else {
                for (var h = 0; h < this.currenttasks[i].action.keys.length; h++) {
                    let hkey = this.currenttasks[i].action.keys[h]
                    this.currenttasks[i].action['pillardict'][hkey] = ''
                }
            }
        }
        this.currentWorkId = this.data1[index].id
        this.timeInfodModal = true
      },
      selectChange (vl) {
         // console.log(vl)
        },
      execAgain () {
          if (this.$route.params.result) {
              this.currenttasks = this.$route.params.result.tasks
              this.selectStep = ''
              for (var i = 0; i < this.currenttasks.length; i++) {
                  this.currenttasks[i]['args'] = this.$route.params.result.tasks[i].clp
                  let keyList = this.currenttasks[i].action.keys
                  this.currenttasks[i].action.pillardict = {}
                  if (keyList.length === 0) {
                      this.currenttasks[i].action.pillardict = {}
                  } else {
                      for (var h = 0; h < this.currenttasks[i].action.keys.length; h++) {
                          let hkey = this.currenttasks[i].action.keys[h]
                          this.currenttasks[i].action['pillardict'][hkey] = this.$route.params.result.tasks[i].pillar[hkey]
                      }
                  }
              }
              this.currentWorkId = this.$route.params.result.job_id
              this.timeInfodModal = true
          }
      },
      homeworkInit (values = [], start = 0, end = 10) {
       this.loading = true
       if (values.length !== 0) {
           var searchValue = `&labels=${values}`
       } else {
           searchValue = ''
       }
       axios.get(`${util.url}/job/batch/list/?offset=${start}&limit=${end}${searchValue}`)
           .then(res => {
               this.data1 = res.data.data
               this.totalPage = res.data.count
               this.loading = false
           }).catch(error => {
           util.err_notice(error)
       })
      },
     getWorkLabel () {
            axios.get(`${util.url}/job/batch/labels/`)
                .then(res => {
                    if (res.data.code === 20000) {
                        this.allLabelList = res.data.data
                    } else {
                       util.err_notice(res.data.msg)
                    }
                }).catch(error => {
                util.err_notice(error)
            })
        },
      searchTable () {
          this.homeworkInit(this.findLabel.join())
      },
      labelModal (vl) {
          this.count = vl.labels
          this.tagModal = true
          this.currentWorkId = vl.id
        }
    },
    mounted () {
      this.execAgain()
      this.homeworkInit()
      this.getWorkLabel()
    }
  }
</script>
