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
            <Col span="24" class="padding-left-10">
                <Card>
                    <p slot="title">
                        <Icon type="ios-redo"></Icon>SLB信息
                    </p>
                    <div class="edittable-table-height-con" style="height: 650px;overflow: auto ">

                        <Table :loading="loading" ref="selection" border :columns="columns1" :data="data1" @on-selection-change="selectHost"></Table>
                        <br>
                        <Page :total="totalPage" show-total show-elevator @on-change="changePage"></Page>

                    </div>

                </Card>
            </Col>
        </Row>

        <Modal v-model="changeInfodModal" :width="1000">
            <h3 slot="header" style="color:#2D8CF0">监听器和后端服务器信息</h3>
            <Timeline pending>
                <TimelineItem>监听器信息</TimelineItem>
            </Timeline>
            <Table border :columns="columns2" :data="data2"></Table>
            <br>
            <Timeline pending>
                <TimelineItem>后端服务器信息</TimelineItem>
            </Timeline>
            <Table border :columns="columns3" :data="data3"></Table>
            <div slot="footer">
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
                loading: false,
                addHostList: [],
                addHostListID: [],
                changeInfodModal: false,
                allsearchdata: [],
                totalPage: 1,
                currentRole: [],
                columns1: [
                    {
                        title: 'ID',
                        key: 'id',
                        width: 100,
                        align: 'center'
                    },
                    {
                        title: '实例ID',
                        key: 'slb_id'
                    },
                    {
                        title: '名称',
                        key: 'name'
                    },
                    {
                        title: '区域id',
                        key: 'region_id'
                    },
                    {
                        title: 'IP',
                        key: 'ip'
                    },
                    {
                        title: '状态',
                        key: 'status',
                        render: (h, params) => {
                            const row = params.row;
                            const color = row.status === 'active' ? 'success' : 'error';
                            const text = row.status === 'active' ? '正在运行' : '停止使用';
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
                                            this.show(params.index)
                                        }
                                    }
                                }, '查看')
                            ]);
                        }
                    }
                ],
                data1: [],
                columns2: [
                    {
                        title: 'ID',
                        key: 'id',
                        width: 100,
                        align: 'center'
                    },
                    {
                        title: '协议',
                        key: 'protocol'
                    },
                    {
                        title: '前端端口',
                        key: 'frontend_port'
                    },
                    {
                        title: '后端端口',
                        key: 'backend_port'
                    },
                    {
                        title: '状态',
                        key: 'status',
                        render: (h, params) => {
                            const row = params.row;
                            const color = row.status === 'running' ? 'success' : 'error';
                            const text = row.status === 'running' ? '正在运行' : '停止使用';
                            return h('Tag', {
                                props: {
                                    type: 'dot',
                                    color: color
                                }
                            }, text)
                        }
                    }
                ],
                data2: [],
                columns3: [
                    {
                        title: 'ID',
                        key: 'id',
                        width: 100,
                        align: 'center'
                     },
                    {
                        title: '主机名',
                        key: 'instance_name',
                        render: (h, params) => {
                            return h('span', params.row.instance.instance_name)
                        }
                    },
                    {
                        title: '权重',
                        key: 'weight',
                        render: (h, params) => {
                            return h('span', params.row.weight)
                        }
                    },
                    {
                        title: '状态',
                        key: 'status',
                        render: (h, params) => {
                            const row = params.row.instance;
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
                data3: []
            }
        },
        methods: {
            selectRole (vl, vl2) {
                console.log(vl, vl2)
                this.currentRole = vl2
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
                // console.log(page)
                this.data1 = this.allsearchdata.slice(page * 10 - 10, page * 10)
            },
            hostinit () {
                this.loading = true
                axios.get(`${util.url}/slb/list/?offset=0&limit=300`)
                    .then(res => {
                        if (res.data.code === 20000) {
                            this.allsearchdata = res.data.data
                            this.totalPage = res.data.data.length
                            this.data1 = this.allsearchdata.slice(0, 10)
                            this.loading = false
                        } else {
                            util.err_notice(res.data.msg)
                        }
                    }).catch(error => {
                    util.err_notice(error)
                    util.ajanxerrorcode(this, error)
                })
            },
            show (vl) {
                this.data2 = this.data1[vl].listeners
                this.data3 = this.data1[vl].backends
                this.changeInfodModal = true
            },
            changePro () {
                // console.log(this.currentRole[1])
                // let allList = this.addHostListID.concat(this.currentRole[1].host_ids)
                // let postData = {'id': this.currentRole[0].id, 'project_id': this.currentRole[1].id, 'name': this.currentRole[1].name, 'desc': 'test', 'host_ids': allList}
                // axios.post(`${util.url}/role/edit/`, postData)
                //     .then(res => {
                //         if (res.data.code === 20000) {
                //             this.hostinit()
                //             this.$Message.info('操作成功')
                //         } else {
                //             util.err_notice(res.data.msg)
                //         }
                //     }).catch(error => {
                //     util.err_notice(error)
                //     util.ajanxerrorcode(this, error)
                // })
            }
        },
        mounted () {
            this.hostinit()
        }
    }
</script>
