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
    .layout{
        border: 1px solid #d7dde4;
        background: #f5f7f9;
        position: relative;
        border-radius: 4px;
        overflow: hidden;
    }
    .layout-logo{
        width: 100px;
        height: 30px;
        background: #5b6270;
        border-radius: 3px;
        float: left;
        position: relative;
        top: 15px;
        left: 20px;
    }
    .layout-nav{
        width: 420px;
        margin: 0 auto;
        margin-right: 20px;
    }
    .layout-footer-center{
        text-align: center;
    }
    @import '../../styles/common.less';
    @import '../Order/components/table.less';
</style>
<template>
    <div>
        <Row>
            <Col span="24" class="padding-left-10">
                <Card>
                    <div slot="title">
                        <Row>
                            <Col span="6">
                                <Button type="success" @click="changPromodel" icon="md-archive">转移至指定项目</Button>
                                <Button type="warning" @click="syndicAli" icon="md-aperture">同步阿里云和Agent</Button>
                            </Col>
                            <Col span="4" offset="12">
                                <Input v-model="searchCol">
                                    <span slot="prepend"><Icon type="search"></Icon></span>
                                </Input>
                            </Col>
                            <Col span="2">
                                <Button type="default" @click="searchTable">查询</Button>
                            </Col>
                        </Row>
                    </div>
                    <div class="edittable-table-height-con" style="height: 650px;overflow: auto ">

                        <Table :loading="loading" ref="selection" border :columns="columns1" :data="data1" @on-selection-change="selectHost"></Table>
                        <br>
                        <Page :total="totalPage" show-total show-elevator @on-change="changePage"></Page>

                    </div>

                </Card>
            </Col>
        </Row>

        <Modal v-model="changeInfodModal" :width="800" @on-ok="changePro">
            <h3 slot="header" style="color:#2D8CF0">请选择所属业务下的角色</h3>
            <Form :label-width="90">
                <FormItem label="所选服务器：">
                    <p v-for="host in addHostList">【{{ host.title }}】</p>
                </FormItem>
                <FormItem label="选择：">
                    <Cascader :data="proDataSelect" trigger="hover" @on-change="selectRole"></Cascader>
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
                loading: false,
                searchCol: '',
                addHostList: [],
                addHostListID: [],
                changeInfodModal: false,
                allsearchdata: [],
                totalPage: 1,
                currentRole: [],
                button1: '运维组',
                userText: '',
                baseData: [],
                baseSelectData: [],
                ruleInline: {
                    user: [
                        { required: true, message: 'Please fill in the user name', trigger: 'blur' }
                    ],
                    password: [
                        { required: true, message: 'Please fill in the password.', trigger: 'blur' },
                        { type: 'string', min: 6, message: 'The password length cannot be less than 6 bits', trigger: 'blur' }
                    ]
                },
                formInline: {
                    user: '',
                    password: ''
                },
                columns1: [
                    {
                        type: 'selection',
                        width: 60,
                        align: 'center'
                    },
                    {
                        title: 'ID',
                        key: 'id',
                        width: 100,
                        align: 'center'
                    },
                    {
                        title: '主机名',
                        key: 'instance_name'
                    },
                    {
                        title: 'cpu',
                        key: 'cpu'
                    },
                    {
                        title: '内存',
                        key: 'mem'
                    },
                    {
                        title: '外网IP',
                        key: 'ip'
                    },
                    {
                        title: '内网IP',
                        key: 'lan_ip'
                    },
                    {
                        title: '状态',
                        key: 'status',
                        render: (h, params) => {
                            const row = params.row;
                            const color = row.status === 'Running' ? 'success' : 'error';
                            const text = row.status === 'Running' ? '正在运行' : '停止使用';
                            return h('Tag', {
                                props: {
                                    type: 'dot',
                                    color: color
                                }
                            }, text)
                        }
                    }
                ],
                data1: [],
                proDataSelect: []
            }
        },

        methods: {
            selectRole (vl, vl2) {
                console.log(vl, vl2)
                this.currentRole = vl2
            },
            changPromodel (vl) {
                if (this.addHostList.length === 0) {
                    util.err_notice('请选择服务器')
                    return false
                }
                this.changeInfodModal = true
            },
            // 选择机器的时候触发的
            selectHost (vl) {
                this.addHostListID = []
                this.addHostList = vl
                for (var i = 0; i < vl.length; i++) {
                    this.addHostListID.push(vl[i].id)
                }
                console.log(this.addHostListID)
            },
            changePage (page) {
                console.log(page)
                // this.data1 = this.allsearchdata.slice(page * 10 - 10, page * 10)
                this.hostinit(this.searchCol, page * 10 - 10, 10)
            },
            proinit () {
                axios.post(`${util.url}/projects/?p=role`)
                    .then(res => {
                        if (res.data.code === 20000) {
                            let allresultList = []
                            for (var h = 0; h < res.data.data.length; h++) {
                                if (res.data.data[h].children.length !== 0) {
                                    res.data.data[h]['value'] = res.data.data[h]['id']
                                    res.data.data[h]['label'] = res.data.data[h]['name']
                                    for (var z = 0; z < res.data.data[h].children.length; z++) {
                                        res.data.data[h].children[z]['value'] = res.data.data[h].children[z]['id']
                                        res.data.data[h].children[z]['label'] = res.data.data[h].children[z]['name']
                                        delete res.data.data[h].children[z].children
                                    }
                                    allresultList.push(res.data.data[h])
                                }
                            }
                            this.proDataSelect = allresultList
                        } else {
                            util.err_notice(res.data.msg)
                        }
                    }).catch(error => {
                    util.err_notice(error)
                    util.ajanxerrorcode(this, error)
                })
            },
            hostinit (values = '', start = 0, end = 10) {
                if (values.length !== 0) {
                  var searchValue = `&q=${values}`
                } else {
                  searchValue = ''
                }
                this.loading = true
                axios.get(`${util.url}/hosts/?bind=0&offset=${start}&limit=${end}${searchValue}`)
                    .then(res => {
                        if (res.data.code === 20000) {
                            this.data1 = res.data.data
                            this.totalPage = res.data.count
                            // this.data1 = this.allsearchdata.slice(0, 10)
                            this.loading = false
                        } else {
                            util.err_notice(res.data.msg)
                        }
                    }).catch(error => {
                    util.err_notice(error)
                    util.ajanxerrorcode(this, error)
                })
            },
         changePro () {
             console.log(this.currentRole[1])
             let allList = this.addHostListID.concat(this.currentRole[1].host_ids)
             let postData = {'id': this.currentRole[1].id, 'project_id': this.currentRole[0].id, 'name': this.currentRole[1].name, 'desc': 'test', 'host_ids': allList}
             axios.post(`${util.url}/role/edit/`, postData)
                 .then(res => {
                     if (res.data.code === 20000) {
                         this.hostinit()
                         this.$Message.info('操作成功')
                     } else {
                         util.err_notice(res.data.msg)
                     }
                 }).catch(error => {
                 util.err_notice(error)
                 util.ajanxerrorcode(this, error)
             })
            },
         searchTable () {
                this.hostinit(this.searchCol)
            },
         syndicAli () {
             this.$Modal.info({
                 title: '同步',
                 content: '已发出同步请求，30秒后将会同步阿里云和Minion'
             });
             axios.get(`${util.url}/hosts/sync/`)
                 .then(res => {
                     if (res.data.code === 20000) {
                     } else {
                         util.err_notice(res.data.msg)
                     }
                 }).catch(error => {
                 util.err_notice(error)
                 util.ajanxerrorcode(this, error)
             })
         }
        },
        mounted () {
            this.hostinit()
            this.proinit()
        }
    }
</script>
