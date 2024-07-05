<template>
  <div class="child-table-column">
    <template v-if="!expand">
      <tr v-for="(item, index) in fewData" class="child-table__row" :key="index">
        <td
          v-for="(headItem, i) in head"
          :key="i"
          :style="{ width: `${headItem.width}px`, 'text-align': headItem.align }"
          :class="{ 'td-flex-1': !headItem.width }">
          <div class="cell" v-if="headItem.jnpfKey === 'relationForm'">
            <p class="link-text" :title="item[headItem.dataIndex]" @click="toDetail(headItem.modelId, item[`${headItem.dataIndex}_id`])">
              {{ item[headItem.dataIndex] }}
            </p>
          </div>
          <div class="cell" v-else-if="headItem.jnpfKey === 'inputNumber'">
            <jnpf-input-number v-model:value="item[headItem.dataIndex]" :precision="headItem.precision" :thousands="headItem.thousands" disabled detailed />
          </div>
          <div class="cell" v-else-if="headItem.jnpfKey === 'calculate'">
            <jnpf-calculate
              v-model:value="item[headItem.dataIndex]"
              :isStorage="headItem.isStorage"
              :precision="headItem.precision"
              :thousands="headItem.thousands"
              detailed />
          </div>
          <div class="cell" v-else-if="headItem.jnpfKey === 'sign'">
            <jnpf-sign v-model:value="item[headItem.dataIndex]" detailed />
          </div>
          <div class="cell" v-else-if="headItem.jnpfKey === 'signature'">
            <jnpf-signature v-model:value="item[headItem.dataIndex]" detailed />
          </div>
          <div class="cell" v-else-if="headItem.jnpfKey === 'rate'">
            <jnpf-rate v-model:value="item[headItem.dataIndex]" :count="headItem.count" :allowHalf="headItem.allowHalf" disabled />
          </div>
          <div class="cell" v-else-if="headItem.jnpfKey === 'slider'">
            <jnpf-slider v-model:value="item[headItem.dataIndex]" :min="headItem.min" :max="headItem.max" :step="headItem.step" disabled />
          </div>
          <div class="cell" v-else-if="headItem.jnpfKey === 'uploadImg'">
            <jnpf-upload-img v-model:value="item[headItem.dataIndex]" disabled detailed simple v-if="item[headItem.dataIndex]?.length" />
          </div>
          <div class="cell" v-else-if="headItem.jnpfKey === 'uploadFile'">
            <jnpf-upload-file v-model:value="item[headItem.dataIndex]" disabled detailed simple v-if="item[headItem.dataIndex]?.length" />
          </div>
          <div class="cell" v-else-if="headItem.jnpfKey === 'input'">
            <jnpf-input
              v-model:value="item[headItem.dataIndex]"
              :useMask="headItem.useMask"
              :maskConfig="headItem.maskConfig"
              :showOverflow="showOverflow"
              detailed />
          </div>
          <div class="cell" :class="{ ellipsis: showOverflow }" :title="item[headItem.dataIndex]" v-else>{{ item[headItem.dataIndex] }}</div>
        </td>
      </tr>
    </template>
    <template v-if="expand">
      <tr v-for="(item, index) in data" class="child-table__row" :key="index">
        <td
          v-for="(headItem, i) in head"
          :key="i"
          :style="{ width: `${headItem.width}px`, 'text-align': headItem.align }"
          :class="{ 'td-flex-1': !headItem.width }">
          <div class="cell" v-if="headItem.jnpfKey === 'relationForm'">
            <p class="link-text" :title="item[headItem.dataIndex]" @click="toDetail(headItem.modelId, item[`${headItem.dataIndex}_id`])">
              {{ item[headItem.dataIndex] }}
            </p>
          </div>
          <div class="cell" v-else-if="headItem.jnpfKey === 'inputNumber'">
            <jnpf-input-number v-model:value="item[headItem.dataIndex]" :precision="headItem.precision" :thousands="headItem.thousands" disabled detailed />
          </div>
          <div class="cell" v-else-if="headItem.jnpfKey === 'calculate'">
            <jnpf-calculate
              v-model:value="item[headItem.dataIndex]"
              :isStorage="headItem.isStorage"
              :precision="headItem.precision"
              :thousands="headItem.thousands"
              detailed />
          </div>
          <div class="cell" v-else-if="headItem.jnpfKey === 'sign'">
            <jnpf-sign v-model:value="item[headItem.dataIndex]" detailed />
          </div>
          <div class="cell" v-else-if="headItem.jnpfKey === 'signature '">
            <jnpf-signature v-model:value="item[headItem.dataIndex]" detailed />
          </div>
          <div class="cell" v-else-if="headItem.jnpfKey === 'rate'">
            <jnpf-rate v-model:value="item[headItem.dataIndex]" :count="headItem.count" :allowHalf="headItem.allowHalf" disabled />
          </div>
          <div class="cell" v-else-if="headItem.jnpfKey === 'slider'">
            <jnpf-slider v-model:value="item[headItem.dataIndex]" :min="headItem.min" :max="headItem.max" :step="headItem.step" disabled />
          </div>
          <div class="cell" v-else-if="headItem.jnpfKey === 'uploadImg'">
            <jnpf-upload-img v-model:value="item[headItem.dataIndex]" disabled detailed simple v-if="item[headItem.dataIndex]?.length" />
          </div>
          <div class="cell" v-else-if="headItem.jnpfKey === 'uploadFile'">
            <jnpf-upload-file v-model:value="item[headItem.dataIndex]" disabled detailed simple v-if="item[headItem.dataIndex]?.length" />
          </div>
          <div class="cell" v-else-if="headItem.jnpfKey === 'input'">
            <jnpf-input
              v-model:value="item[headItem.dataIndex]"
              :useMask="headItem.useMask"
              :maskConfig="headItem.maskConfig"
              :showOverflow="showOverflow"
              detailed />
          </div>
          <div class="cell" :class="{ ellipsis: showOverflow }" :title="item[headItem.dataIndex]" v-else>{{ item[headItem.dataIndex] }}</div>
        </td>
      </tr>
    </template>
    <div class="expand-more-btn" v-if="data && data.length > defaultNumber">
      <a-button v-if="expand" type="link" @click="toggleExpand">隐藏部分</a-button>
      <a-button v-if="!expand" type="link" @click="toggleExpand">加载更多</a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import type { PropType } from 'vue';

  defineOptions({ name: 'childTableColumn' });
  const props = defineProps({
    data: { type: Array as PropType<any[]>, default: () => [] },
    head: { type: Array as PropType<any[]>, default: () => [] },
    defaultNumber: { type: Number, default: 3 },
    expand: { type: Boolean, default: false },
    showOverflow: { type: Boolean, default: true },
  });
  const emit = defineEmits(['toggleExpand', 'toDetail']);

  const fewData = computed(() => (props.data ? props.data.slice(0, props.defaultNumber) : []));

  function toggleExpand() {
    emit('toggleExpand');
  }
  function toDetail(modelId, id) {
    emit('toDetail', modelId, id);
  }
</script>
