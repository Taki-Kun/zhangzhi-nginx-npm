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
        <Modal v-model="modal2" width="1360">
            <p slot="header" style="color:#f60;text-align:center">
                <Icon type="information-circled"></Icon>
                <span>执行SQL</span>
            </p>
            <div style="text-align:center">
                {{execsql}}
            </div>
            <div slot="footer">
            </div>
        </Modal>
    </div>
</template>



<script>
    import ICol from '../../../node_modules/iview/src/components/grid/col.vue'
    import util from '../../libs/util'
    import axios from 'axios'
    import expandRow from './dataTable-expand.vue';
    export default {
        components: {
            ICol, expandRow
        },
        name: 'DataBaseDic',
        data () {
            return {
                execsql: '',
                startpage: '',
                endpage: '',
                loading: true,
                modal2: false,
                allsearchdata: [],
                totalPage: 1,
                actionName: '添加sql模块',
                sqlObj: {
                    id: '',
                    name: '',
                    func: '',
                    args: ''
                },
                sqldefaultObj: {
                    id: '',
                    name: '',
                    func: '',
                    args: ''
                },
                colums: [
                    {
                        type: 'expand',
                        width: 50,
                        render: (h, params) => {
                            return h(expandRow, {
                                props: {
                                    row: params.row
                                }
                            })
                        }
                    },
                    {
                        title: 'id',
                        key: 'id',
                        align: 'center',
                        width: 100
                    },
                    {
                        title: '项目',
                        key: 'db_name',
                        align: 'center',
                        render: (h, params) => {
                            return h('div', [
                                h('strong', params.row.db.project.name)
                            ]);
                        }
                    },
                    {
                        title: '连接名称',
                        key: 'db_name',
                        align: 'center',
                        render: (h, params) => {
                            return h('div', [
                                h('strong', params.row.db.name)
                            ]);
                        }
                    },
                    {
                        title: '查询数据库',
                        align: 'center',
                        key: 'db_name'
                    },
                    {
                        title: '执行人',
                        align: 'center',
                        key: 'user',
                        render: (h, params) => {
                            return h('div', [
                                h('strong', params.row.user.name)
                            ]);
                        }
                    },
                    {
                        title: '查询时间',
                        align: 'center',
                        key: 'create_at'
                    }
                ],
                data1: [],
                sqlInfodModal: false
            }
        },
        methods: {
            show (vl) {
               if (this.data1[vl].sql.length === 0) {
                   this.execsql = '【错误码】' + this.data1[vl].error[0] + '【错误详情】' + this.data1[vl].error[1]
               } else {
                   this.execsql = this.data1[vl].sql
               }
               this.modal2 = true
            },
            changePage (page) {
                console.log(page)
                this.sqlHistoryInit(page * 10 - 10, 10)
            },
            sqlHistoryInit (start = 0, end = 10) {
                this.loading = true
                axios.get(`${util.url}/db/logs/?offset=${start}&limit=${end}`)
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
            this.sqlHistoryInit()
        }
    }
</script>
