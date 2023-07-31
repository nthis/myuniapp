export const infoFields = [
	{
		label: '刀具编号',
		key: 'knifeNumber',
		type: 'text',
		tips: '请输入刀具编号',
		required: true,
		edit: true
	},
	{
		label: '刀具代码',
		key: 'code',
		type: 'text',
		tips: '请输入刀具代码',
		required: true,
		edit: true
	},
	{
		label: '品牌',
		key: 'brand',
		type: 'text',
		tips: '请输入品牌',
		required: true,
		edit: true
	},
	{
		label: '型号',
		key: 'model',
		type: 'text',
		tips: '请输入型号',
		required: true,
		edit: true
	},
	{
		label: '类型',
		key: 'typeName',
		type: 'select',
		tips: '请选择类型',
		required: true,
		edit: true
	},
	{
		label: '刀具寿命',
		key: 'knifeLife',
		type: 'number',
		tips: '请输入刀具寿命',
		required: true,
		edit: true
	},
	{
		label: '剩余寿命',
		key: 'residualLife',
		type: 'number',
		tips: '请输入剩余寿命',
		required: true,
		edit: false
	},
	{
		label: '保养基数',
		key: 'maintenanceBase',
		type: 'number',
		tips: '请输入保养基数',
		required: true,
		edit: true
	},
	{
		label: '剩余次数',
		key: 'maintenanceResidualCount',
		type: 'number',
		tips: '请输入剩余次数',
		required: true,
		edit: false
	},
	{
		label: '储位',
		key: 'locationName',
		type: 'text',
		tips: '请选择储位',
		required: true,
		edit: true
	},
	{
		label: 'RFID',
		key: 'rfidNumber',
		type: 'textarea',
		tips: '请输入RFID',
		required: true,
		edit: true
	},
	{
		label: '图片',
		key: 'imgList',
		type: 'img',
		required: false,
		edit: true
	},
];

export const cascadeData = [{
	text: "一年级",
	value: "1-0",
	children: [
		{
			text: "1.1班",
			value: "1-1"
		},
		{
			text: "1.2班",
			value: "1-2"
		}
	]
},
{
	text: "二年级",
	value: "2-0"
},
{
	text: "三年级",
	value: "3-0"
}]