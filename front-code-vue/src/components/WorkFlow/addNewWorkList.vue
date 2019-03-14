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
    .demo-spin-icon-load{
        animation: ani-demo-spin 1s linear infinite;
    }
    @keyframes ani-demo-spin {
        from { transform: rotate(0deg);}
        50%  { transform: rotate(180deg);}
        to   { transform: rotate(360deg);}
    }
    .demo-spin-col{
        height: 100px;
        position: relative;
        border: 1px solid #eee;
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
                    工作流属性
                </p>
                <Row>
                    <Col span="9" offset="2">
                        <Form :model="formItem" :label-width="80">
                            <FormItem label="选择项目">
                                <Select v-model="formItem.project" filterable @on-change="choosePro">
                                    <Option v-for="p in allproject" :value="p.id">{{p.title}}</Option>
                                </Select>
                            </FormItem>
                            <FormItem label="工作流名称">
                                <Input v-model="formItem.name" placeholder="输入作业名称..."></Input>
                            </FormItem>
                            <FormItem label="参与人员">
                                <Select v-model="formItem.partners" multiple filterable placeholder="可输入名称进行搜索">
                                    <Option v-for="item in allUser" :value="item.id" :key="item.id">{{ item.name }}</Option>
                                </Select>
                            </FormItem>
                            <FormItem label="描述">
                                <Input v-model="formItem.desc" type="textarea"  placeholder="输入工作流描述..."></Input>
                            </FormItem>
                        </Form>
                    </col>
                </Row>
            </Card>
            <br>
            <Card>
                <div slot="title">
                    <br>
                    <Row>
                        <Steps :current="current">
                            <Step  v-for="item in workStep" :title="item.name" :content="item.desc"></Step>
                        </Steps>
                    </Row>
                    <br>
                </div>
                <Row>
                    <Col span="4">
                        <Button type="dashed" @click="handleAdd" icon="md-shuffle">插入阶段</Button>
                        <Button type="error" @click="handleMinus" icon="ios-close-circle">删除阶段</Button>
                    </Col>
                </Row>
                <br>
                <Row v-if="workStep.length !== 0">
                    <Col><h3>当前正在设置第 【{{ current + 1 }}】 步</h3></Col>
                    <br>
                    <Col span="4">
                        <Input v-model="workStep[current].name">
                            <span slot="prepend"><Icon type="ios-pricetags-outline"></Icon>&nbsp阶段{{current + 1}}标题</span>
                        </Input>
                    </Col>
                    <Col span="4" offset="1">
                        <Input v-model="workStep[current].desc">
                            <span slot="prepend"><Icon type="ios-pricetags-outline"></Icon>&nbsp阶段{{current + 1}}描述</span>
                        </Input>
                    </Col>
                    <Col span="1" offset="1">
                        执行人：
                    </Col>
                    <Col span="8">
                        <Select v-model="workStep[current].users" multiple filterable placeholder="可输入名称进行搜索">
                            <Option v-for="item in allUser" :value="item.id" :key="item.id">{{ item.name }}</Option>
                        </Select>
                    </Col>
                    <Col offset="20">
                        <Button type="default" @click="pre">上一步</Button>
                        <Button type="primary" @click="next">下一步</Button>
                    </Col>
                    <br>
                </Row>
                <hr style="height:1px;border:none;border-top:1px dashed #dddee1;"/>
                <br>
                <Row>
                    <Col span="6">
                        <Dropdown @on-click="taskPostType">
                            <Button type="success"><Icon type="md-add"></Icon>&nbsp
                                添加任务
                                <Icon type="ios-arrow-down"></Icon>
                            </Button>
                            【记得点保存！！】
                            <DropdownMenu slot="list">
                                <DropdownItem v-for="item in taskType" :name="item.key">{{item.value}}</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                        <br>
                        <br>
                    </Col>
                </Row>
                <Row>
                    <div style="background:#eee;padding: 20px">
                        <Card :bordered="false">
                            <Table v-if="workStep[current]" :loading="loading" border :columns="colums" :data="workStep[current].items" stripe ref="selection"></Table>
                        </Card>
                    </div>
                </Row>
                <br>
                <Row>
                    <Col>
                        <Button type="primary" @click="sumbit">保存</Button>
                    </Col>
                </Row>
                <Spin fix v-if="workStart">
                    <Icon type="ios-loading" size=60 class="demo-spin-icon-load"></Icon>
                    <div>操作中...</div>
                </Spin>
            </Card>
        </Row>

        <Modal v-model="TaskModal" :width="800" @on-ok="actionSaveTask">
            <h3 slot="header" style="color:#2D8CF0">任务详情查看</h3>
            <Form v-model="workStep" :label-width="120" label-position="right" v-if="TaskModal">
                <FormItem label="名称">
                    <Input v-model="workStep[current].items[currentTaskId].name"></Input>
                </FormItem>
            </Form>
        </Modal>

        <Modal v-model="jobModal" :width="1200"  @on-ok="SaveJobTask">
            <h3 slot="header" style="color:#2D8CF0">作业详情查看</h3>
            <Form :label-width="250" label-position="right" v-if="jobModal">
                <FormItem label="选择作业">
                    <Select v-model="selectJob" filterable label-in-value @on-change="selectJobFun" >
                        <Option v-for="(item, index) in allJobWork" :value="item.id" :key="item.id" :label="index + '@' + item.name"><span>{{index}}@{{item.name}}</span></Option>
                    </Select>
                </FormItem>
              <FormItem label="是否自动执行">
                <i-switch v-model="workStep[current].items[currentTaskId].auto" size="large">
                  <span slot="open">是</span>
                  <span slot="close">否</span>
                </i-switch>
              </FormItem>
                <div v-for="(val, index) in workStep[current].items[currentTaskId].content.clp_list">
                    <FormItem :label="'第' + (index + 1) + '步 【' + workStep[current].items[currentTaskId].content.jobNameList[index] + '】'">
                        <Input v-model="workStep[current].items[currentTaskId].content.clp_list[index]" placeholder="请输入这个步骤需要执行的参数"></Input>
                    </FormItem>
                    <FormItem :label="workStep[current].items[currentTaskId].content.jobNameList[index] + '.'+ vl" v-for="(index2, vl) in workStep[current].items[currentTaskId].content.pillar_list[index]">
                        <Input v-model="workStep[current].items[currentTaskId].content.pillar_list[index][vl]" placeholder="请输入这个步骤需要执行的参数"></Input>
                    </FormItem>
                </div>
            </Form>
        </Modal>

      <Modal v-model="verUpdateModal" :width="1200">
        <h3 slot="header" style="color:#2D8CF0">版本更新详情查看</h3>
        <Form :label-width="250" label-position="right" v-if="verUpdateModal">
          <FormItem label="选择更新作业">
            <Select v-model="select3DVerJob" filterable label-in-value @on-change="select3DVerJobFun" >
              <Option v-for="(item, index) in all3dJobWork" :value="item.id" :key="item.id" :label="index + '@' + item.name"><span>{{index}}@{{item.name}}</span></Option>
            </Select>
          </FormItem>
          <FormItem label="请输入版本">
            <Input v-model="workStep[current].items[currentTaskId].content.version" placeholder="请输入版本"></Input>
          </FormItem>
          <FormItem label="是否自动执行">
            <i-switch v-model="workStep[current].items[currentTaskId].auto" size="large">
              <span slot="open">是</span>
              <span slot="close">否</span>
            </i-switch>
          </FormItem>
          <div v-for="(val, index) in workStep[current].items[currentTaskId].content.clp_list">
            <FormItem :label="'第' + (index + 1) + '步 【' + workStep[current].items[currentTaskId].content.jobNameList[index] + '】'">
              <Input v-model="workStep[current].items[currentTaskId].content.clp_list[index]" placeholder="请输入这个步骤需要执行的参数"></Input>
            </FormItem>
            <FormItem :label="workStep[current].items[currentTaskId].content.jobNameList[index] + '.'+ vl" v-for="(index2, vl) in workStep[current].items[currentTaskId].content.pillar_list[index]">
              <Input v-model="workStep[current].items[currentTaskId].content.pillar_list[index][vl]" placeholder="请输入这个步骤需要执行的参数"></Input>
            </FormItem>
          </div>
        </Form>
      </Modal>

        <Modal v-model="scriptModal" :width="1200"  @on-ok="SaveScriptTask">
            <h3 slot="header" style="color:#2D8CF0">脚本详情查看</h3>
            <my-script :allproject="allproject" :formItem="formItem" :workStep="workStep" :current="current" :currentTaskId="currentTaskId" :scriptModal="scriptModal" ref="addScriptComponents"></my-script>
        </Modal>
    </div>
</template>



<script>
    import util from '../../libs/util'
    import axios from 'axios'
    import addScriptComponents from './addScriptComponents.vue'
    export default {
        components: {
            'my-script': addScriptComponents
        },
        name: 'DataBaseDic',
        data () {
            return {
                scriptModal: false,
                currentAllResult: '',
                loading: false,
                currenttasks: [],
                selectJob: '',
                select3DVerJob: '',
                allJobWork: [],
                verUpdateModal: false,
                jobModal: false,
                workStart: false,
                currentTaskId: 0,
                TaskModal: false,
                taskType: [],
                current: 0,
                allproject: [],
                all3dJobWork: [],
                formItem: {
                    id: '',
                    name: '',
                    project: '',
                    desc: '',
                    partners: [],
                    periods: []
                },
                workStep: [
                ],
                allUser: [],
                data1: [],
                colums: [
                    {
                        title: '序号/ID',
                        type: 'index',
                        width: 100
                    },
                    {
                        title: '类型',
                        key: 'type',
                        render: (h, params) => {
                            let text = ''
                            if (params.row.type === 'text') {
                                text = '文本确认'
                            } else if (params.row.type === 'job') {
                                text = '作业调度'
                            } else if (params.row.type === 'script') {
                                text = '脚本调度'
                            } else if (params.row.type === 'vu') {
                                text = '3D版本更新'
                            }
                            return h('div', [
                                h('strong', text)
                            ]);
                        }
                    },
                    {
                        title: '名称',
                        key: 'name',
                        render: (h, params) => {
                            let text = ''
                            if (params.row.type === 'text') {
                                text = params.row.name
                            } else if (params.row.type === 'job' || params.row.type === 'vu') {
                                text = params.row.content.homeworkName
                            }
                            return h('div', [
                                h('strong', text)
                            ]);
                        }
                    },
                    {
                        title: 'Action',
                        key: 'action',
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
                                            this.detail(params)
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
                                            this.deleteItem(params.index)
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
                ]
            }
        },
        methods: {
            choosePro (vl) {
              this.jobInit(vl)
            },
            upMove (vl) {
                if (vl === 0) {
                    util.err_notice('元素已在第一位！')
                } else {
                    let cloneData = JSON.parse(JSON.stringify(this.workStep[this.current].items))
                    let middledata = cloneData[vl]
                    cloneData[vl] = cloneData[vl - 1]
                    cloneData[vl - 1] = middledata
                    this.workStep[this.current].items = cloneData
                }
            },
            downMove (vl) {
                if (vl === this.workStep[this.current].items.length - 1) {
                    util.err_notice('元素已在最后一位！')
                } else {
                    let cloneData = JSON.parse(JSON.stringify(this.workStep[this.current].items))
                    let middledata = cloneData[vl]
                    cloneData[vl] = cloneData[vl + 1]
                    cloneData[vl + 1] = middledata
                    this.workStep[this.current].items = cloneData
                }
            },
            pre () {
                if (this.current >= 0 && this.current <= 1) {
                    this.current = 0;
                } else {
                    this.current -= 1;
                }
            },
            next () {
                if (this.workStep.length !== 0) {
                    if (this.current === this.workStep.length - 1) {
                        // this.current = 0;
                    } else {
                        this.current += 1;
                    }
                }
            },
            workSelectChange (vl) {
                this.currentWorkArgs = vl.label
            },
            hostInit () {
                axios.get(`${util.url}/projects/?p=stream`)
                    .then(res => {
                        if (res.data.code === 20000) {
                            this.allproject = res.data.data
                        }
                    }).catch(error => {
                    util.err_notice(error)
                })
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
            },
            handleAdd () {
                if (this.workStep.length !== 0) {
                    this.current = this.current + 1
                }
                this.workStep.splice(this.current, 0, {name: '', desc: '', users: [], items: []})
            },
            handleMinus () {
                if (this.workStep.length !== 0) {
                    this.$Modal.confirm({
                        title: '删除提醒',
                        content: '<p>是否删除第【' + (this.current + 1) + '】阶段！！标题为【' + this.workStep[this.current].name + '】阶段的步骤将全部删除！</p>',
                        onOk: () => {
                            this.workStep.splice(this.current, 1)
                            // 删除初始化，防止报错
                            if (this.current > 0) {
                                this.current = this.current - 1
                            }
                        }})
                }
            },
            sumbit () {
                this.workStart = true
                this.formItem['periods'] = this.workStep
                axios.post(`${util.wflowssh}/stream/edit/`, this.formItem)
                    .then(res => {
                        if (res.data.code === 20000) {
                            if (this.workStep.length !== 0) {
                                this.formItem['id'] = res.data.data.id
                                this.workStep[this.current].items = res.data.data.periods[this.current].items
                            }
                            this.$Message.info('操作成功')
                        } else {
                            util.err_notice(res.data.msg)
                        }
                        this.workStart = false
                    }).catch(error => {
                    util.err_notice(error)
                    this.workStart = false
                })
            },
            taskPostType (vl) {
                if (this.workStep[this.current]) {
                    this.workStep[this.current].items.push({name: '', desc: '', type: vl, auto: false, content: {}})
                }
            },
            initType () {
                axios.get(`${util.wflowssh}/category/`)
                    .then(res => {
                        if (res.data.code === 20000) {
                            this.taskType = res.data.data
                        }
                    }).catch(error => {
                    util.err_notice(error)
                })
            },
            actionSaveTask () {
            },
            SaveJobTask () {
            },
            SaveScriptTask () {
            },
            deleteItem (vl) {
                this.$Modal.confirm({
                    title: '删除提醒',
                    content: '是否删除此类型项！！',
                    onOk: () => {
                        this.workStep[this.current].items.splice(vl, 1)
                    }})
            },
            detail (vl) {
                // 区分判断新建的值需为空
                if (vl.row.type === 'text') {
                    this.TaskModal = true
                } else if (vl.row.type === 'job') {
                  this.jobModal = true
                  console.log(this.workStep[this.current].items[vl.index].content.job_id, 1111111111111111111111)
                  this.selectJob = this.workStep[this.current].items[vl.index].content.job_id
                } else if (vl.row.type === 'vu') {
                  this.verUpdateModal = true
                  this.select3DVerJob = this.workStep[this.current].items[vl.index].content.vu_id
                } else if (vl.row.type === 'script') {
                    this.$refs.addScriptComponents.selectPro()
                    this.$refs.addScriptComponents.proInit(this.workStep[this.current].items[vl.index].content.minions)
                    this.scriptModal = true
                }
                this.currentTaskId = vl.index
            },
            selectJobFun (vl) {
                this.jobFunDispath(vl, this.allJobWork)
            },
           select3DVerJobFun (vl) {
                this.jobFunDispath(vl, this.all3dJobWork, true)
           },
           jobFunDispath (vl, allParams, verPath = false) {
             let jobIndex = vl.label.split('@')[0]
             this.currenttasks = allParams[jobIndex].tasks
             let jobNameList = []
             let clplist = []
             let pillarlist = []
             let runningtime = ''
             for (let i of this.currenttasks) {
               let keyList = i.action.keys
               let keydict = {}
               if (keyList.length === 0) {
                 keydict = {}
               } else {
                 for (let hkey of keyList) {
                   keydict[hkey] = ''
                 }
               }
               pillarlist.push(keydict)
               jobNameList.push(i.action.name)
               clplist.push('')
             }
             if (verPath) {
               this.workStep[this.current].items[this.currentTaskId].content = {vu_id: this.select3DVerJob, version: this.workStep[this.current].items[this.currentTaskId].content.version, clp_list: clplist, pillar_list: pillarlist, jobNameList: jobNameList, homeworkName: vl.label.split('@')[1]}
             } else {
               this.workStep[this.current].items[this.currentTaskId].content = {job_id: this.selectJob, run_time: runningtime, clp_list: clplist, pillar_list: pillarlist, jobNameList: jobNameList, homeworkName: this.allJobWork[jobIndex].name}
             }
           },
            jobInit () {
                axios.get(`${util.url}/job/batch/list/?project=${this.formItem.project}`)
                    .then(res => {
                        if (res.data.code === 20000) {
                            this.allJobWork = res.data.data
                          console.log(res.data.data, 111111111111111111111111)
                        } else {
                        }
                    }).catch(error => {
                    util.err_notice(error)
                    util.err_notice('内部错误，请找后端开发人员')
                })
            },
           verJobInit () {
             axios.get(`${util.stage}/vu/list/`)
               .then(res => {
                 if (res.data.code === 20000) {
                   this.all3dJobWork = res.data.data
                 } else {
                 }
               }).catch(error => {
               util.err_notice(error)
               util.err_notice('内部错误，请找后端开发人员')
             })
           },
            workListInit (vl) {
                if (vl) {
                    this.currentAllResult = vl
                    this.formItem['partners'] = []
                    this.formItem['id'] = vl.id
                    this.formItem['name'] = vl.name
                    this.formItem['desc'] = vl.desc
                    this.formItem['project'] = vl.project.id
                    console.log(vl, vl.project.id, 1111111111111111111111111111111111)
                    this.jobInit(vl.project.id)
                    for (let gg of vl.partners) {
                        if (gg && gg.id) {
                            this.formItem['partners'].push(gg.id)
                        }
                    }
                    for (let ss of vl.periods) {
                        let userList = []
                        for (let dd of ss.users) {
                            userList.push(dd.id)
                        }
                        this.workStep.push({id: ss['id'], name: ss['name'], desc: ss['desc'], users: userList, items: ss.items})
                    }
                }
            }
        },
        created () {
            this.hostInit()
            this.userInit()
            this.initType()
            this.verJobInit()
            this.workListInit(this.$route.params.result)
            if (!this.$route.params.result) {
              this.jobInit()
            }
        }
    }
</script>
