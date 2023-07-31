export const headerFields = [
	{ label: '创建人', key: 'creatorName' },
	{ label: '盘点总数', key: 'inventoryTotal' },
	{ label: '创建时间', key: 'createTime', format: 'YYYY-MM-DD' },
	{ label: '完成时间', key: 'finishTime', format: 'YYYY-MM-DD' },
]

export const stateList = [
	{ label: '待盘点', key: 'wait', state: 0 },
	{ label: '已盘点', key: 'inventory_success_total', state: 1 },
	{ label: '盘亏', key: 'inventoryLoss', state: 2 },
	{ label: '盘盈', key: 'inventoryProfit', state: 3 },
]