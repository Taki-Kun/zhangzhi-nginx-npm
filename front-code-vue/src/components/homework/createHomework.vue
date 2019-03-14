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
          作业属性
        </p>
        <Row>
          <Col span="9" offset="2">
            <Form :model="formItem" :label-width="80">
              <FormItem label="作业名称">
                <Input v-model="formItem.name" placeholder="输入作业名称..."></Input>
              </FormItem>
              <!--<FormItem label="作业描述">
                <Input v-model="formItem.textarea" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="输入作业描述"></Input>
              </FormItem>-->
              <FormItem label="选择项目">
                <Select v-model="formItem.project_id" filterable @on-change="selectPro">
                  <Option v-for="p in allproject" :value="p.id">{{p.title}}</Option>
                </Select>
              </FormItem>
              <FormItem label="是否限制人员查看">
                <i-switch v-model="formItem.mac" size="large">
                  <span slot="open">是</span>
                  <span slot="close">否</span>
                </i-switch>
              </FormItem>
              <FormItem label="限制查看人员" v-if="formItem.mac">
                <Select v-model="formItem.user_ids" multiple filterable placeholder="可输入名称进行搜索">
                  <Option v-for="item in allUser" :value="item.id" :key="item.id">{{ item.name }}</Option>
                </Select>
              </FormItem>
            </Form>
          </col>
        </Row>
      </Card>
      <br>
      <Card>
        <div slot="title">
          <Dropdown @on-click="addSalt">
            <Button type="success" icon="ios-add-circle-outline">
              添加步骤
              <Icon type="ios-arrow-down"></Icon>
            </Button>
            【记得点保存作业！！】
            <DropdownMenu slot="list">
              <DropdownItem name="salt模块">添加salt模块</DropdownItem>
              <DropdownItem>添加传输文件</DropdownItem>
              <DropdownItem>添加SQL脚本</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
            <Table border :columns="columns7" :data="data6"></Table>
        <br>
            <Button type="primary" @click="sumbitWork">保存</Button>
      </Card>
    </Row>

    <Modal v-model="addSaltModal" :width="800" @on-ok="actionHomework">
      <h3 slot="header" style="color:#2D8CF0">{{saltitle}}</h3>
      <Form v-model="saltformItem" :label-width="120" label-position="right">
          <FormItem label="执行模块">
            <Select v-model="saltformItem.action_id" filterable label-in-value @on-change="saltSelectChange">
              <Option v-for="commend in commendList" :value='commend.id'>【{{commend.project.name ? commend.project.name : '公共模块'}}】{{commend.name}}—{{commend.func}}</Option>
            </Select>
          </FormItem>
          <FormItem label="选择服务器">

            <Card style="width:350px">
               <Tree :data="baseData" show-checkbox @on-check-change="selectCheck"></Tree>
            </Card>
          </FormItem>
        <FormItem label="所选服务器" v-if="currentAction !== 'add'">

          <p v-for="minion in currentMinion">【{{minion}}】</p>

        </FormItem>
        <FormItem label="是否等待执行">
          <i-switch v-model="saltformItem.wait" size="large">
            <span slot="open">是</span>
            <span slot="close">否</span>
          </i-switch>
        </FormItem>
        <FormItem label="超时时间">
          <InputNumber :max="1000" :min="3" v-model="saltformItem.timeout"></InputNumber>
        </FormItem>
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
        workeditname: false,
        saltitle: '',
        currenteditID: '', // 当前选择的ID
        currentMinion: '', // 当前所选择的机器
        currentIndex: '', // 当前的操作索引
        currentAction: '', // 当前操作，区分是添加还是删除
        currentSaltArgs: '', // 当前的salt模块信息
        currentUser: '', // 当前用户
        currentStep: '', // 当前所作的操作，比如添加salt模块
        commendList: [],
        allproject: [],
        baseData: [{
          expand: true,
          title: '服务器选择',
          children: [],
          top: 1
        }],
        addSaltModal: false,
        saltformItem: {
          action_id: '',
          minions: [],
          wait: true,
          timeout: 3
        },
        allUser: [],
        formItem: {
          name: '',
          project_id: '',
          mac: false,
          user_ids: []
        },
        columns7: [
          {
            type: 'index',
            width: 60,
            align: 'center'
          },
          {
            title: '步骤名称',
            key: 'name',
            render: (h, params) => {
              return h('div', [
                h('strong', params.row.name)
              ]);
            }
          },
          {
            title: '参数',
            key: 'args'
          },
          {
            title: '创建人',
            key: 'user'
          },
          {
             title: '超时时间',
             key: 'timeout'
          },
          {
            title: '操作',
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
                      this.show(params)
                    }
                  }
                }, '查看'),
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
          },
          {
            title: '位移',
            key: 'action',
            width: 100,
            render: (h, params) => {
              return h('div', [
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small',
                    icon: 'md-arrow-round-up'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.upMove(params.index)
                    }
                  }
                }),
                h('Button', {
                  props: {
                    type: 'error',
                    size: 'small',
                    icon: 'md-arrow-round-down'
                  },
                  on: {
                    click: () => {
                      this.downMove(params.index)
                    }
                  }
                })
              ]);
            }
          }
        ],
        data6: [
        ]
      }
    },
   //  watch: {
   //    sqlObj: function (val) {
   //         console.log(val, 1111111111111111111111)
   //    }
   //  },
    methods: {
      upMove (vl) {
        if (vl === 0) {
          util.err_notice('元素已在第一位！')
        } else {
          let cloneData = JSON.parse(JSON.stringify(this.data6))
          let middledata = cloneData[vl]
          cloneData[vl] = cloneData[vl - 1]
          cloneData[vl - 1] = middledata
          this.data6 = cloneData
        }
      },
      downMove (vl) {
        if (vl === this.data6.length - 1) {
          util.err_notice('元素已在最后一位！')
        } else {
          let cloneData = JSON.parse(JSON.stringify(this.data6))
          let middledata = cloneData[vl]
          cloneData[vl] = cloneData[vl + 1]
          cloneData[vl + 1] = middledata
          this.data6 = cloneData
        }
      },
      selectCheck (vl) {
        this.saltformItem.minions = []
        for (var i = 0; i < vl.length; i++) {
          if (vl[i].minion_id && vl[i].minion_id.length !== 0) {
            this.saltformItem.minions.push(vl[i].minion_id)
          }
        }
        this.saltformItem.minions = Array.from(new Set(this.saltformItem.minions))
      },
      actionHomework () {
        if (this.currentStep === 'salt模块') {
          let saltformdict = this.saltformItem
          if (this.currentAction === 'edit') {
              // this.data6[this.currentIndex] = {}
              this.data6[this.currentIndex]['timeout'] = saltformdict.timeout
              this.data6[this.currentIndex]['name'] = this.currentStep
              this.data6[this.currentIndex]['user'] = sessionStorage.getItem('user')
              this.data6[this.currentIndex]['tasks'] = {'id': this.currenteditID, 'action_id': saltformdict.action_id, 'minions': saltformdict.minions, 'wait': saltformdict.wait, 'timeout': saltformdict.timeout}
              this.data6[this.currentIndex]['args'] = 'salt模块' + `：${this.currentSaltArgs}`
            // this.data6[this.currentIndex] = {'name': this.currentStep, 'timeout': saltformdict.timeout, 'user': sessionStorage.getItem('user'), 'tasks': {'id': this.currenteditID, 'action_id': saltformdict.action_id, 'minions': saltformdict.minions, 'wait': saltformdict.wait, 'timeout': saltformdict.timeout}, 'args': 'salt模块' + `：${this.currentSaltArgs}`}
          } else {
            this.data6.push({'name': this.currentStep, 'timeout': saltformdict.timeout, 'user': sessionStorage.getItem('user'), 'tasks': {'action_id': saltformdict.action_id, 'minions': saltformdict.minions, 'wait': saltformdict.wait, 'timeout': saltformdict.timeout}, 'args': 'salt模块' + `：${this.currentSaltArgs}`})
          }
        }
      },
      addSalt (name) {
        if (name === 'salt模块') {
          this.saltitle = '添加salt模块'
          this.currentAction = 'add'
          this.addSaltModal = true
          this.currentStep = 'salt模块'
          // this.treecheckinit()
          this.currentMinion = []
          this.hostInit('')
        }
      },
      selectPro (vl) {
          // console.log(vl)
          axios.get(`${util.url}/job/actions/?project=${vl}`)
              .then(res => {
                  if (res.data.code === 20000) {
                      this.commendList = res.data.data
                  }
              }).catch(error => {
              util.err_notice(error)
          })
      },
      show (vl) {
        this.currenteditID = vl.row.tasks.id
        this.saltitle = '修改salt模块'
        this.currentIndex = vl.index
        this.currentAction = 'edit'
        this.saltformItem = vl.row.tasks // 调出选择的模块
        if (vl.row.tasks.minions) {
          this.hostInit(vl.row.tasks.minions)
          this.currentMinion = vl.row.tasks.minions
        }
        this.addSaltModal = true
      },
      remove (vl) {
          this.$Modal.confirm({
              title: '删除提醒',
              content: '<p>是否删除</p>',
              onOk: () => {
                  this.data6.splice(vl, 1)
              }
          });
      },
      saltSelectChange (vl) {
        this.currentSaltArgs = vl.label
      },
      treecheckinit () {
      },
      hostInit (minionlist = '') {
        axios.get(`${util.url}/projects/?p=job-action`)
          .then(res => {
            if (res.data.code === 20000) {
              for (var i = 0; i < res.data.data.length; i++) {
                for (var g = 0; g < res.data.data[i].children.length; g++) {
                  for (var h = 0; h < res.data.data[i].children[g].children.length; h++) {
                    if (res.data.data[i].children[g].children[h].minion_id.length === 0) {
                        res.data.data[i].children[g].children[h].disableCheckbox = true
                        res.data.data[i].children[g].children[h].disabled = true
                    } else {
                        // 如果有minionlist的话编辑的时候调用
                        if (minionlist.length !== 0) {
                            if (minionlist.includes(res.data.data[i].children[g].children[h].minion_id)) {
                                res.data.data[i].children[g].children[h]['checked'] = true
                            }
                        }
                    }
                  }
                }
              }
             this.baseData[0].children = res.data.data
             this.allproject = res.data.data
            }
          }).catch(error => {
          util.err_notice(error)
        })
      },
      sumbitWork () {
        let postdata = {'tasks': []}
        for (var i = 0; i < this.data6.length; i++) {
          postdata.tasks.push(this.data6[i].tasks)
        }
        postdata = Object.assign(postdata, this.formItem)
          console.log(postdata)
        if (this.$route.params.result) {
            postdata['id'] = this.$route.params.result.id // 是编辑还是增加
        }
        axios.post(`${util.url}/job/batch/edit/`, postdata)
          .then(res => {
            this.$router.push({name: 'run'})
          }).catch(error => {
          util.err_notice(error)
        })
      },
      workEditinit () {
        if (this.$route.params.result) {
          this.workeditname = true
          let result = this.$route.params.result
          this.formItem.project_id = result.project.id
          this.selectPro(result.project.id)
          this.formItem.name = result.name
          this.formItem.mac = result.mac
          for (let uu in result.mac_users) {
            this.formItem.user_ids.push(result.mac_users[uu].id)
          }
          for (var i = 0; i < result.tasks.length; i++) {
            // ewf
           const tableinit = {}
           this.currentStep = 'salt模块' // 暂时赋予的变量
           tableinit['name'] = 'salt模块执行'
           tableinit['timeout'] = result.tasks[i].timeout
            if (result.tasks[i].error.status === 20007) {
                // 命令已被删除
                tableinit['user'] = ''
                tableinit['tasks'] = {'id': result.tasks[i].id, 'action_id': '', 'minions': result.tasks[i].minions, 'wait': result.tasks[i].wait, 'timeout': result.tasks[i].timeout}
                tableinit['args'] = ''
            } else {
                tableinit['user'] = result.tasks[i].action.user.name // 需要修改
                tableinit['tasks'] = {'id': result.tasks[i].id, 'action_id': result.tasks[i].action.id, 'minions': result.tasks[i].minions, 'wait': result.tasks[i].wait, 'timeout': result.tasks[i].timeout}
                tableinit['args'] = 'salt模块' + `名称【${result.tasks[i].action.name}】模块名【${result.tasks[i].action.func}】`
            }
              this.data6.push(tableinit)
          }
        }
      },
      userInit () {
        axios.get(`${util.url}/users/`)
          .then(res => {
            if (res.data.code === 20000) {
              this.allUser = res.data.data
            }
          }).catch(error => {
          util.err_notice(error)
        })
      }
    },
    mounted () {
      axios.get(`${util.url}/job/actions/`)
        .then(res => {
          // this.commendList = res.data.data
        }).catch(error => {
        util.err_notice(error)
      })
      // 编辑的时候调出的参数
      this.workEditinit()
      this.hostInit()
      this.userInit()
    }
  }
</script>
