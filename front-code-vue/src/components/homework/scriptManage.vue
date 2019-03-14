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
    pre {
        display: block;
        overflow: auto;
        color:#abb2bf;
        background:#282c34;
        padding: 5px 10px;
        border: 1px solid #eee;
        word-wrap:break-word;
    }
    .vertical-center-modal{
        display: flex;
        align-items: center;
        justify-content: center;

        .ivu-modal{
            top: 0;
        }
    }
    @import '../../styles/common.less';
    @import '../Order/components/table.less';
</style>
<template>
    <div>
        <Row>
            <Card>
                <div slot="title">
                    <Row>
                        <Col span="3">
                            <i-button type="success" @click="addscript" icon="md-add-circle">添加脚本</i-button>
                        </Col>
                        <!--<Col span="3" offset="9">
                            <Select v-model="model1" style="width:250px" @on-change="filterPro" filterable label-in-value placeholder="请选择相应项目">
                                <Option v-for="item in proList" :value="item.id" :key="item.name">{{ item.name }}</Option>
                            </Select>
                        </Col>
                        <Col span="4" offset="1">
                            <Input v-model="searchCol">
                                <span slot="prepend"><Icon type="search"></Icon></span>
                            </Input>
                        </Col>
                        <Col span="2">
                            <Button type="default" @click="searchTable">查询</Button>
                        </Col>-->
                    </Row>
                </div>
                <Row>
                    <Col span="24">

                        <Table border :loading="loading" :columns="colums" :data="data1" stripe ref="selection"
                        ></Table>
                        <br>
                        <Page :total="totalPage" show-total show-elevator @on-change="changePage"></Page>

                    </Col>
                </Row>
            </Card>
        </Row>

        <Modal v-model="scriptInfodModal" :width="1050" :mask-closable="false" class-name="vertical-center-modal">
            <h3 slot="header" style="color:#2D8CF0">{{actionName}}</h3>
            <Form  :model="formItem" :label-width="120" label-position="right">
                <FormItem label="所属项目:">
                    <Select v-model="formItem.project_id">
                        <Option v-for="item in proList" :value="item.id" :key="item.id">{{ item.name }}</Option>
                    </Select>
                </FormItem>
                    <FormItem label="脚本名称">
                        <Input v-model="formItem.name" placeholder="请输入脚本名称..." disabled></Input>
                    </FormItem>
                    <FormItem label="脚本描述">
                        <Input v-model="formItem.desc" type="textarea" placeholder="请输入脚本描述..."></Input>
                    </FormItem>
                    <FormItem label="上传文件">
                        <template>
                            <div>
                                <Upload
                                        ref="uploadButton"
                                        :before-upload="handleBeforeUpload"
                                        action="//jsonplaceholder.typicode.com/posts/">
                                    <Button icon="ios-cloud-upload-outline">选择脚本</Button>
                                </Upload>
                                <div v-for="(zz, index) in files">
                                    {{zz.name}}
                                </div>
                            </div>
                        </template>
                    </FormItem>
                <FormItem label="脚本内容">
                   <pre style="height: 300px;">
{{formItem.content}}
                   </pre>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="primary" @click="sumbit()">上传</Button>
            </div>
        </Modal>

        <Modal v-model="modal2" width="360">
            <p slot="header">
                <!--<Icon type="information-circled"></Icon>-->
                <span>审核</span>
            </p>
            <div style="text-align:center">
                <p>审核将决定脚本是否可用！！</p>
            </div>
            <div slot="footer">
                <Button type="primary" @click="scriptPass(1)">通过</Button>
                <Button type="error" @click="scriptPass(-1)">驳回</Button>
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
        name: 'scriptManage',
        data () {
            return {
                actionName: '脚本详情',
                files: [],
                modal2: false,
                formItem: {
                    id: '',
                    project_id: '',
                    name: '',
                    desc: '',
                    content: ''
                },
                scriptInfodModal: false,
                proList: [],
                model1: '',
                searchCol: '',
                loading: false,
                colums: [
                    {
                        title: '所属项目',
                        key: 'name',
                        render: (h, params) => {
                                return h('span', params.row.project.name)
                        }
                    },
                    {
                        title: '文件名称',
                        key: 'name'
                    },
                    {
                        title: '功能描述',
                        key: 'desc'
                    },
                    {
                        title: '创建人',
                        key: 'user',
                        render: (h, params) => {
                            return h('div', [
                                h('strong', params.row.user.name)
                            ]);
                        }
                    },
                    {
                        title: '操作记录',
                        key: 'user',
                        render: (h, params) => {
                            let userStr = ''
                            for (let ii of params.row.ship_users) {
                                if (ii.action === 1) {
                                    userStr = userStr + ii.user.name + '【通过】' + ' '
                                } else if (ii.action === -1) {
                                    userStr = userStr + ii.user.name + '【驳回】' + ' '
                                }
                            }
                            return h('div', [
                                h('strong', userStr)
                            ]);
                        }
                    },
                         {
                             title: '状态',
                             key: 'status',
                             render: (h, params) => {
                                 const row = params.row;
                                 const color = row.status === 1 ? 'primary' : row.status === -1 ? 'error' : 'warning';
                                 const text = row.status === 1 ? '通过' : row.status === -1 ? '驳回' : '未审核';

                                 return h('Tag', {
                                     props: {
                                         type: 'dot',
                                         color: color
                                     }
                                 }, text);
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
                                             this.show(params.row)
                                         }
                                     }
                                 }, '修改'),
                                 h('Button', {
                                     props: {
                                         type: 'warning',
                                         size: 'small'
                                     },
                                     style: {
                                         marginRight: '5px'
                                     },
                                     on: {
                                         click: () => {
                                             this.pass(params.row)
                                         }
                                     }
                                 }, '审核'),
                                 h('Button', {
                                     props: {
                                         type: 'error',
                                         size: 'small'
                                     },
                                     on: {
                                         click: () => {
                                             this.remove(params.row)
                                         }
                                     }
                                 }, '删除')
                             ]);
                         }
                     }
                ],
                data1: [],
                totalPage: 1
            }
        },
        methods: {
            scriptPass (ifpass) {
                axios.post(`${util.url}/script/ship/`, {id: this.formItem.id, action: ifpass})
                    .then(res => {
                        if (res.data.code === 20000) {
                            this.$Message.info('操作成功！！')
                            this.scriptInit()
                        } else {
                            util.err_notice(res.data.msg)
                        }
                        this.modal2 = false
                    }).catch(error => {
                    util.ajanxerrorcode(this, error)
                    util.err_notice('后端报错，请找后端开发人员')
                })
            },
            pass (vl) {
                this.formItem = {id: vl.id, name: vl.name, desc: vl.desc, content: vl.content}
                this.formItem.project_id = vl.project.id
                this.modal2 = true
            },
            show (vl) {
                this.files = []
                this.formItem = {id: vl.id, name: vl.name, desc: vl.desc, content: vl.content}
                this.formItem.project_id = vl.project.id
                this.scriptInfodModal = true
            },
            remove (vl) {
                this.$Modal.confirm({
                    title: '删除提醒',
                    content: '<p>是否删除脚本【' + vl.name + '】</p>',
                    onOk: () => {
                        axios.get(`${util.url}/script/delete/?id=${vl.id}`)
                            .then(res => {
                                if (res.data.code === 20000) {
                                    this.$Message.info('操作成功！！')
                                    this.scriptInit()
                                } else {
                                    util.err_notice(res.data.msg)
                                }
                            }).catch(error => {
                            util.ajanxerrorcode(this, error)
                            util.err_notice('后端报错，请找后端开发人员')
                        })
                    }
                });
            },
            addscript () {
                this.scriptInfodModal = true
                this.formItem = {id: '', project_id: '', name: '', desc: '', content: ''}
                this.files = []
            },
            changePage () {
            },
            scriptInit (start = 0, end = 10) {
                this.loading = true
                axios.get(`${util.url}/script/list/?offset=${start}&limit=${end}`)
                    .then(res => {
                        if (res.data.code === 20000) {
                            this.data1 = res.data.data
                            this.totalPage = res.data.count
                            this.loading = false
                        } else {
                            util.err_notice(res.data.msg)
                        }
                    }).catch(error => {
                    util.ajanxerrorcode(this, error)
                    util.err_notice('后端报错，请找后端开发人员')
                })
            },
            proinit () {
                axios.post(`${util.url}/projects/?p=job-action`)
                    .then(res => {
                        if (res.data.code === 20000) {
                            this.proList = res.data.data
                        } else {
                            util.err_notice(res.data.msg)
                        }
                    }).catch(error => {
                    util.ajanxerrorcode(this, error)
                })
            },
            filterPro () {
            },
            searchTable () {
            },
            handleBeforeUpload (file) {
                // 再次点击上传之前，清空之前已上传文件
                this.files = []
                // 创建一个 FileReader 对象
                let reader = new FileReader()
                // readAsDataURL 方法用于读取指定 Blob 或 File 的内容
                // 当读操作完成，readyState 变为 DONE，loadend 被触发，此时 result 属性包含数据：URL（以 base64 编码的字符串表示文件的数据）
                // 读取文件作为 URL 可访问地址
                reader.readAsText(file)
                const _this = this
                reader.onloadend = function (e) {
                    _this.formItem.content = reader.result
                    _this.formItem.name = file.name
                    _this.files.push(file)
                }
                return false
            },
            sumbit () {
                axios.post(`${util.url}/script/upload/`, this.formItem)
                    .then(res => {
                        if (res.data.code === 20000) {
                            this.scriptInfodModal = false
                            this.$Message.info('操作成功！！')
                            this.scriptInit()
                        } else {
                            util.err_notice(res.data.msg)
                        }
                    }).catch(error => {
                    util.err_notice(error)
                    util.err_notice('后端报错，请找后端开发人员')
                })
            }
        },
        mounted () {
            this.scriptInit()
            this.proinit()
        }
    }
</script>
