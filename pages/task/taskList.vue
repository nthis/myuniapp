<template>
	<view class="task-header">
		<aloys-tab :currentTab="currentTab" :tabs="tabs" @change="changeTab"></aloys-tab>
	</view>

	<view class="empty-box"></view>
	<view class="card-container">
		<block v-for="(item, index) in taskList" :key='index'>
			<view class="page-card" @click="toDetail(item)">
				<view class="card-title">{{ item.name }}</view>
				<block v-for="info in cardInfos" :key="info.label">
					<view class="card-info">
						<text class="card-info-label">{{ info.label }}</text>
						<text>{{ item[info.key] }}</text>
					</view>
				</block>
				<view class="d-flex">
					<block v-for="elem in stateList" :key="elem.key">
						<view class="card-info card-count">
							<view class="card-info-label">{{ elem.label }}</view>
							<view class="card-info-count">{{ item[elem.key] }}</view>
						</view>
					</block>
				</view>
				<view
					class="card-action"
					@click.stop="taskAction(item)"
				>{{ currentTab === 0 ? '删除' : '查看' }}</view>
			</view>
		</block>
		<uni-load-more :status="pageStatus"></uni-load-more>
	</view>
	<uni-popup ref="alertDialog" type="dialog">
		<uni-popup-dialog
			cancelText="取消"
			confirmText="确定"
			type="warning"
			title="提示"
			content="确认删除该任务?"
			@confirm="dialogConfirm"
			@close="dialogClose"
		></uni-popup-dialog>
	</uni-popup>
</template>

<script lang="ts" setup>
	// uniapp 页面生命周期
	import { onLoad, onReachBottom } from '@dcloudio/uni-app'
	import { ref } from 'vue';
	import aloysTab from '@/components/aloys-tab/aloys-tab.vue'
	import { stateList } from './taskDetail/data'
	import { requestResponse } from '@/api/index'
	import { getInventoryTaskList, deleteInventoryTaskById } from '@/api/apis'
	import dayjs from 'dayjs'

	const currentTab = ref(0);
	const tabs = [
		{ title: '进行中' },
		{ title: '已完成' },
	];
	const changeTab = (e : number) => {
		currentTab.value = e;
		taskList.value = [];
		pageStatus.value =  'more';
		page.pageIndex = 0;
		initData();
	};

	const cardInfos = [
		{ label: '盘库单号：', key: 'id' },
		// { label: '盘点仓库：', key: 'areaName' },
		{ label: '创建时间：', key: 'createTime' },
	];

	const taskList = ref([]);
	const pageStatus = ref('more');
	const page = {
		paging: true,
		pageIndex: 0,
		pageSize: 10,
	};
	const initData = () => {
		const params = {
			...page,
			where: `state=${currentTab.value}`,
			sorts: [
				{ name: 'createTime', order: 'desc' }
			]
		};
		uni.showLoading();
		getInventoryTaskList(params).then((res : requestResponse) => {
			uni.hideLoading();
			res.result.data.forEach((item: any) => {
				item.wait = item.inventoryTotal - item.inventory_success_total - item.inventoryLoss;
				item.createTime = dayjs(item.createTime).format('YYYY-MM-DD');
			});
			taskList.value = taskList.value.concat(res.result.data);
			pageStatus.value = res.result.total > taskList.value.length ? 'more' : 'noMore';
		});
	};
	
	const toDetail = (item: any) => {
		uni.setStorageSync('INVENTORY-TASK-INFO', item);
		uni.navigateTo({
			url: '/pages/task/taskDetail/taskDetail',
			events: {
				// 刷新列表
				refresh: () => {
					changeTab(0);
				}
			}
		});
	};
	const alertDialog = ref();
	let taskId: string = '';
	const taskAction = (item: any) => {
		if (currentTab.value === 0) {
			alertDialog.value.open();
			taskId = item.id;
		} else toDetail(item)
	};
	const dialogConfirm = async () => {
		const resp = await deleteInventoryTaskById(taskId) as requestResponse;
		changeTab(currentTab.value);
		dialogClose();
	};
	const dialogClose = () => {
		alertDialog.value.close()
	};

	onLoad((opt) => {
		// console.log('onload:', opt);
		if (opt.state) currentTab.value = parseInt(opt.state);
		initData();
	});
	onReachBottom(() => {
		if (pageStatus.value === 'noMore') return;
		page.pageIndex += 1;
		initData();
	});
</script>

<style lang="scss" scoped>
	.task-header {
		width: 750rpx;
		height: 112rpx;
		background-color: #fff;
		position: fixed;
		top: 0;
		left: 0;
		padding: 16rpx 32rpx;
		box-sizing: border-box;
		box-shadow: 0px 10px 50px 0px rgba(0, 0, 0, 0.06);
	}

	.empty-box {
		width: 100%;
		height: 112rpx;
	}

	.card-container {
		width: 100%;
		padding: 32rpx;
		box-sizing: border-box;

		.page-card {
			width: 100%;
			padding: 32rpx;
			box-sizing: border-box;
			background-color: #fff;
			margin-bottom: 32rpx;
			border-radius: 16rpx;
			box-shadow: 0px 10px 50px 0px rgba(0, 0, 0, 0.06);

			&:last-of-type {
				margin-bottom: 0;
			}

			.card-title {
				font-size: 34rpx;
				color: #000;
				font-weight: 600;
				padding-bottom: 16rpx;
			}

			.card-info {
				font-size: 28rpx;
				line-height: 64rpx;

				&-label {
					color: rgba(0, 0, 0, 0.45);
				}

				&-count {
					font-size: 34rpx;
					font-weight: 600;
				}
			}

			.card-count {
				flex: 1;
				line-height: 1.6;
				border-top: 1px solid #E8E8E8;
				text-align: center;
				padding-top: 16rpx;
				margin-top: 16rpx;
			}

			.card-action {
				width: 100%;
				padding-top: 32rpx;
				font-size: 34rpx;
				text-align: center;
				color: #1890FF;
			}
		}
	}
</style>