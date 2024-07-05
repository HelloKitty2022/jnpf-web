export const useDefineSetting = () => {
  const flowStatusList = [
    { id: 0, fullName: '等待提交' },
    { id: 1, fullName: '等待审核' },
    { id: 2, fullName: '审核通过' },
    { id: 3, fullName: '审核退回' },
    { id: 4, fullName: '流程撤回' },
    { id: 5, fullName: '审核终止' },
    { id: 6, fullName: '已被挂起' },
  ];
  const flowUrgentList = [
    { id: 1, fullName: '普通' },
    { id: 2, fullName: '重要' },
    { id: 3, fullName: '紧急' },
  ];

  function getUrgentText(value) {
    let text = '';
    switch (value) {
      case 1:
        text = '普通';
        break;
      case 2:
        text = '重要';
        break;
      case 3:
        text = '紧急';
        break;
      default:
        text = '普通';
        break;
    }
    return text;
  }
  return {
    flowStatusList,
    flowUrgentList,
    getUrgentText,
  };
};
