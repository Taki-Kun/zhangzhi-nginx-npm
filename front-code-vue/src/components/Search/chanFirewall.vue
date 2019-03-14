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
                                <Button type="success" @click="addRules"><Icon type="ios-medkit-outline"></Icon>&nbsp增加规则</Button>
                            </Col>
                        </Row>
                    </div>
                    <div class="edittable-table-height-con" style="height: 750px;overflow: auto ">
                        <span>安全组名称：【{{allresult.name}}】 描述：【{{allresult.desc}}】</span>
                        <Table :loading="loading" ref="selection" border :columns="columns1" :data="data1"></Table>
                        <br>
                         <!--<Page :total="totalPage" show-total show-elevator @on-change="changePage"></Page>-->

                    </div>

                </Card>
            </Col>
        </Row>

        <Modal v-model="addFireWallModal" :width="800" @on-ok="actionFirewall">
            <h3 slot="header" style="color:#2D8CF0">增加新规则</h3>
            <Form v-model="formItem" :label-width="120" label-position="right">
                <FormItem label="协议">
                    <RadioGroup v-model="formItem.protocol" type="button">
                        <Radio label="TCP"></Radio>
                        <Radio label="UDP"></Radio>
                        <Radio label="ICMP"></Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem label="IP网段">
                    <Input v-model="formItem.cidr" placeholder="如192.168.3.2/32"></Input>
                </FormItem>
                <FormItem label="端口范围">
                    <Input v-model="formItem.port_range" placeholder="如80/8080"></Input>
                </FormItem>
                <FormItem label="是否接受">
                    <i-switch v-model="formItem.policy" size="large">
                        <span slot="open">Accept</span>
                        <span slot="close">Drop</span>
                    </i-switch>
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
        name: 'chanFirewall',
        data () {
            return {
                loading: false,
                addFireWallModal: false,
                allresult: '',
                formItem: {
                    protocol: 'TCP',
                    cidr: '',
                    port_range: '',
                    policy: true
                },
                columns1: [
                    {
                        title: 'IP网段',
                        key: 'cidr',
                        width: 200,
                        align: 'center'
                    },
                    {
                        title: '出入方向',
                        key: 'direction'
                    },
                    {
                        title: '策略',
                        key: 'policy'
                    },
                    {
                        title: '端口范围',
                        key: 'port_range'
                    },
                    {
                        title: '协议',
                        key: 'protocol'
                    },
                    {
                        title: '操作',
                        key: 'action',
                        width: 150,
                        align: 'center',
                        render: (h, params) => {
                            return h('div', [
                                h('Button', {
                                    props: {
                                        type: 'error',
                                        size: 'small'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.delete(params)
                                        }
                                    }
                                }, '删除规则')
                            ]);
                        }
                    }
                ],
                data1: []
            }
        },
        methods: {
            addRules () {
                this.addFireWallModal = true
            },
            actionFirewall () {
                if (this.formItem.policy) {
                    this.formItem.policy = 'Accept'
                } else {
                    this.formItem.policy = 'Drop'
                }
                this.formItem.id = this.allresult.id
                axios.post(`${util.url}/security_group/add_rule/`, this.formItem)
                    .then(res => {
                        if (res.data.code === 20000) {
                            this.firewallInit(this.allresult.id)
                            this.$Message.info('新增规则成功！');
                        } else {
                            util.err_notice(res.data.msg)
                        }
                    }).catch(error => {
                    util.err_notice(error)
                    util.ajanxerrorcode(this, error)
                })
            },
            delete (vl) {
                this.$Modal.confirm({
                    title: '删除提醒',
                    content: '<p>是否删除网段【' + vl.row.cidr + '】的规则</p>',
                    onOk: () => {
                        axios.post(`${util.url}/security_group/delete_rule/`, {'id': this.allresult.id, 'index': vl.index}).then(res => {
                            if (res.data.code === 20000) {
                                this.firewallInit(this.allresult.id)
                                this.$Message.info('删除成功');
                            } else {
                                util.err_notice(res.data.msg)
                            }
                        }).catch(error => {
                            util.ajanxerrorcode(this, error)
                        })
                    }
                });
            },
            firewallInit (id) {
                this.loading = true
                axios.get(`${util.url}/security_group/list/?id=${id}`)
                    .then(res => {
                        if (res.data.code === 20000) {
                            console.log(res.data.data)
                            this.data1 = res.data.data[0].rules
                        } else {
                            util.err_notice(res.data.msg)
                        }
                        this.loading = false
                    }).catch(error => {
                    util.err_notice(error)
                    util.ajanxerrorcode(this, error)
                })
            }
        },
        mounted () {
            if (this.$route.params.result) {
                this.allresult = this.$route.params.result
                this.data1 = this.$route.params.result.rules
            }
        }
    }
</script>
