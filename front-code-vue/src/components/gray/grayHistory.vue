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
                    灰度发布记录
                </p>
                <Row>
                    <Col span="24">

                        <Table :loading="loading" border :columns="colums" :data="data1" stripe ref="selection"
                        ></Table>

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
        name: 'grayHistory',
        data () {
            return {
                data1: [],
                loading: false,
                colums: [
                    {
                        title: 'id',
                        key: 'id',
                        width: 100
                    },
                    {
                        title: '执行环境',
                        key: 'env'
                    },
                    {
                        title: '操作时间',
                        key: 'created_time'
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
                        title: '操作类型',
                        key: 'type'
                    },
                    {
                        title: '操作参数',
                        key: 'value'
                    }
                ]
            }
        },
        methods: {
            initGrayHistory () {
                    this.loading = true
                    axios.get(`${util.stage}/logs/`)
                        .then(res => {
                            if (res.data.code === 20000) {
                                this.data1 = res.data.data
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
            this.initGrayHistory()
        }
    }
</script>
