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
                    <Icon type="android-walk"></Icon>&nbsp正在执行的流程
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
    import expandRow from './workTable-expand.vue';
    export default {
        components: {
            ICol, expandRow
        },
        name: 'DataBaseDic',
        data () {
            return {
                loading: false,
                totalPage: 0,

                colums: [
                    {
                        type: 'expand',
                        width: 50,
                        render: (h, params) => {
                            return h(expandRow, {
                                props: {
                                    row: params.row.logs
                                }
                            })
                        }
                    },
                    {
                        title: '工作ID',
                        key: 'id',
                        width: 100
                    },
                    {
                        title: '工作流名称',
                        key: 'name'
                    },
                    {
                        title: '项目',
                        key: 'project',
                        render: (h, params) => {
                            return h('div', [
                                h('strong', params.row.project.name)
                            ]);
                        }
                    },
                    {
                        title: '发起人',
                        key: 'user',
                        render: (h, params) => {
                            return h('div', [
                                h('strong', params.row.leader.name)
                            ]);
                        }
                    },
                    {
                        title: '是否完成',
                        key: 'complete',
                        render: (h, params) => {
                            // let color = params.row.complete === true ? 'success' : 'warning'
                            let color = ''
                            let text = ''
                            // let text = params.row.complete === true ? '已完成' : '正在进行'
                            if (params.row.complete === true) {
                                color = 'success'
                                text = '已完成'
                            } else {
                                if (params.row.status < 0) {
                                   color = 'error'
                                   text = '已关闭'
                                } else {
                                   color = 'warning'
                                   text = '正在进行'
                                }
                            }
                            return h('Tag', {
                                props: {
                                    color: color
                                }
                            }, text);
                        }
                    },
                    {
                        title: '创建时间',
                        key: 'created_time'
                    },
                    {
                        title: '操作',
                        key: 'action',
                        align: 'center',
                        width: 100,
                        render: (h, params) => {
                            if (params.row.status > 0) {
                              return h('div', [
                                h('Button', {
                                  props: {
                                    type: 'primary',
                                    size: 'small'
                                  },
                                  on: {
                                    click: () => {
                                      this.runCall(params.index)
                                    }
                                  }
                                }, '查看')
                              ]);
                            } else {
                              return h('div', [
                                h('Button', {
                                  props: {
                                    type: 'primary',
                                    size: 'small',
                                    disabled: true
                                  }
                                }, '查看')
                              ]);
                            }
                        }
                    }
                ],
                data1: [
                ]
            }
        },
        methods: {
            runCall (vl) {
                this.$router.push({name: 'execWorkList', params: {result: this.data1[vl]}})
            },
            changePage () {
            },
            Processing () {
                this.loading = true
                axios.get(`${util.wflowssh}/history/`)
                    .then(res => {
                        if (res.data.code === 20000) {
                            this.data1 = res.data.data
                        } else {
                            util.err_notice(res.data.msg)
                        }
                        this.loading = false
                    }).catch(error => {
                    util.err_notice(error)
                    util.err_notice('内部错误，请找后端管理员')
                })
            }
        },
        mounted () {
            this.Processing()
        }
    }
</script>
