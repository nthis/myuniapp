export const menuList = [
	{
		title: '状态',
		type: 'filter',
		children: [{
			title: "",
			type: 'checkbox',
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
					value: 4
				},]
		}]
	},
	{
		title: '储位',
		type: 'filter',
		children: [{
			title: "",
			type: 'checkbox',
			value: [],
			options: [{
				label: "属性0",
				value: null
			},
			{
				label: "储位 A",
				value: 0
			},
			{
				label: "储位 B",
				value: 1
			},
			{
				label: "储位 C",
				value: 2
			},
			{
				label: "储位 D",
				value: 4
			},
			]
		}]
	},
	{
		title: '更多',
		type: 'click'
	}
];

export const drawerFilter = [
	{ key: 'number', label: '编号', tips: '请输入刀具编号' },
	{ key: 'code', label: '代码', tips: '请输入刀具代码' },
	{ key: 'brand', label: '品牌', tips: '请输入刀具编号' },
	{ key: 'model', label: '型号', tips: '请输入型号' },
	{ key: 'specifications', label: '规格', tips: '请输入规格' },
	{ key: 'productName', label: '品名', tips: '请输入品名' },
]
