<style scoped>
    .expand-row{
        margin-bottom: 16px;
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
</style>
<template>
    <div>
        <Row class="expand-row">
            <Col span="24">
                <span class="expand-key">返回详细日志(选择的服务器数量{{row.minions.length}}，实际返回{{row.output.length}}): </span>
                <div v-for="(val, key, index) in row.output">
                    【{{key}}】
<pre v-if="val.return.stdout"><div  v-for="(val2, key2, index2) in val.return">
【{{key2}}】
{{val2}}
</div>
</pre>
<pre v-else-if="Array.isArray(val.return)">
{{val.return.join('\n')}}
</pre>
<pre v-else>
{{val.return}}
         </pre>
                </div>
                <!-- <Col span="8">
                <span class="expand-key">执行结果: </span>
                <span class="expand-value">{{ row.success }}</span>-->
            </Col>
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
