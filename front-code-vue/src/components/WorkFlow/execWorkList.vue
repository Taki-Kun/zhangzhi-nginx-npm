<style lang="less" xmlns="http://www.w3.org/1999/html">
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
                    工作流详情
                </p>
                <Row>
                    <Col span="2" offset="1">
                        项目：
                    </col>
                    <Col span="5">
                        <h4>{{currentResult.project.name}}</h4>
                    </Col>
                    <Col span="2">
                        工作流名称：
                    </col>
                    <Col span="5">
                        <h4>{{currentResult.name}}</h4>
                    </Col>
                </Row>
                <br>
                <Row>
                    <Col span="2" offset="1">
                        参与人员：
                    </col>
                    <Col span="17">
                        <span v-for="vl in currentResult.partners">{{vl.name}} </span>
                    </Col>
                </Row>
                <br>
                <Row>
                    <Col span="2" offset="1">
                        描述：
                    </col>
                    <Col span="17">
                        {{currentResult.desc}}
                    </Col>
                </Row>
                <br>
            </Card>
            <Card>
                <div slot="title">
                    <br>
                    <Row>
                        <Steps :current="current">
                            <Step  v-for="item in workStep" :title="item.name" :content="item.desc"></Step>
                            <Step v-if="finishALl" title="完成"></Step>
                        </Steps>
                    </Row>
                    <br>
                </div>
                <Row>
                    <div style="background:#eee;padding: 20px" v-if="current != workStep.length">
                        <Card :bordered="false">
                            <div slot="title"><h3><span>当前正在执行第 【{{ current + 1 }}】 步【 跟进人：<span v-for="userItem in workStep[current].users">{{userItem.name}} </span><!--{{workStep[current].users}}-->】</span></h3></div>
                            <div v-for="(item, index) in workStep[current].items">
                                <Row type="flex" justify="center" class="code-row-bg">
                                    <Alert show-icon style="width: 1400px" type="info" v-if="item.status === 0  || item.status === 3">
                                        【第{{index +1 }}步骤】{{item.name || item.content.homeworkName || item.content.script.desc}}
                                        <Icon type="md-walk" slot="icon" v-if="item.status === 0  || item.status === 3"></Icon>
                                        <template slot="desc">
                                            <Col v-if="item.type === 'text'">
                                                <br>
                                                <Input v-model="item.desc" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="请输入内容..."></Input>
                                            </Col>
                                            <Col v-if="item.type === 'job' || item.type === 'script' || item.type === 'vu'">
                                                <br>
                                                <Collapse :value="JSON.stringify(item.status)">
                                                    <Panel :name="'3'">
                                                      <span v-if="item.type === 'job'">作业详情</span><span v-else-if="item.type === 'script'">脚本执行详情</span><span v-else-if="item.type === 'vu'">更新执行详情</span>
                                                        <div slot="content" v-if="item.type === 'job' || item.type === 'vu'">
                                                            <my-homeWork  v-if="!item.job_log" :data1="item.content.job.tasks" :ifcomplete='ifcomplete' ref="execSaltDetail"></my-homeWork>
                                                            <my-homeWork  v-if="item.job_log" :data1="item.job_log.tasks" :ifcomplete='item.job_log.complete_at || false' ref="execSaltDetail"></my-homeWork>
                                                        </div>
                                                        <div slot="content" v-else-if="item.type === 'script'">
                                                            <my-scirptWork v-if="!item.script_log" :data1="[item.content.script]" :ifcomplete='ifcomplete' ref="execScriptDetail"></my-scirptWork>
                                                            <my-scirptWork v-if="item.script_log" :data1="[item.script_log]" :ifcomplete='item.script_log.complete_at || false' ref="execScriptDetail"></my-scirptWork>
                                                        </div>
                                                    </Panel>
                                                </Collapse>
                                            </Col>
                                            <br>
                                            <Col v-if="item.auto === false">
                                                <Button type="warning" icon="md-share-alt" @click="skipTask(workStep[current], item)" :disabled="item.status !== 0 && item.status !== -1">跳过此项</Button>
                                                <Button type="success" icon="md-checkmark" @click="finishTask(workStep[current], item)" v-if="item.type === 'text'" :disabled="item.status !== 0 && item.status !== -1">完成此项</Button>
                                                <Button type="success" icon="md-checkmark" @click="finishTask(workStep[current], item)"  v-if="item.type === 'job' || item.type === 'script' || item.type === 'vu'" :disabled="item.status !== 0 && item.status !== -1">执行此项</Button>
                                            </Col>
                                        </template>
                                    </Alert>
                                    <Alert show-icon style="width: 1400px" type="success" v-else-if="item.status === 1">
                                        【第{{index +1 }}步骤】{{item.name|| item.content.homeworkName || item.content.script.desc}}(此步骤正常完成)
                                        <template slot="desc">
                                            <Col v-if="item.type === 'text'">
<pre>
{{item.content.confirm}}
</pre>
                                            </Col>
                                            <br>
                                            <Col v-if="item.type === 'job' || item.type === 'script' || item.type === 'vu'">
                                                <Collapse>
                                                    <Panel>
                                                        <span v-if="item.type === 'job'">作业详情</span><span v-else-if="item.type === 'script'">脚本执行详情</span><span v-else-if="item.type === 'vu'">更新执行详情</span>
                                                        <div slot="content" v-if="item.type === 'job' || item.type === 'vu'">
                                                            <my-homeWork :data1="item.job_log.tasks" :ifcomplete='true' ref="execSaltDetail" ></my-homeWork>
                                                        </div>
                                                        <div slot="content" v-else-if="item.type === 'script'">
                                                            <my-scirptWork :data1="[item.script_log]" :ifcomplete='true' ref="execScriptDetail"></my-scirptWork>
                                                        </div>
                                                    </Panel>
                                                </Collapse>
                                            </Col>
                                        </template>
                                    </Alert>
                                    <Alert show-icon style="width: 1400px" type="warning" v-else-if="item.status === 2">
                                        【第{{index +1 }}步骤】{{item.name || item.content.homeworkName || item.content.script.desc}}(此步骤跳过未执行)
                                        <template slot="desc">
                                            <Col>
<pre>
{{item.content.confirm}}
</pre>
                                            </Col>
                                            <Col v-if="item.type === 'job' || item.type === 'script' || item.type === 'vu'">
                                                <Collapse>
                                                    <Panel>
                                                      <span v-if="item.type === 'job'">作业详情</span><span v-else-if="item.type === 'script'">脚本执行详情</span><span v-else-if="item.type === 'vu'">更新执行详情</span>
                                                        <div slot="content" v-if="item.type === 'job' || item.type === 'vu'">
                                                            <my-homeWork  v-if="!item.job_log" :data1="item.content.job.tasks" :ifcomplete='ifcomplete' ref="execSaltDetail"></my-homeWork>
                                                            <my-homeWork  v-if="item.job_log" :data1="item.job_log.tasks" :ifcomplete='item.job_log.complete_at || false' ref="execSaltDetail"></my-homeWork>
                                                        </div>
                                                        <div slot="content" v-else-if="item.type === 'script'">
                                                            <my-scirptWork v-if="!item.script_log" :data1="[item.content.script]" :ifcomplete='ifcomplete' ref="execScriptDetail"></my-scirptWork>
                                                            <my-scirptWork v-if="item.script_log" :data1="[item.script_log]" :ifcomplete='item.script_log.complete_at || false' ref="execScriptDetail"></my-scirptWork>
                                                        </div>
                                                    </Panel>
                                                </Collapse>
                                            </Col>
                                        </template>
                                    </Alert>
                                    <Alert show-icon style="width: 1400px" type="error" v-else-if="item.status === -1">
                                        【第{{index +1 }}步骤】{{item.name || item.content.homeworkName || item.content.script.desc}}(执行失败)
                                        <template slot="desc">
                                            <Col>
<pre>
{{item.content.confirm}}
</pre>
                                            </Col>
                                            <Col v-if="item.type === 'job' || item.type === 'script' || item.type === 'vu'">
                                                <Collapse>
                                                    <Panel>
                                                        <span v-if="item.type === 'job'">作业详情</span><span v-else-if="item.type === 'script'">脚本执行详情</span><span v-else-if="item.type === 'vu'">更新执行详情</span>
                                                        <div slot="content" v-if="item.type === 'job' || item.type === 'vu'">
                                                            <my-homeWork  v-if="!item.job_log" :data1="item.content.job.tasks" :ifcomplete='ifcomplete' ref="execSaltDetail"></my-homeWork>
                                                            <my-homeWork  v-if="item.job_log" :data1="item.job_log.tasks" :ifcomplete='item.job_log.complete_at || false' ref="execSaltDetail"></my-homeWork>
                                                        </div>
                                                        <div slot="content" v-else-if="item.type === 'script'">
                                                            <my-scirptWork v-if="!item.script_log" :data1="[item.content.script]" :ifcomplete='ifcomplete' ref="execScriptDetail"></my-scirptWork>
                                                            <my-scirptWork v-if="item.script_log" :data1="[item.content.script]" :ifcomplete='item.script_log.complete_at || false' ref="execScriptDetail"></my-scirptWork>
                                                        </div>
                                                    </Panel>
                                                </Collapse>
                                            </Col>
                                        </template>
                                    </Alert>
                                </Row>
                                <br>
                                <Spin fix v-if="loading">
                                    <Icon type="ios-loading" size=80 class="demo-spin-icon-load"></Icon>
                                    <div>提交中...</div>
                                </Spin>
                            </div>
                            <hr style="height:1px;border:none;border-top:1px dashed #dddee1;"/>
                            <br>
                            <div>
                                <Row type="flex" justify="end" class="code-row-bg">
                                    <Button type="error" icon="md-close" @click="closeFlow"  v-if="!currentResult.complete">关闭流程</Button>&nbsp
                                    <Button type="default" icon="md-undo" @click="lastStep"  v-if="!currentResult.complete">回滚【回滚到上一步】</Button>
                                </Row>
                            </div>
                        </Card>
                    </div>
                    <div style="background:#eee;padding: 20px" v-else-if="current == workStep.length">
                        <Card :bordered="false">
                            <p slot="title">工作流已完成</p>
                            <Row type="flex" justify="center" class="code-row-bg">
                                <Alert show-icon style="width: 1400px" type="success">
                                    工作流关闭
                                    <template slot="desc">
                                        <Col>
                                            已完成全部阶段
                                        </Col>
                                    </template>
                                </Alert>
                            </Row>
                        </Card>
                    </div>
                </Row>
                <br>
                <Row type="flex" justify="end" class="code-row-bg">
                    <Col v-if="currentResult.complete == true">
                        <Button type="default" @click="pre" :disabled="current == 0" icon="arrow-left-a">上一步</Button>
                        <Button type="primary" @click="next" :disabled="current == workStep.length" icon="arrow-right-a">下一步</Button>
                    </Col>
                </Row>
            </Card>
        </Row>
    </div>
</template>



<script>
    import util from '../../libs/util'
    import axios from 'axios'
    import execSaltDetail from './execSaltDetail.vue'
    import execScriptDetail from './execScriptDetail.vue'
    export default {
        components: {
            'my-homeWork': execSaltDetail,
            'my-scirptWork': execScriptDetail
        },
        name: 'execWorkList',
        data () {
            return {
                ifcomplete: '',
                data1: [],
                loading: false,
                currentWorkID: 0,
                currentResult: '',
                single: false,
                current: 0,
                finishALl: false,
                workStep: [
                ],
                showTimeInterval: ''
            }
        },
        methods: {
          closeFlow () {
            this.$Modal.confirm({
              title: '关闭流程',
              content: '<p>是否关闭流程</p>',
              onOk: () => {
                axios.get(`${util.wflowssh}/close/?id=${this.currentWorkID}`)
                  .then(res => {
                    if (res.data.code === 20000) {
                      this.$router.push({name: 'workflow'})
                      // 作业状态初始化
                    } else {
                      util.err_notice(res.data.msg)
                    }
                    this.loading = false
                  }).catch(error => {
                  util.err_notice(error)
                  util.err_notice('内部错误!!请找后端程序员！！')
                })
              }
            });
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
                    if (this.current === this.workStep.length) {
                        // this.current = 0;
                        // 触发多出一个完成步骤
                        if (this.currentResult.complete === true) {
                            this.current = this.workStep.length
                        }
                    } else {
                        this.current += 1;
                    }
                }
            },
            InitWork (routeResult) {
                if (routeResult) {
                    this.currentResult = routeResult
                    this.workStep = this.currentResult.periods
                    this.currentWorkID = this.currentResult.id
                    if (!this.currentResult.complete) {
                        this.current = this.currentResult.pointer - 1
                    } else {
                        this.finishALl = true
                        this.current = this.workStep.length
                    }
                }
            },
            sumbitTask (dispatchid, periodid, itemid, action, item) {
                this.loading = true
                let tt = {}
                if (item.type === 'text') {
                     tt = {confirm: item.desc}
                }
                axios.post(`${util.wflowssh}/${dispatchid}/${periodid}/${itemid}/`, {action: action, params: tt})
                    .then(res => {
                        if (res.data.code === 20000) {
                            this.currentResult = res.data.data
                            this.workStep = this.currentResult.periods
                            if (!res.data.data.complete) {
                                this.current = res.data.data.pointer - 1
                            } else {
                                this.current = this.currentResult.periods.length
                                this.finishALl = true
                            }
                            // 作业状态初始化
                        } else {
                            util.err_notice(res.data.msg)
                        }
                        this.loading = false
                    }).catch(error => {
                    util.err_notice(error)
                    util.err_notice('内部错误!!请找后端程序员！！')
                    this.loading = false
                })
            },
            skipTask (periods, item) {
                this.$Modal.confirm({
                    title: '跳过提醒',
                    content: '是否确认“跳过”此项，此项标题为【' + (item.name || item.content.homeworkName || item.content.script.desc) + '】',
                    onOk: () => {
                        this.sumbitTask(this.currentWorkID, periods.id, item.id, 'bypass', item)
                    }})
            },
            finishTask (periods, item) {
                this.$Modal.confirm({
                    title: '完成提醒',
                    content: '是否确认“完成”此项，此项标题为【' + (item.name || item.content.homeworkName || item.content.script.desc) + '】',
                    onOk: () => {
                        this.sumbitTask(this.currentWorkID, periods.id, item.id, 'run', item)
                    }})
            },
            lastStep () {
                this.$Modal.confirm({
                    title: '回滚提醒',
                    content: '是否回滚到上一步',
                    onOk: () => {
                        this.loading = true
                        axios.get(`${util.wflowssh}/back/?id=${this.currentWorkID}`)
                            .then(res => {
                                if (res.data.code === 20000) {
                                    this.InitWork(res.data.data)
                                } else {
                                    util.err_notice(res.data.msg)
                                }
                                this.loading = false
                            }).catch(error => {
                            util.err_notice(error)
                            util.err_notice('内部错误!!请找后端程序员！！')
                        })
                    }})
            },
            getResult () {
                axios.get(`${util.wflowssh}/history/?id=${this.currentWorkID}`)
                    .then(res => {
                        if (res.data.code === 20000) {
                            this.currentResult = res.data.data[0]
                            this.workStep = this.currentResult.periods
                            if (!this.currentResult.complete) {
                                this.current = this.currentResult.pointer - 1
                            } else {
                                this.current = this.currentResult.periods.length
                                this.finishALl = true
                            }
                            // 作业状态初始化
                        } else {
                            util.err_notice(res.data.msg)
                        }
                        this.loading = false
                    }).catch(error => {
                    util.err_notice(error)
                    util.err_notice('内部错误!!请找后端程序员！！')
                })
            },
            // 判断是否有正常执行的作业
            judgeIFexecing () {
                let execIng = false
                for (let tt of this.currentResult.periods) {
                    for (let ii of tt.items) {
                        if (ii.status === 3 || (ii.status === 0 && ii.auto === true)) {
                            execIng = true
                        }
                    }
                }
                return execIng
            },
            Aqw  () {
                this.showTimeInterval = setInterval(() => {
                    if (this.judgeIFexecing()) {
                        this.Bqw();
                    }
                }, 2000)
            },
            Bqw () {
                this.getResult()
            }
        },
        created () {
            this.InitWork(this.$route.params.result)
            this.Aqw()
        },
        beforeDestroy () {
            clearInterval(this.showTimeInterval)
        }
    }
</script>
