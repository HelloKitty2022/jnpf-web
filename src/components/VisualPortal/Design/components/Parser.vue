<template>
  <div class="h-full" @click.stop="handleClick(item)">
    <component :is="layouts" v-bind="getBindValue" v-if="item.jnpfKey !== 'card' && item.jnpfKey !== 'tab'" />
    <template v-if="item.jnpfKey === 'card'">
      <a-card class="portal-card-box">
        <template #title v-if="item.title">
          <CardHeader :title="item.title" :card="item.card" />
        </template>
        <div class="portal-card-body flex items-center justify-center p-15px">
          <div
            v-show="item.children && item.children.length"
            class="portal-box-item"
            v-for="(it, index) in item.children"
            :key="index"
            @click.stop="handleClick(it)">
            <Parser :item="it" :class="{ 'active-item': it.i === activeId }" :activeId="activeId" :detailed="detailed" />
            <a-popconfirm title="确定删除该组件？" class="drawing-item-delete" @confirm="handleRemoveItem(index, item.children)" v-if="!detailed">
              <span title="删除">
                <delete-outlined />
              </span>
            </a-popconfirm>
          </div>
          <add-btn :activeData="item" @addComponent="handleAddComponent" v-show="!item.children?.length && !detailed" />
        </div>
      </a-card>
    </template>
    <template v-if="item.jnpfKey === 'tab'">
      <a-tabs
        v-model:activeKey="item.active"
        :tabPosition="item.tabPosition"
        @tabClick="handleTabClick"
        :type="item.type"
        class="portal-box-tab h-full bg-white"
        :class="{ 'portal-eChart-tab-position': item.tabPosition == 'left' || item.tabPosition == 'right' }">
        <a-tab-pane v-for="child in item.children" :key="child.name">
          <template #tab>
            <span class="ml-4px"><i :class="child.icon" class="pr-4px"></i>{{ child.title }}</span>
          </template>
          <div class="portal-tab-body flex items-center justify-center h-full p-15px">
            <div v-show="child.children?.length" class="portal-box-item" v-for="(it, index) in child.children" :key="index" @click.stop="handleClick(it)">
              <parser :item="it" :class="{ 'active-item': it.i === activeId }" :activeId="activeId" :detailed="detailed" />
              <a-popconfirm title="确定删除该组件？" class="drawing-item-delete" @confirm="handleRemoveItem(index, child.children)" v-if="!detailed">
                <span title="删除">
                  <delete-outlined />
                </span>
              </a-popconfirm>
            </div>
            <add-btn :activeData="item" @addComponent="handleAddComponent" v-show="!child.children?.length && !detailed" />
          </div>
        </a-tab-pane>
      </a-tabs>
    </template>
  </div>
</template>
<script lang="ts" setup>
  import { ref, defineAsyncComponent, markRaw, inject, computed, nextTick } from 'vue';
  import { upperFirst } from 'lodash-es';
  import CardHeader from '../../Portal/CardHeader/index.vue';
  import AddBtn from './AddBtn.vue';
  import { DeleteOutlined } from '@ant-design/icons-vue';
  import { chartList } from '../helper/dataMap';

  defineOptions({ name: 'Parser' });

  const props = defineProps(['item', 'activeId', 'showType', 'detailed']);
  const allModules = import.meta.glob('../../Portal/H*/index.vue');
  let layouts = ref<any>(null);
  const emitter: any = inject('emitter');
  if (props.item.jnpfKey !== 'card') layouts.value = markRaw(defineAsyncComponent(() => getComponents(props.item.jnpfKey)));
  const useNeedKeyList = ['todo', 'commonFunc', 'dataBoard', 'notice', 'tableList', 'text', 'image', 'carousel', 'video', 'schedule'];

  const getBindValue = computed(() => ({
    activeData: props.item,
    key: useNeedKeyList.includes(props.item.jnpfKey) ? props.item.renderKey : '',
  }));

  function getComponents(e: string): Promise<any> {
    if (chartList.includes(e)) e = 'chart';
    const name = 'H' + upperFirst(e);
    let page = `../../Portal/${name}/index.vue`;
    return new Promise((resolve, reject) => {
      let flag = true;
      for (const path in allModules) {
        if (path == page) {
          flag = false;
          allModules[path]().then(mod => {
            resolve(mod);
          });
        }
      }
      if (flag) reject('该文件不存在:' + page);
    });
  }
  function handleClick(data) {
    emitter.emit('handlerActive', data);
  }
  function handleRemoveItem(i, parent) {
    parent.splice(i, 1);
  }
  function handleAddComponent(val) {
    emitter.emit('addComponent', { val: val, item: props.item });
  }
  function handleTabClick() {
    nextTick(() => {
      const active = props.item.active;
      const list = props.item.children;
      for (let i = 0; i < list.length; i++) {
        if (list[i].name === active && list[i].children && list[i].children.length) {
          list[i].children.map(ele => {
            emitter.emit('eChart' + ele.i);
          });
        }
      }
    });
  }
</script>
<style lang="less" scoped>
  .portal-box-tab {
    :deep(.ant-tabs-nav) {
      margin-bottom: unset;
    }
    :deep(.ant-tabs-content) {
      height: 100%;
    }
  }
</style>
