<style scoped>
  .expand-row{
    margin-bottom: 16px;
  }
  pre, code{
    display: block;
    overflow: auto;
    color:#abb2bf;
    background:#282c34;
    padding: 5px 10px;
    #border: 1px solid #eee;
    word-wrap:break-word;
  }
</style>
<template>
  <div>
    <Row class="expand-row">
      <div class="ivu-table-cell">
    {{row.sql}}
        <!-- <Col span="8">
        <span class="expand-key">执行结果: </span>
        <span class="expand-value">{{ row.success }}</span>-->
      </div>
    </Row>
  </div>
</template>
<script>
  export default {
    props: {
      row: Object
    }
  };
</script>
