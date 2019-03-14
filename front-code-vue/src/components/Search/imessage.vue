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
    .demo-spin-icon-load{
        animation: ani-demo-spin 1s linear infinite;
    }
    @keyframes ani-demo-spin {
        from { transform: rotate(0deg);}
        50%  { transform: rotate(180deg);}
        to   { transform: rotate(360deg);}
    }
    .demo-spin-col{
        height: 100px;
        position: relative;
        border: 1px solid #eee;
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
                    用户消息发送
                </p>
                <Row>
                    <Col span="7" offset="5">
                        <Form :label-width="150">
                            <FormItem :model='formItem' label="选择组:">
                                <Select v-model="formItem.recipients" style="width: 470px" multiple filterable placeholder="请选择用户...">
                                    <Option  v-for="val in groupList" :value="val.id"  :key="val.name">{{val.name}}</Option>
                                </Select>
                            </FormItem>
                            <FormItem label="消息内容">
                                <Input v-model="formItem.msg" type="textarea" placeholder="请输入消息内容" :autosize="{minRows: 9,maxRows: 16}" style="width: 480px;"></Input>
                            </FormItem>
                            <FormItem>
                                <Button type="primary" @click="sumbitMess" icon="md-send">发送</Button>
                            </FormItem>
                        </Form>
                    </col>
                    <Spin fix v-if="loading">
                        <Icon type="load-c" size=18 class="demo-spin-icon-load"></Icon>
                        <div>提交中...</div>
                    </Spin>
                </Row>
            </Card>
        </Row>
        <br>
        <Row>
            <Card>
                <div slot="title">
                    <Button type="primary" ghost @click="addGroup">添加自定义组</Button>
                </div>
                <Row>
                    <Table :columns="columns1" :data="groupList"></Table>
                </Row>
            </Card>
        </Row>

        <Modal
                v-model="showMess"
               title="发送状态">
            <p>发送成功！！</p>
        </Modal>

        <Modal v-model="value1"
               title="组编辑"
               @on-ok="ok"
               width="800">
            <Form :model="groupItem" :label-width="80">
                <FormItem label="组名称">
                    <Input v-model="groupItem.name" placeholder="自定义组名称..."></Input>
                </FormItem>
                 <FormItem label="选择用户:">
                     <Select v-model="groupItem.user_ids" multiple filterable placeholder="请选择用户...">
                         <Option  v-for="val in userList" :value="val.id"  :key="val.name">{{val.name}}</Option>
                     </Select>
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
        name: 'imessage',
        data () {
            return {
                value1: false,
                loading: false,
                showMess: false,
                userVal: '',
                userList: [],
                groupList: [],
                formItem: {
                    recipients: [],
                    msg: ''
                },
                groupItem: {
                    user_ids: [],
                    name: ''
                },
                user_ids: [],
                columns1: [
                    {
                        title: 'id',
                        key: 'id'
                    },
                    {
                        title: 'name',
                        key: 'name'
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
                                        type: 'primary',
                                        size: 'small'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.show(params.row)
                                        }
                                    }
                                }, '编辑'),
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
                                            this.del(params.row)
                                        }
                                    }
                                }, '删除')
                            ]);
                        }
                    }
                ]
            }
        },
        methods: {
            del (vl) {
                this.$Modal.confirm({
                    title: '删除提醒',
                    content: '<p>是否删除组【' + vl.name + '】</p>',
                    onOk: () => {
                        axios.get(`${util.url}/im/delete/?id=${vl.id}`)
                            .then(res => {
                                if (res.data.code === 20000) {
                                    this.groupInit()
                                } else {
                                    util.err_notice(res.data.msg)
                                }
                            }).catch(error => {
                            util.err_notice(error)
                            util.err_notice('后端错误，请找后端开发人员')
                        })
                    }
                });
            },
            show (vl) {
                this.value1 = true
                this.groupItem.name = vl.name
                this.groupItem.user_ids = []
                this.groupItem.id = vl.id
                for (let uu of vl.users) {
                    this.groupItem.user_ids.push(uu.id)
                }
            },
            addGroup () {
                this.groupItem.name = ''
                this.groupItem.user_ids = []
                this.value1 = true
            },
            sumbitMess () {
                this.loading = true
                axios.post(`${util.url}/im/`, this.formItem)
                    .then(res => {
                        if (res.data.code === 20000) {
                            this.showMess = true
                            this.loading = false
                        } else {
                            util.err_notice(res.data.msg)
                        }
                    }).catch(error => {
                    this.loading = false
                    util.err_notice(error)
                    util.err_notice('后端错误，请找后端开发人员')
                })
            },
            userInit () {
                axios.get(`${util.url}/users/`)
                    .then(res => {
                        if (res.data.code === 20000) {
                              this.userList = res.data.data
                        } else {
                            util.err_notice(res.data.msg)
                        }
                    }).catch(error => {
                    util.err_notice(error)
                    util.err_notice('后端错误，请找后端开发人员')
                })
            },
            groupInit () {
                axios.get(`${util.url}/im/groups/`)
                    .then(res => {
                        if (res.data.code === 20000) {
                            this.groupList = res.data.data
                        } else {
                            util.err_notice(res.data.msg)
                        }
                    }).catch(error => {
                    util.err_notice(error)
                    util.err_notice('后端错误，请找后端开发人员')
                })
            },
            ok () {
                axios.post(`${util.url}/im/edit/`, this.groupItem)
                    .then(res => {
                        if (res.data.code === 20000) {
                            this.$Message.info('操作成功！！');
                            this.groupInit()
                        } else {
                            util.err_notice(res.data.msg)
                        }
                    }).catch(error => {
                    util.err_notice(error)
                    util.err_notice('后端错误，请找后端开发人员')
                })
            }
        },
        mounted () {
            this.userInit()
            this.groupInit()
        }
    }
</script>
