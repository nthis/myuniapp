<template>
	<view class="page-container">
		<view class="page-card card-padding">
			<uni-forms :modelValue="formData" :rules="formRules" ref="form" label-width="90" label-position="top">
				<uni-forms-item label="盘库名称" name="taskName">
					<template #label>
						<view class="template-slot">
							<text class="require-icon">*&nbsp;</text>
							<text>盘库名称</text>
						</view>
					</template>
					<uni-easyinput type="text" v-model="formData.taskName" placeholder="请输入盘库名称" />
				</uni-forms-item>
				<uni-forms-item label="盘库日期" name="taskDate">
					<template #label>
						<view class="template-slot">
							<!-- <text class="require-icon">*&nbsp;</text> -->
							<text>盘库日期</text>
						</view>
					</template>
					<uni-datetime-picker type="date" :value="formData.taskDate" @change="changeDate" />
				</uni-forms-item>
			</uni-forms>
		</view>

		<view class="page-tips">盘库单号保存后系统自动生成</view>

		<view class="page-card">
			<block v-for="item in list" :key="item.key">
				<view class="d-flex item-cell" @click="jumpPage(item.key)">
					<view class="template-slot">{{ item.label }}</view>
					<view class="">
						<text :class="{ 'gary-color': !formData[item.key] }">{{ formData[item.key] || '请选择' }}&nbsp;</text>
						<uni-icons type="right" size="16" color="rgba(0, 0, 0, 0.3)"></uni-icons>
					</view>
				</view>
			</block>
		</view>

		<view class="page-footer">
			<button type="primary" @click="createTask">创建</button>
		</view>
	</view>
</template>

<script lang="ts" setup>
	import { reactive, ref } from 'vue';
	import { requestResponse } from '@/api/index'
	import { saveInventoryTask } from '@/api/apis'

	const form = ref();
	const formData = reactive({
		taskName: '',
		taskDate: '',
		taskPerson: '',
		taskPersonId: '',
		assetList: [],
		assetCount: 0
	});
	const formRules = {
		taskName: {
			rules: [
				{ required: true, errorMessage: '请填写盘库名称' }
			],
			label: '盘库名称',
			validateTrigger: 'submit'
		},
		// taskDate: {
		// 	rules: [
		// 		{ required: true, errorMessage: '请选择盘库日期' }
		// 	],
		// 	label: '盘库日期',
		// 	validateTrigger: 'submit'
		// }
	};
	const changeDate = (date: string) => {
		formData.taskDate = date;
	};
	const checkTask = () => {
		let tips = '';
		if (!formData.taskPerson) tips = '请选择盘点人员';
		if (formData.assetCount <= 0) tips = '请选择盘点刀具';
		if (tips) {
			uni.showToast({
				icon: 'none',
				title: tips
			})
		};
		return tips;
	};
	const createTask = () => {
		form.value.validate().then(() => {
			const tips = checkTask();
			if (tips) return;
			saveTask();
		});
	};
	const saveTask = async () => {
		const params = {
			name: formData.taskName,
			state: 0,
			inventoryTime: new Date(formData.taskDate).getTime(),
			inventoryPerson: formData.taskPersonId,
			inventoryTotal: formData.assetCount,
			inventory_success_total: 0,
			inventoryLoss: 0,
			inventoryProfit: 0,
			ids: formData.assetList.map(e => e.id).join(',')
		};
		uni.showLoading({
			mask: true,
			title: '创建任务中...'
		});
		const resp = await saveInventoryTask(params) as requestResponse;
		uni.hideLoading();
		if (resp.result && resp.result.length > 0) {
			uni.setStorageSync('INVENTORY-TASK-INFO', resp.result[0]);
			uni.redirectTo({
				url: '/pages/task/taskDetail/taskDetail'
			});
		} else {
			uni.showToast({ icon: 'none', title: '任务创建失败' });
		}
	};

	const list = [
		{ label: '盘库人员', key: 'taskPerson' },
		{ label: '盘点刀具', key: 'assetCount' },
	];
	const jumpPage = (key: string) => {
		let url = '';
		switch (key){
			case 'taskPerson':
				url = '/pages/task/userList';
				break;
			case 'assetCount':
				url = '/pages/asset/assetList/assetList?select=1';
				break;
			default:
				break;
		}
		uni.navigateTo({
			url,
			events: {
				chooseUser: (res: any) => {
					formData.taskPerson = res.name;
					formData.taskPersonId = res.id;
				},
				chooseAssets: (res: any) => {
					formData.assetList = res;
					formData.assetCount = res.length;
				}
			}
		});
	}
</script>

<style lang="scss" scoped>
	.page-container {
		width: 100%;
		padding: 32rpx;
		box-sizing: border-box;

		.page-card {
			width: 100%;
			padding: 0 32rpx;
			box-sizing: border-box;
			background-color: #fff;
			border-radius: 16rpx;
			overflow: hidden;

			.template-slot {
				font-size: 34rpx;
				line-height: 80rpx;
				color: #000;

				.require-icon {
					color: #F5222D;
				}
			}
		}
		
		.card-padding {
			padding-top: 24rpx;
			padding-bottom: 12rpx;
		}

		.item-cell {
			line-height: 96rpx;
			border-bottom: 1px solid rgba(0, 0, 0, 0.1);

			&:last-of-type {
				border: none;
			}

			&:active {
				background-color: #e2e2e2;
			}
		}

		.page-tips {
			font-size: 28rpx;
			color: rgba(0, 0, 0, 0.45);
			margin: 32rpx 0 48rpx 0;
		}
	}
	
	.gary-color {
		color: rgba(0, 0, 0, 0.4);
	}
	
	.page-footer {
		width: 686rpx;
		position: fixed;
		left: 32rpx;
		bottom: 32rpx;
	}
</style>