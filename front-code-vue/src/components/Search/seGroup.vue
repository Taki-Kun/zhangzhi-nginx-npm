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
                    <div slot="title">
                        <Row>
                            <Col span="2">
                                <Button><Icon type="ios-medkit-outline"></Icon>&nbsp安全组列表</Button>
                            </Col>
                            <Col span="4" offset="16">
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

                        <Table :loading="loading" ref="selection" border :columns="columns1" :data="data1"></Table>
                        <br>
                        <Page :total="totalPage" show-total show-elevator @on-change="changePage"></Page>

                    </div>

                </Card>
            </Col>
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
        name: 'seGroup',
        data () {
            return {
                searchCol: '',
                loading: false,
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
                        title: '名称',
                        key: 'name'
                    },
                    {
                        title: '描述',
                        key: 'desc'
                    },
                    {
                        title: '区域id',
                        key: 'region_id'
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
                                            this.show(params)
                                        }
                                    }
                                }, '规则管理')
                            ]);
                        }
                    }
                ],
                data1: []
            }
        },

        methods: {
            searchTable () {
                this.secuinit(0, 10, this.searchCol)
            },
            changePage (page) {
                this.secuinit(page * 10 - 10, 10, this.searchCol)
            },
            secuinit (start = 0, end = 10, values = '') {
                this.loading = true
                if (values.length !== 0) {
                    var searchValue = `&q=${values}`
                } else {
                    searchValue = ''
                }
                axios.get(`${util.url}/security_group/list/?offset=${start}&limit=${end}&q=${searchValue}`)
                    .then(res => {
                        if (res.data.code === 20000) {
                            this.data1 = res.data.data
                            this.totalPage = res.data.count
                        } else {
                            util.err_notice(res.data.msg)
                        }
                        this.loading = false
                    }).catch(error => {
                    util.err_notice(error)
                    util.ajanxerrorcode(this, error)
                })
            },
            show (vl) {
                this.$router.push({name: 'chanfirewall', params: {result: vl.row}})
            }
        },
        mounted () {
            this.secuinit(0, 10, this.searchCol)
        }
    }
</script>
