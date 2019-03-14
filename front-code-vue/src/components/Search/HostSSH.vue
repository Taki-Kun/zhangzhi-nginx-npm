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
            <Col span="5">
                <Card>
                    <p slot="title">
                        <Icon type="ios-redo"></Icon>
                        连接服务器
                    </p>
                         <Scroll height="600">
                             <Tree :data="baseData" @on-select-change="selectHost" empty-text="数据加载中..."></Tree>
                         </Scroll>
                </Card>
            </Col>
            <Col span="19" class="padding-left-10">
                <Card>
                    <p slot="title">
                        <Icon type="ios-redo"></Icon>webssh连接【10分钟会话超时】
                    </p>
                    <Tabs type="card" closable @on-tab-remove="handleTabRemove" @on-click="handleTab" :value="JSON.stringify(parseInt(currentIndex))" :animated="false">
                        <TabPane :name="JSON.stringify(terminal.pid)" :label="terminal.inner_ip ? (terminal.inner_ip + '【' + JSON.stringify(terminal.pid + 1) + '】') : '请选择连接'" v-for="terminal in terminalList" v-if="terminal.tab">
                            <div class="console" :id="'terminal-' + JSON.stringify(terminal.pid)"></div>
                        </TabPane>
                    </Tabs>
                </Card>
                <Spin fix v-if="loading"></Spin>
            </Col>
        </Row>

        <Modal v-model="hostInfodModal" :width="800" @on-ok="sumbitWebSock">
            <h3 slot="header" style="color:#2D8CF0">连接的机器信息为【{{connectHost.title}}】（游戏业务：【{{connectHost.project_name}}】）</h3>
            <Form :model="formItem" :label-width="90">
                    <FormItem label="登陆账号">
                        <Input v-model="formItem.account" placeholder="请输入登陆账号"></Input>
                    </FormItem>
                    <FormItem label="登陆密码">
                         <Input type="password" v-model="formItem.password"></Input>
                    </FormItem>
            </Form>

        </Modal>


    </div>
</template>
<script>
    import ICol from '../../../node_modules/iview/src/components/grid/col.vue'
    import util from '../../libs/util'
    import axios from 'axios'
    import Terminal from '../../libs/Xterm'
    // import hotkeys from 'hotkeys-js';
    export default {
        components: {
            ICol
        },
        name: 'DataBaseDic',
        data () {
            return {
                captureValue: true,
                loading: false,
                currentIndex: '0',
                term: null,
                terminalSocket: null,
                scrollWidth: '',
                formItem: {
                    account: '',
                    password: ''
                },
                terminalList: [
                       {
                       pid: 0,
                        name: 'terminal',
                        cols: 80,
                        rows: 41,
                        inner_ip: '',
                        tab: true
                   }
                  ],
                tab0: true,
                connectHost: {},
                hostInfodModal: false,
                allsearchdata: [],
                baseData: [],
                terminalContainer: '',
                tabIndex: ''
            }
        },
        methods: {
            handleTab (vl) {
               this.currentIndex = vl
            },
            handleTabRemove (vl) {
                if (this.terminalList.length === 1) {
                    window.location.reload()
                } else {
                   this.terminalList[vl].tab = false
                   this.findSessionOnline(vl)
                }
            },
            // 找到上一个没有被关闭的会话
            findSessionOnline (vl) {
                if (vl === '0') {
                     // 往上一个一个找标签，如果找到的标签会话是可用的，为true的话即打开
                     let ifpid = true
                     for (let gg = 1; gg < this.terminalList.length; gg++) {
                         if (this.terminalList[gg].tab) {
                                this.currentIndex = JSON.stringify(this.terminalList[gg].pid)
                                ifpid = false
                                break
                         }
                     }
                     if (ifpid) {
                          window.location.reload()
                     }
                } else {
                    let ifpid = true
                    for (let gg = vl; gg < this.terminalList.length; gg++) {
                        if (this.terminalList[gg].tab) {
                            this.currentIndex = JSON.stringify(this.terminalList[gg].pid)
                            ifpid = false
                            break
                        }
                    }
                    if (ifpid) {
                        for (let gg = vl; gg >= 0; gg--) {
                           if (this.terminalList[gg].tab) {
                               this.currentIndex = JSON.stringify(this.terminalList[gg].pid)
                               ifpid = false
                               break
                           }
                        }
                    }
                   if (ifpid) {
                       window.location.reload()
                   }
                }
            },
            sumbitWebSock () {
                this.formItem['host_id'] = this.connectHost.id
                // 第一次打开的时候会话在第一个窗口打开
                if ((this.terminalList.length === 1 && !this.terminalList[0].inner_ip) || (this.terminalList.length === 1 && this.terminalList[0].loggingFalure)) {
                     this.terminalList = [{
                         pid: 0,
                         name: 'terminal',
                         cols: 80,
                         rows: 41,
                         inner_ip: this.connectHost.lan_ip,
                         tab: true
                     }]
                } else {
                    this.terminalList.push({
                        pid: this.terminalList.length,
                        name: 'terminal',
                        cols: 80,
                        rows: 41,
                        inner_ip: this.connectHost.lan_ip,
                        tab: true
                    })
                    this.currentIndex = JSON.stringify(this.terminalList.length - 1)
                 }
                this.loading = true
                axios.post(`${util.urlssh}/ssh`, this.formItem)
                    .then(res => {
                        if (res.data.code === 20000) {
                            console.log(res.data.data, 'websshwebsshwebssh')
                            let wsid = res.data.data.ws_id
                            this.websshConnect(`${util.webssh}` + wsid)
                        } else {
                            util.err_notice(res.data.msg)
                            if (this.terminalList.length === 1 && this.terminalList[0].inner_ip) {
                                this.terminalList = [{
                                    pid: 0,
                                    name: 'terminal',
                                    cols: 80,
                                    rows: 41,
                                    inner_ip: this.connectHost.lan_ip,
                                    loggingFalure: true,
                                    tab: true
                                }]
                            } else {
                                this.terminalList[this.currentIndex].tab = false
                                for (let gg = parseInt(this.currentIndex); gg >= 0; gg--) {
                                    if (this.terminalList[gg].tab) {
                                        this.currentIndex = JSON.stringify(this.terminalList[gg].pid)
                                        break
                                    }
                                }
                            }
                        }
                        this.loading = false
                    }).catch(error => {
                    this.loading = false
                    util.err_notice(error)
                    util.ajanxerrorcode(this, error)
                })
            },
            // 选择机器的时候触发的
            selectHost (vl) {
                if (vl[0]) {
                   if (vl[0].cpu) {
                       this.hostInfodModal = true
                       this.connectHost = vl[0]
                   }
                } else {
                       this.connectHost = ''
                }
            },
            proinit () {
                axios.post(`${util.url}/projects/?p=webssh`)
                    .then(res => {
                        if (res.data.code === 20000) {
                            for (var i = 0; i < res.data.data.length; i++) {
                                res.data.data[i]['expand'] = true
                            }
                            this.baseData.push({
                                expand: true,
                                title: '业务列表',
                                children: res.data.data,
                                top: 1
                            })
                        }
                    }).catch(error => {
                    util.err_notice(error)
                    util.ajanxerrorcode(this, error)
                })
            },
            runRealTerminal () {
                console.log('webSocket is finished')
                // 自适应宽度
                this.term.resize(Math.round(document.body.scrollWidth * (135 / 1920)), 40)
                this.terminalSocket.send(JSON.stringify({'resize': [Math.round(document.body.scrollWidth * (135 / 1920)), 40]}))
            },
            errorRealTerminal () {
                console.log('errorRealTerminalerrorRealTerminalerrorRealTerminal')
                util.err_notice('会话已超时或已推出会话！！')
            },
            closeRealTerminal () {
                console.log('errorRealTerminalerrorRealTerminalerrorRealTerminal')
                util.err_notice('会话已超时或已推出会话！！')
            },
            destoryConnection () {
                if (this.terminalSocket) {
                    this.terminalSocket.close()
                    this.term.destroy()
                }
            },
            websshConnect (url) {
                try {
                if (this.terminalSocket) {
                    this.termInit()
                    this.hotkeysInit()
                }
                this.terminalSocket = new WebSocket(url)
                this.terminalSocket.onopen = this.runRealTerminal
                this.terminalSocket.onclose = this.closeRealTerminal
                this.terminalSocket.onerror = this.errorRealTerminal
                this.term.attach(this.terminalSocket)
                this.term._initialized = true
                var t = this.terminalSocket
                var scrollWidth = document.body.scrollWidth
                var e = this.term
                this.term.on('data', function (data) {
                    // 监听如果浏览器宽度有变化的话将改变resize
                    if (scrollWidth !== document.body.scrollWidth) {
                        e.resize(Math.round(document.body.scrollWidth * (135 / 1920)), 40);
                        t.send(JSON.stringify({'resize': [Math.round(document.body.scrollWidth * (135 / 1920)), 40]}));
                        scrollWidth = document.body.scrollWidth
                    }
                    if (data.length) {
                            t.send(JSON.stringify({'data': data}));
                    }
                });
                } catch (e) {
                    util.err_notice('会话已超时或已推出会话！！')
                }
                console.log('mounted is going on')
            },
            termInit () {
                let terminalContainer = document.getElementById('terminal-' + JSON.stringify(this.terminalList[this.currentIndex].pid))
                this.term = new Terminal({
                    cursorBlink: true,
                    cols: this.terminalList[this.currentIndex].cols,
                    rows: this.terminalList[this.currentIndex].rows
                })
                this.term.open(terminalContainer)
            },
            hotkeysInit () {
                // hotkeys('alt+1, alt+2, alt+3, alt+4, alt+5, alt+6, alt+7, alt+8, alt+9, alt+10', e => {
                //     if (hotkeys.alt) {
                //         // console.log(e.key, 111111111111111)
                //         this.currentIndex = JSON.stringify(e.key - 1)
                //     }
                // });
            }
        },
        mounted () {
            this.proinit()
            this.termInit()
            this.hotkeysInit()
        },
        beforeDestroy () {
            console.log(' beforeDestroy beforeDestroy beforeDestroy')
            if (this.terminalSocket) {
                this.terminalSocket.close()
                this.term.destroy()
            }
        }
    }
</script>
