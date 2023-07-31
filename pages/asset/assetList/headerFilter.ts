export const menuList = [
	{
		title: '状态',
		type: 'filter',
		children: [{
			title: "",
			type: 'checkbox',
			key: 'state',
			value: [],
			options: [
				{
					label: "在库",
					value: 0
				},
				{
					label: "领出",
					value: 1
				},
				{
					label: "保养中",
					value: 2
				},
				{
					label: "报废",
					value: 3
				}]
		}]
	},
	{
		title: '剩余寿命',
		type: 'cell',
		key: 'life',
		value: "",
		options: [
			{
				label: "全部",
				value: "-1"
			},
			{
				label: '刀具寿命低于 5%',
				value: '5'
			},
			{
				label: '刀具寿命低于 10%',
				value: '10'
			},
			{
				label: '刀具寿命低于 20%',
				value: '20'
			}
		]
	},
	// {
	// 	title: '储位',
	// 	type: 'click'
	// },
	{
		title: '更多',
		type: 'click'
	}
];

export const drawerFilter = [
	{ key: 'locationName', label: '储位', tips: '请选择储位' },
	{ key: 'knifeNumber', label: '编号', tips: '请输入刀具编号' },
	{ key: 'code', label: '代码', tips: '请输入刀具代码' },
	{ key: 'brand', label: '品牌', tips: '请输入刀具编号' },
	{ key: 'model', label: '型号', tips: '请输入型号' },
	{ key: 'productName', label: '品名', tips: '请输入品名' },
]