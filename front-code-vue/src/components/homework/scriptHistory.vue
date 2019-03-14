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
        name: 'scriptHistory',
        data () {
            return {
                startpage: '',
                endpage: '',
                loading: true,
                totalPage: 1,
                scriptObj: {
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
                        title: '脚本',
                        key: 'user',
                        render: (h, params) => {
                            return h('div', [
                                h('strong', params.row.script.name)
                            ]);
                        }
                    },
                    {
                        title: '脚本描述',
                        key: 'user',
                        render: (h, params) => {
                            return h('div', [
                                h('strong', params.row.script.desc)
                            ]);
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
                        key: 'created_time'
                    },
                   {
                       title: '状态',
                       key: 'status',
                       render: (h, params) => {
                           const row = params.row;
                           if (row.complete_time) {
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
                                    }, '详情')
                                ]
                            )
                        }
                    }
                ],
                data1: [],
                scriptInfodModal: false
            }
        },
        methods: {
            show (vl) {
                this.$router.push({name: 'script-detail', params: {result: vl.row}})
            },
            changePage (page) {
                console.log(page)
                this.scriptHistoryInit(page * 10 - 10, 10)
            },
            scriptHistoryInit (start = 0, end = 10) {
                this.startpage = start
                this.endpage = end
                this.loading = true
                axios.get(`${util.url}/script/logs/?offset=${start}&limit=${end}`)
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
            }
        },
        mounted () {
            this.scriptHistoryInit()
        }
    }
</script>
