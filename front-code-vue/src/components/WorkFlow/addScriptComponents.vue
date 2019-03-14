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
    <div class="addScriptComponents" v-if="scriptModal">
        <Form :label-width="250">
            <!--<FormItem label="所属项目:">
                <Select v-model="formItem.project_id" @on-change="selectPro" style="width: 470px">
                    <Option v-for="item in proList" :value="item.id" :key="item.id">{{ item.name }}</Option>
                </Select>
            </FormItem>-->
            <FormItem label="执行脚本">
                <Select v-model="workStep[current].items[currentTaskId].content.script_id" style="width: 470px">
                    <Option v-for="script in scriptList" :value='script.id' :key="script.id">【{{script.project.name ? script.project.name : '公共模块'}}】{{script.name}}—{{script.desc}}</Option>
                </Select>
            </FormItem>
            <FormItem label="选择机器">
                <Card style="width:320px">
                    <Tree :data="baseData" show-checkbox @on-check-change="selectCheck"></Tree>
                </Card>
            </FormItem>
            <FormItem label="是否自动执行">
              <i-switch v-model="workStep[current].items[currentTaskId].auto" size="large">
                <span slot="open">是</span>
                <span slot="close">否</span>
              </i-switch>
            </FormItem>
        </Form>
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
        name: 'addScriptComponents',
        props: {
            formItem: {
            },
            workStep: Array,
            current: '',
            currentTaskId: '',
            scriptModal: Boolean
        },
        data () {
            return {
                baseData: [{
                    expand: true,
                    title: '服务器选择',
                    children: [],
                    top: 1
                }],
                scriptList: [],
                selectScript: ''
            }
        },
        methods: {
            testbutton () {
                console.log(this.workStep, this.scriptModal, this.current, this.currentTaskId, 111111111111111)
            },
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
                this.workStep[this.current].items[this.currentTaskId].content.minions = this.minion_list
            },
            selectPro () {
                // this.formItem.select = ''
                axios.get(`${util.url}/script/list/?project=${this.formItem.project}`)
                    .then(res => {
                        if (res.data.code === 20000) {
                            this.scriptList = res.data.data
                        }
                    }).catch(error => {
                    util.err_notice(error)
                    util.err_notice('内部错误，请找后端开发人员！')
                })
            },
            // execscript () {
            //     this.modal1 = true
            // },
            // ok () {
            //     this.loading = true
            //     axios.post(`${util.url}/script/run/`, {'id': this.formItem.select, 'minions': this.minion_list})
            //         .then(res => {
            //             if (res.data.code === 20000) {
            //                 // localStorage.setItem('currentHomeworkId', JSON.stringify(res.data.data))
            //                 this.$router.push({name: 'script-detail', params: {result: res.data.data}})
            //             } else {
            //                 util.err_notice(res.data.msg)
            //             }
            //             this.loading = false
            //         }).catch(error => {
            //         util.err_notice(error)
            //     })
            // },
            proInit (minionlist = '') {
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
                               //  this.allproject = res.data.data
                            }
                        }).catch(error => {
                        util.err_notice(error)
                    })
                }
        },
        mounted () {
           this.proInit()
        }
    }
</script>
