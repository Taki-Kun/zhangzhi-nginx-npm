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
                    CDN日志
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
        name: 'cdnLog',
        data () {
            return {
                loading: true,
                totalPage: 0,
                colums: [
                    {
                        title: 'id',
                        key: 'id',
                        width: 100
                    },
                    {
                        title: '类型',
                        key: 'type',
                        render: (h, params) => {
                            return h('div', [
                                h('strong', params.row.type)
                            ]);
                        }
                    },
                    {
                        title: '厂商',
                        key: 'platform',
                        render: (h, params) => {
                            return h('div', [
                                h('strong', params.row.platform)
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
                        title: '动作',
                        key: 'action',
                        render: (h, params) => {
                            let CDNaction = params.row.action === 'push' ? '预加热' : '刷新'
                            return h('div', [
                                h('strong', CDNaction)
                            ]);
                        }
                    },
                    {
                        title: '刷新时间',
                        key: 'create_at'
                    },
                    {
                        title: '刷新状态',
                        key: 'status',
                        render: (h, params) => {
                            const row = params.row;
                            const color = row.status === 'Success' || params.row.status === 'Complete' ? 'success' : 'warning';
                            const text = row.status === 'Success' || params.row.status === 'Complete' ? '成功' : '刷新中';
                            return h('Tag', {
                                props: {
                                    type: 'dot',
                                    color: color
                                }
                            }, text);
                        }
                    },
                    {
                        title: '链接',
                        key: 'content',
                        width: 300
                    }
                ],
                data1: []
            }
        },
        methods: {
            changePage (page) {
                console.log(page)
                this.cdnHistoryInit(page * 10 - 10, 10)
            },
            cdnHistoryInit (start = 0, end = 10) {
                this.loading = true
                axios.get(`${util.url}/cdn/logs/?offset=${start}&limit=${end}`)
                    .then(res => {
                        if (res.data.code === 20000) {
                            // console.log(res.data.data)
                            this.data1 = res.data.data
                            // this.data1 = this.allsearchdata.slice(0, 10)
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
            this.cdnHistoryInit()
        }
    }
</script>
