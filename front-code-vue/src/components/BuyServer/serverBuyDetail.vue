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
  .demo-spin-col{
    height: 100px;
    position: relative;
    border: 1px solid #eee;
  }
  .demo-spin-icon-load{
    animation: ani-demo-spin 1s linear infinite;
  }
  @keyframes ani-demo-spin {
    from { transform: rotate(0deg);}
    50%  { transform: rotate(180deg);}
    to   { transform: rotate(360deg);}
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
          购买机器详情
        </p>
        <Row v-if="allresult.status">
          <Col class="demo-spin-col" span="24" v-if="allresult.status !== 5 && allresult.status !== -1 && allresult.status !== -2">
            <Spin fix>
              <Icon type="ios-loading" size=60 class="demo-spin-icon-load"></Icon>
              <div><span v-if="allresult.status === 2">购买中,请稍后....</span><span v-else-if="allresult.status === 3">初始化中,请稍后....</span><span v-else-if="allresult.status === 4">安装组件中,请稍后....</span></div>
            </Spin>
          </Col>
          <Col class="demo-spin-col" span="24" v-else-if="allresult.status === 5">
            <Spin fix>
              <Icon type="md-checkmark" size=60></Icon>
              <div>购买流程完成</div>
            </Spin>
          </Col>
          <Col class="demo-spin-col" span="24" v-else-if="allresult.status === -1 || allresult.status === -2">
            <Spin fix>
              <Icon type="md-close" size=60></Icon>
              <div>已被驳回或者购买失败</div>
            </Spin>
          </Col>
        </Row>
        <br/>
        <Row>
          <Col span="24">

            <Table border :columns="columns1" :data="data1" stripe ref="selection"></Table>
          </Col>
        </Row>
        <br>
        <Row v-if="allresult.status">
          <Col span="24">
<div v-for="item in allresult.logs">
【{{item.created_time}}】：{{item.desc}}
</div>
        <div v-if="allresult.status !== 5 && allresult.status !== -1 && allresult.status !== -2">
               <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
        </div>
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
    name: 'DataBaseDic',
    data () {
      return {
        ifcomplete: false,
        allresult: '',
        loading: true,
        allspecifList: [],
        columns1: [
          {
            title: 'ID',
            key: 'id'
          },
          {
            title: '模板名称',
            width: 300,
            key: 'name'
          },
          {
            title: '操作系统',
            key: 'flavor'
          },
          {
            title: 'cpu',
            key: 'cpu',
            render: (h, params) => {
              let cpu = ''
              for (let gg of this.allspecifList) {
                if (params.row.spec === gg.spec) {
                  cpu = gg.cpu
                }
              }
              return h('div', [
                h('strong', cpu)
              ]);
            }
          },
          {
            title: '内存',
            key: 'mem',
            render: (h, params) => {
              let mem = ''
              for (let gg of this.allspecifList) {
                if (params.row.spec === gg.spec) {
                  mem = gg.mem
                }
              }
              return h('div', [
                h('strong', mem)
              ]);
            }
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
            title: '创建时间',
            key: 'created_time'
          }
        ],
        data1: [],
        showTimeInterval: ''
      }
    },
    methods: {
      getSpecif () {
        axios.get(`${util.applyserver}/specification/list/`)
          .then(res => {
            if (res.data.code === 20000) {
              this.allspecifList = res.data.data
            } else {
              util.err_notice(res.data.msg)
            }
          }).catch(error => {
          util.err_notice(this, error)
        })
      },
      reflashStatus () {
        this.getResult()
      },
      getResult () {
        axios.get(`${util.applyserver}/host_order/list/?id=${this.allresult.id}`)
          .then(res => {
            if (res.data.code === 20000) {
              this.data1 = [res.data.data[0].tpl]
              this.allresult = res.data.data[0]
            } else {
              util.err_notice(res.data.msg)
            }
          }).catch(error => {
          util.err_notice(error)
        })
      },
        Aqw  () {
            this.showTimeInterval = setInterval(() => {
                if (this.allresult.status !== 5) {
                    this.Bqw();
                }
            }, 2000)
        },
        Bqw () {
            this.getResult()
        }
    },
    mounted () {
      this.getSpecif()
      this.allresult = this.$route.params.result
      this.data1 = [this.allresult.tpl]
      this.getResult()
      this.Aqw()
    },
    beforeDestroy () {
        clearInterval(this.showTimeInterval)
    }
  }
</script>
