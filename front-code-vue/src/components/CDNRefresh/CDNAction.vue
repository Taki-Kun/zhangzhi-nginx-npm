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
          CDN刷新
        </p>
        <Row>
          <Col span="12" offset="5">
            <Form :model="formItem" :label-width="150">
              <FormItem label="平台">
                    <RadioGroup v-model="formItem.platform" type="button">
                         <Radio label="QCLOUD">腾讯云</Radio>
                         <Radio label="ALIYUN">阿里云</Radio>
                    </RadioGroup>
              </FormItem>
              <FormItem label="类型">
                <RadioGroup v-model="formItem.type" type="button">
                  <Radio label="File">文件</Radio>
                  <Radio label="Directory">目录</Radio>
                </RadioGroup>
              </FormItem>
              <FormItem label="内容">
                 <Input v-model="formItem.content" type="textarea" :autosize="{minRows: 10,maxRows: 5}" placeholder="输入刷新内容"></Input>
              </FormItem>
              <FormItem>
                <Button type="primary" @click="sumbit">提交</Button>
              </FormItem>
            </Form>
          </col>
          <Spin size="large" fix v-if="spinShow"></Spin>
          <div v-if="spinShow">刷新中...</div>
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
    name: 'CDNAction',
    data () {
      return {
        spinShow: false,
        formItem: {
          platform: 'QCLOUD',
          type: 'File',
          content: ''
        }
      }
    },
    methods: {
        sumbit () {
            console.log(this.formItem)
            this.spinShow = true
            axios.post(`${util.url}/cdn/refresh/`, this.formItem)
                .then(res => {
                    this.spinShow = false
                    if (res.data.data.status === 'Success' || res.data.data.status === 'Complete' || res.data.data.status === 'Refreshing') {
                     this.formItem.content = ''
                     this.$Message.info('刷新中，请留意log状态！！');
                    } else {
                        util.err_notice(res.data.data.log.message)
                    }
                }).catch(error => {
                util.err_notice(error)
            })
        }
    },
    mounted () {
    }
  }
</script>
