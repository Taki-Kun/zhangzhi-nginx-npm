<template>
    <Form ref="formDynamic" :model="formDynamic" :label-width="80" style="width: 300px">
        <FormItem
                v-for="(item, index) in formDynamic.item"
                :label="'Item ' + parseInt(index) + 1"
                :rules="{required: true, message: 'Pillar ' +' can not be empty', trigger: 'blur'}">
                 >
            <Row>
                <Col span="18">
                    <Input type="text" v-model="formDynamic.item[index]" placeholder="Enter something..."></Input>
                </Col>
                <Col span="4" offset="1">
                    <Button type="ghost" @click="handleRemove(index)">Delete</Button>
                </Col>
            </Row>
        </FormItem>
        <FormItem>
            <Row>
                <Col span="12">
                    <Button type="dashed" long @click="handleAdd" icon="plus-round">Add item</Button>
                </Col>
            </Row>
        </FormItem>
        <FormItem>
            <!--<Button type="primary" @click="handleSubmit('formDynamic')">Submit</Button>
            <Button type="ghost" @click="handleReset('formDynamic')" style="margin-left: 8px">Reset</Button>-->
        </FormItem>
    </Form>
</template>
<script>
    export default {
        data () {
            return {
                index: 1,
                formDynamic: {
                    item: []
                }
            }
        },
        methods: {
            handleAdd () {
                this.index++;
                this.formDynamic.item.push('');
            },
            handleRemove (index) {
                this.formDynamic.item.splice(index, 1)
            }
        }
    }
</script>
