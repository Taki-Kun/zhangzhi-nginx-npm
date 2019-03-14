<template>
  <div>
    <Row>
      <Card>
        <div class="step-header-con">
          <h3>{{ stepData.title }}</h3>
          <h5>{{ stepData.describe }}</h5>
        </div>
        <p class="step-content"></p>
        <Row>
          <i-col span="8">
            <Alert type="warning" show-icon>
              注意事项:
              <span slot="desc">
              1.必须填写查询说明
              <br>
              2.根据查询条件预估所需的查询时间
              <br>
              3.所有提交的查询语句均会进行审计记录
              <br>
              4.仅支持select语句,不可使用非查询语句
              <br>
              5.已限制最大limit数，如自己输入的limit数大于平台配置的最大limit数则已平台配置的Limit数为准
            </span>
            </Alert>
          </i-col>
          <i-col span="12">
            <Form :model="step" :label-width="150">
              <FormItem label="连接名称:" prop="computer_room">
                <Select v-model="step.sqlID" @on-change="Connection_Name">
                  <Option v-for="(val, key, index) in datalist" :key="val.id" :value="val.id">{{val.project.name}}《===》{{val.name}}</Option>
                </Select>
              </FormItem>
              <FormItem label="">
                <Button @click="handleSubmit" style="width:100px;" type="primary">连接</Button>
              </FormItem>
            </Form>
          </i-col>
        </Row>
      </Card>
    </Row>
  </div>
</template>

<script>
  //
  import axios from 'axios'
  import util from '../../libs/util'

  export default {
    name: 'work_flow',
    props: ['msg'],
    data () {
      return {
        stepData: {
          title: '史蒂夫运维 SQL查询系统',
          describe: `欢迎你！ ${sessionStorage.getItem('user')}`
        },
        step: {
          sqlID: ''
        },
        item: {},
        personlist: [],
        datalist: []
      }
    },
    methods: {
      Connection_Name (val) {
        console.log(val, 22222222222222222222)
      },
      ScreenConnection (val) {
        console.log(val, 111111111111111)
      },
      handleSubmit () {
             console.log(1111111111)
          }
    },
    mounted () {
      axios.get(`${util.url}/db/list/`)
        .then(res => {
          if (res.data.code === 20000) {
              this.datalist = res.data.data
          } else {
              util.err_notice(res.data.msg)
          }
        })
        .catch(error => {
          util.err_notice(error)
        })
    }
  }
</script>

<style lang="less">
  .step {
    &-header-con {
      text-align: center;
      h3 {
        margin: 10px 0;
      }
      h5 {
        margin: 0 0 5px;
      }
    }
    &-content {
      padding: 5px 20px 26px;
      margin-bottom: 20px;
      border-bottom: 1px solid #dbdddf;
    }
    &-form {
      padding-bottom: 10px;
      border-bottom: 1px solid #dbdddf;
      margin-bottom: 20px;
    }
  }
</style>
