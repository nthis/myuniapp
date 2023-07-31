<template>
	<view class="container">
		<view class="page-card card-warning">
			<view class="card-title">刀具预警</view>
			<view class="d-flex">
				<block v-for="(item, index) in warningList" :key="index">
					<view class="card-content" @click="jumpPage(item.key)">
						<view class="card-number">{{ item.number }}</view>
						<view class="card-des">{{ item.des }}</view>
						<view class="card-des">{{ item.tips }}</view>
					</view>
				</block>
			</view>
		</view>
		<view class="page-card" @click="jumpPage('taskList')">
			<view class="card-title d-flex">
				<text>盘点任务</text>
				<uni-icons type="right" size="16" color="#fff"></uni-icons>
			</view>
			<view class="d-flex">
				<block v-for="(item, index) in taskList" :key="index">
					<view class="card-content" @click.stop="jumpPage(item.key)">
						<view class="card-number-bigger">{{ item.number }}</view>
						<view class="card-des">{{ item.des }}</view>
					</view>
				</block>
			</view>
			<view class="create-task-content" @click.stop="jumpPage('creatTask')">
				<uni-icons type="folder-add" size="24" color="#000"></uni-icons>
				<text>&nbsp;创建任务</text>
			</view>
		</view>

		<block v-for="item in cellList" :key="item.icon">
			<navigator :url="item.navigateUrl">
				<view class="d-flex index-cell">
					<view class="d-flex">
						<view class="cell-fill-circle" :style="{ background: item.bgColor }">
							<uni-icons :type="item.icon" size="24" color="#fff"></uni-icons>
						</view>
						<text class="cell-title">{{ item.title }}</text>
					</view>
					<uni-icons type="right" size="24" color="rgba(0, 0, 0, .3)"></uni-icons>
				</view>
			</navigator>
		</block>
	</view>
</template>

<script lang="ts" setup>
	// uniapp 页面生命周期
	import { onLoad, onShow } from '@dcloudio/uni-app'
	import { ref } from 'vue'
	import { requestResponse } from '@/api/index'
	import { knifeCountByQuery, getTaskCountByQuery } from '@/api/apis'

	// #ifdef APP
	const RfidModule = uni.requireNativePlugin('Ucchip-RfidModule');
	
	const initPlugin = () => {
		RfidModule.openSerial(JSON.stringify({
			path: '/dev/ttyS0',
			baudrate: 115200
		}), (cb : any) => {
			console.log('init:', cb);
		});
	}
	onLoad(initPlugin);
	// #endif

	let isLoading: Boolean = false;
	const warningList = ref([
		{
			number: 0,
			des: '需要保养',
			tips: '使用次数≥95%',
			key: 'maintenanceRate'
		},
		{
			number: 0,
			des: '即将报废',
			tips: '累计使用次数≥95%',
			key: 'lifeRate'
		}
	]);
	const getCount = () => {
		warningList.value.forEach((item, index) => {
			const params = {
				terms: [{
					column: item.key,
					value: 95,
					type: 'and',
					termType: 'gte'
				}]
			};
			knifeCountByQuery(params).then((resp: requestResponse) => {
				warningList.value[index].number = resp.result;
				isLoading = false;
			});
		});
	};

	const taskList = ref([
		{ number: 0, des: '进行中', state: 0, key: 'taskList' },
		{ number: 0, des: '已完成', state: 1, key: 'taskFinish' }
	]);
	const getTaskCount = () => {
		taskList.value.forEach((item, index) => {
			const params = {
				terms: [{
					column: 'state',
					value: item.state,
					type: 'and',
					termType: 'eq'
				}]
			};
			getTaskCountByQuery(params).then((resp: requestResponse) => {
				taskList.value[index].number = resp.result;
				isLoading = false;
			});
		});
	};

	const cellList = [
		// {
		// 	icon: 'search',
		// 	bgColor: '#495AFF',
		// 	title: '刀具查找',
		// 	navigateUrl: '/pages/asset/assetFind/assetFind'
		// },
		{
			icon: 'list',
			bgColor: '#FFA726',
			title: '刀具列表',
			navigateUrl: '/pages/asset/assetList/assetList'
		}
	];
	// #ifdef APP
	cellList.push({
		icon: 'search',
		bgColor: '#495AFF',
		title: '刀具查找',
		navigateUrl: '/pages/asset/assetFind/assetFind'
	})
	// #endif

	const jumpPage = (key : string) => {
		let url = '/pages/task/task';
		switch (key) {
			case 'maintenanceRate':
				url = '/pages/asset/maintenanceList/maintenanceList?key=maintenanceRate'
				break;
			case 'lifeRate':
				url = '/pages/asset/maintenanceList/maintenanceList?key=lifeRate'
				break;
			case 'taskList':
				url = '/pages/task/taskList';
				break;
			case 'taskFinish':
				url = '/pages/task/taskList?state=1';
				break;
			case 'creatTask':
				url = '/pages/task/task';
				break
			default:
				break;
		}

		uni.navigateTo({ url });
	};
	
	// 切换到首页时，刷新首页数据
	onShow(() => {
		if (!isLoading) {
			getCount();
			getTaskCount();
		}
	});
</script>

<style lang="scss" scoped>
	.container {
		padding: 32rpx;
		box-sizing: border-box;

		.page-card {
			width: 100%;
			box-sizing: border-box;
			font-size: 34rpx;
			color: #fff;
			background: linear-gradient(90deg, #00C6FB 0%, #005BEA 100%);
			margin-bottom: 32rpx;
			border-radius: 16rpx;
			text-align: center;
			overflow: hidden;

			.card-title {
				padding: 28rpx 32rpx;
			}

			.card-content {
				flex: 1;
				padding-top: 20rpx;
				padding-bottom: 68rpx;
			}

			.card-number {
				font-size: 68rpx;
				padding-bottom: 16rpx;
			}

			.card-number-bigger {
				font-size: 64rpx;
				padding-bottom: 16rpx;
			}

			.card-des {
				font-size: 28rpx;
				line-height: 42rpx;
				color: rgba(255, 255, 255, 0.5)
			}

			.create-task-content {
				width: 100%;
				color: #000;
				line-height: 112rpx;
				background-color: #fff;
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}

		.card-warning {
			background: linear-gradient(90deg, #F093FB 0%, #F5576C 100%);
		}

		.index-cell {
			width: 100%;
			padding: 32rpx;
			box-sizing: border-box;
			background-color: #fff;
			border-radius: 16rpx;
			margin-bottom: 32rpx;
			overflow: hidden;

			.cell-fill-circle {
				width: 80rpx;
				height: 80rpx;
				text-align: center;
				line-height: 80rpx;
				border-radius: 50%;
			}

			.cell-title {
				font-size: 34rpx;
				padding-left: 16rpx;
			}
		}
	}
</style>