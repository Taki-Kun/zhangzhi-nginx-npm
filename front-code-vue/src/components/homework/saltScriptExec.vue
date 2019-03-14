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
                    执行脚本
                </p>
                <Row>
                    <Col span="7" offset="5">
                        <Form :model="formItem" :label-width="150">
                            <FormItem label="所属项目:">
                                <!--<Input v-model='scriptObj.project_id' placeholder="请输入功能名称"></Input>-->
                                <Select v-model="formItem.project_id" @on-change="selectPro" style="width: 470px">
                                    <Option v-for="item in proList" :value="item.id" :key="item.id">{{ item.name }}</Option>
                                </Select>
                            </FormItem>
                            <FormItem label="执行脚本">
                                <Select v-model="formItem.select" style="width: 470px">
                                    <Option v-for="commend in commendList" :value='commend.id' :key="commend.id">【{{commend.project.name ? commend.project.name : '公共模块'}}】{{commend.name}}—{{commend.func}}</Option>
                                </Select>
                            </FormItem>
                            <FormItem label="选择机器">
                                <Card style="width:320px">
                                    <Tree :data="baseData" show-checkbox @on-check-change="selectCheck"></Tree>
                                </Card>
                            </FormItem>
                            <FormItem>
                                <Button type="primary" @click="execscript">运行</Button>
                            </FormItem>
                        </Form>
                    </col>
                </Row>
            </Card>
        </Row>

        <Modal v-model="modal1"
               title="需要操作的业务下的机器如下，请确认仔细后点击确定"
               @on-ok="ok">
            <p v-for="val in showMinionList">{{val}}</p>
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
        name: 'saltScriptExec',
        data () {
            return {
                proList: [],
                project: '',
                modal1: false,
                commendList: '',
                baseData: [{
                    expand: true,
                    title: '服务器选择',
                    children: [],
                    top: 1
                }],
                showMinionList: [],
                minion_list: [],
                execAgainMinion: [],
                formItem: {
                    project_id: '',
                    select: ''
                }
            }
        },
        methods: {
            selectCheck (vl) {
                this.minion_list = []
                this.showMinionList = []
                for (var i = 0; i < vl.length; i++) {
                    if (vl[i].minion_id && vl[i].minion_id.length !== 0) {
                        this.minion_list.push(vl[i].minion_id)
                        this.showMinionList.push(`【${vl[i].project_name}】` + vl[i].title)
                    }
                }
                this.minion_list = Array.from(new Set(this.minion_list))
            },
            selectPro (vl) {
                this.formItem.select = ''
                axios.get(`${util.url}/script/list/?project=${vl}`)
                    .then(res => {
                        if (res.data.code === 20000) {
                            this.commendList = res.data.data
                        }
                    }).catch(error => {
                    util.err_notice(error)
                    util.err_notice('内部错误，请找后端开发人员！')
                })
            },
            execscript () {
                this.modal1 = true
            },
            ok () {
                axios.post(`${util.url}/job/action/go/`, {'action_id': this.formItem.select, 'minions': this.minion_list, 'clp': this.formItem.clp, 'pillar': this.formItem.pillar})
                    .then(res => {
                        if (res.data.code === 20000) {
                            localStorage.setItem('currentHomeworkId', JSON.stringify(res.data.data))
                            this.$router.push({name: 'script-detail', params: {result: res.data.data}})
                        } else {
                            util.err_notice(res.data.msg)
                        }
                    }).catch(error => {
                    util.err_notice(error)
                })
            }
        },
        mounted () {
            axios.get(`${util.url}/projects/?p=job-schedule`)
                .then(res => {
                    if (res.data.code === 20000) {
                        this.proList = res.data.data
                        this.baseData[0].children = res.data.data
                        for (var i = 0; i < this.baseData[0].children.length; i++) {
                            for (var g = 0; g < this.baseData[0].children[i].children.length; g++) {
                                for (var h = 0; h < this.baseData[0].children[i].children[g].children.length; h++) {
                                    if (this.baseData[0].children[i].children[g].children[h].minion_id.length === 0) {
                                        this.baseData[0].children[i].children[g].children[h].disableCheckbox = true
                                        this.baseData[0].children[i].children[g].children[h].disabled = true
                                    } else {
                                        if (this.$route.params.result) {
                                            if (this.$route.params.result.tasks[0].minions.includes(res.data.data[i].children[g].children[h].minion_id)) {
                                                this.execAgainMinion.push(res.data.data[i].children[g].children[h])
                                                this.baseData[0].children[i].children[g].children[h].checked = true
                                            }
                                        }
                                    }
                                }
                            }
                            // this.baseData[0].children[i].expand = true
                        }
                    }
                }).catch(error => {
                util.err_notice(error)
            })
        }
    }
</script>
