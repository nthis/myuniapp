<template>
	<view class="page-header">
		<uni-nav-bar :title="navBarTitle" :border="false" left-icon="left" color="#fff" backgroundColor="transparent"
			height="210rpx" @clickLeft="backBtn"></uni-nav-bar>

		<view class="header-infos">
			<block v-for="item in headerFields" :key="item.key">
				<view class="header-infos-item">
					<text class="header-infos-label">{{ item.label }}</text>
					<text>{{ data.taskInfo[item.key] || '' }}</text>
				</view>
			</block>
		</view>

		<view class="page-states d-flex">
			<block v-for="item in stateList" :key="item.key">
				<view class="page-states-item" @click="changeTabState(item)">
					<view class="">
						<text>{{ item.label }}</text>
						<uni-icons type="right" size="16" color="rgba(0, 0, 0, 0.5)"></uni-icons>
					</view>
					<view class="page-states-value" :class="{ 'active-color': item.state === data.knifeState }">
						{{ taskStatistics[item.key] }}</view>
				</view>
			</block>
		</view>
	</view>
	<view class="empty-block" style="height: 560rpx;"></view>

	<block v-for="item in knifeListState" :key="item.id">
		<view class="page-card" @click="toAssetDetail(item)">
			<view class="page-card-title d-flex">
				<text>{{ item.productName || '刀具' }}</text>
				<text class="card-badge" :class="'card-badge-' + item.state">
					{{ data.knifeStateLabel[item.state] }}
				</text>
			</view>
			<view class="page-card-info">刀具编号： {{ item.knifeNumber }}</view>
			<view class="page-card-info">刀具代码： {{ item.code }}</view>
			<view class="page-card-info">储&emsp;&emsp;位： {{ item.locationName }}</view>
			<!-- <view class="page-card-badge">北京御芯微</view> -->
			
			<!-- #ifdef APP -->
			<view class="page-card-action" @click.stop="changeState(item)" v-if="item.state === 0">手动登记</view>
			<!-- #endif -->
		</view>
	</block>

	<!-- #ifdef APP -->
	<view class="empty-block" v-if="data.taskInfo['state'] === 0"></view>
	<uni-row class="demo-uni-row page-footer" :gutter='34' v-if="data.taskInfo['state'] === 0">
		<uni-col :span="12">
			<button type="primary" style="background-color: #52C41A;" @click="checkTask">
				{{ isStart ? '停止盘点' : '开始盘点' }}
			</button>
		</uni-col>
		<uni-col :span="12">
			<button type="primary" @click="confirmResult(1)">提交结果</button>
		</uni-col>
	</uni-row>
	<!-- #endif -->
	
	<uni-popup ref="alertDialog" type="dialog">
		<uni-popup-dialog
			cancelText="取消"
			confirmText="确定"
			:type="dialogInfo.dialogType"
			:title="dialogInfo.dialogTitle"
			:content="dialogInfo.dialogContent"
			@confirm="dialogConfirm"
			@close="dialogClose"
		></uni-popup-dialog>
	</uni-popup>
</template>

<script lang="ts" setup>
	import { computed, reactive, ref } from "vue";
	import { onBackPress, onLoad, onUnload } from '@dcloudio/uni-app'
	import { headerFields, stateList } from './data'
	import dayjs from 'dayjs'
	import { requestResponse } from '@/api/index'
	import {
		getTaskRelationKnifeList,
		getAreaListByQuery,
		updateInventoryTask,
		knifeListByQuery,
		getInventoryTaskInfo
	} from '@/api/apis'
	
	// 盘点
	const isStart = ref(false)
	
	// #ifdef APP
	// 引入 RFID 原生插件
	const RfidModule = uni.requireNativePlugin('Ucchip-RfidModule');
	const checkTask = () => {
		isStart.value = !isStart.value;
		isStart.value ? startInventory() : stopInventory();
	};
	// 开始读取数据
	const startInventory = () => {
		RfidModule.startInventory(cb => {
			if (cb.code == 200) readRfid(cb.data);
			// uni.showToast({
			// 	icon: 'none',
			// 	title: cb.data
			// })
		});
	};
	// 停止读取数据
	const stopInventory = () => {
		RfidModule.stopInventory(cb => {
			console.log('停止读取~~~~~~~~~~');
			// uni.showToast({
			// 	icon: 'none',
			// 	title: '停止读取'
			// })
		});
	};
	// #endif
	
	const toAssetDetail = (info: any) => {
		uni.navigateTo({
			url: '/pages/asset/assetDetail/assetDetail?id=' + info.assetId
		});
	};
	
	// 弹窗
	const alertDialog = ref();
	const dialogInfo = reactive({
		knifeId: '',
		dialogType: 'warn',
		dialogTitle: '手动登记',
		dialogContent: '是否已找到该资产,并移动到已盘点'
	});
	const changeState = (e) => {
		dialogInfo.knifeId = e.id;
		dialogInfo.dialogTitle = "手动登记";
		dialogInfo.dialogContent = "是否已找到该资产,并移动到已盘点";
		alertDialog.value.open();
	};
	const dialogConfirm = () => {
		dialogClose();
		if (dialogInfo.dialogTitle === '手动登记') {
			let index = data.knifeList.findIndex(e => e.id === dialogInfo.knifeId);
			if (index > -1) {
				data.knifeList[index].state = 1;
			};			
		} else {
			data.knifeList.forEach(item => {
				if (item.state === 0) {
					item.state = 2;
				}
			});
			confirmResult();
		}
	};
	const dialogClose = () => {
		alertDialog.value.close();
	};

	const navBarTitle = ref('B仓刀具盘点');
	const data = reactive({
		taskInfo: {},
		knifeState: 0,
		knifeList: [],
		knifeStateLabel: ['待盘点', '已盘点', '盘亏', '盘盈']
	});
	const taskStatistics = computed(() => {
		return {
			wait: data.knifeList.filter(e => e.state === 0).length || 0,
			inventory_success_total: data.knifeList.filter(e => e.state === 1).length || 0,
			inventoryLoss: data.knifeList.filter(e => e.state === 2).length || 0,
			inventoryProfit: data.knifeList.filter(e => e.state === 3).length || 0,
		};
	});
	const knifeListState = computed(() => {
		return data.knifeList.filter(e => e.state === data.knifeState);
	});
	const getTaskInfo = (taskId: string) => {
		getInventoryTaskInfo(taskId).then((resp: requestResponse) => {
			console.log('resp:', resp);
			data.taskInfo = resp.result;
			headerFields.forEach(item => {
				let value = data.taskInfo[item.key]
				if (item.format && value) {
					data.taskInfo[item.key] = dayjs(value).format(item.format) || '';
				};
			});
		});
	};
	const getKnifeList = async (taskId : string) => {
		const params = {
			pageIndex: 0,
			pageSize: 9999,
			where: `taskId=${taskId}`,
		}
		const resp = await getTaskRelationKnifeList(params) as requestResponse;
		data.knifeList = resp.result.data;
		data.knifeList.forEach(e => {
			e.state = e.state || 0;
		});
		formatLocationName(data.knifeList);
	};

	// 储位列表
	const areaList = ref([]);
	const getAreaList = () => {
		getAreaListByQuery({
			pageIndex: 0,
			pageSize: 999
		}).then((res : requestResponse) => {
			areaList.value = res.result.data;
			formatLocationName(data.knifeList);
		});
	};
	const formatLocationName = (metaData : Array<any>) => {
		metaData.forEach((item : any) => {
			if (item.location) {
				let location = item.location.split(',');
				let locationName = location.reduce((prov : Array<string>, cur : String) => {
					let index = areaList.value.findIndex(e => e.id === cur);
					if (index > -1) prov.push(areaList.value[index].name);

					return prov;
				}, []).join('-');

				item.locationName = locationName || '';
			}
		});
	};

	const changeTabState = (info : any) => {
		data.knifeState = info.state || 0;
	};
	
	const rfidList: Array<string> = [];
	const readRfid = (rfid: string) => {
		// 已经读取过的不再重复操作
		if (rfidList.includes(rfid)) return;
		
		rfidList.push(rfid);
		let index = data.knifeList.findIndex(e => {
			// 现在一个刀具可以绑定多个 RFID，逗号分隔
			const rfidNumberList = (e.rfidNumber + '').toLocaleUpperCase().split(',');
			return rfidNumberList.includes(rfid)
		});
		if (index > -1) {
			// 已盘
			data.knifeList[index].state = 1;
		} else {
			// 盘盈时，在系统中查找刀具
			const params = {
				// where: `rfidNumber=${rfid}`
				where: `rfidNumber like %${rfid}%`
			};
			knifeListByQuery(params).then((res: requestResponse) => {
				if (Array.isArray(res.result.data) && res.result.data.length > 0) {
					data.knifeList.push({
						taskId: data.taskInfo['id'],
						assetId: res.result.data[0].id,
						knifeNumber: res.result.data[0].knifeNumber,
						code: res.result.data[0].code,
						productName: res.result.data[0].productName,
						location: res.result.data[0].location,
						rfidNumber: rfid,
						state: 3
					});
				}
			});
		}
	};
	
	// 提交结果
	const confirmResult = (state: number = 1) => {
		let waitList = data.knifeList.filter(e => e.state === 0);
		if (waitList.length > 0 && state === 1) {
			dialogInfo.dialogTitle = "提交";
			dialogInfo.dialogContent = `还有${ waitList.length }个未盘点，是否提交?`;
			alertDialog.value.open();
			return;
		};
		const params: any = {
			...data.taskInfo,
			...taskStatistics.value,
			state,
			taskKnifeRelationEntityList: data.knifeList
		};
		
		delete params.createTime;
		delete params.finishTime;
		updateInventoryTask(params).then((res: requestResponse) => {
			if (res.result[0]?.state) {
				uni.showToast({
					icon: 'none',
					title: '盘点成功'
				});
				setTimeout(() => {
					uni.reLaunch({
						url: '/pages/index/index'
					});
				}, 800);
			}
		});
	}

	onLoad(() => {
		const info = uni.getStorageSync('INVENTORY-TASK-INFO');
		if (info && info.id) {
			navBarTitle.value = info.name;
			getTaskInfo(info.id);
			getKnifeList(info.id);
			getAreaList();
		} else {
			uni.navigateBack();
			uni.showToast({
				icon: 'none',
				title: '任务查询失败'
			})
		}
	});
	onUnload(() => {
		uni.removeStorageSync('INVENTORY-TASK-INFO');
	});
	// 返回事件
	const backBtn = () => {
		uni.navigateBack();
	};
	onBackPress(() => {
		// #ifdef APP
		// 返回时暂存当前页面数据
		if (data.taskInfo['state'] === 0) {
			confirmResult(0);
		}
		
		// 退出页面时关闭 RFID 数据读取
		stopInventory();
		// #endif
	});
</script>

<style lang="scss" scoped>
	.page-header {
		width: 100%;
		height: 424rpx;
		background: linear-gradient(90deg, #0ACFFE 0%, #495AFF 100%);
		box-shadow: 0rpx 10rpx 50rpx 0rpx rgba(72, 94, 255, 0.25);
		position: fixed;
		top: 0%;
		left: 0;

		.header-infos {
			width: 100%;
			padding: 0 32rpx;
			box-sizing: border-box;
			font-size: 28rpx;
			color: rgba(255, 255, 255, 0.9);

			&-item {
				width: 50%;
				display: inline-block;
			}

			&-label {
				display: inline-block;
				width: 136rpx;
				color: rgba(255, 255, 255, 0.5);
				padding-bottom: 24rpx;
			}
		}

		.page-states {
			width: 686rpx;
			padding: 32rpx 12rpx;
			box-sizing: border-box;
			background-color: rgba(255, 255, 255, 0.5);
			border-radius: 16rpx;
			backdrop-filter: blur(16rpx);
			position: absolute;
			bottom: -110rpx;
			left: 32rpx;

			&-item {
				flex: 1;
				text-align: center;
				font-size: 28rpx;
				color: rgba(0, 0, 0, 0.5);
			}

			&-value {
				font-size: 48rpx;
				font-weight: 600;
				color: rgba(0, 0, 0, 0.9);
				padding-top: 24rpx;
			}
		}
	}

	.page-card {
		width: 686rpx;
		padding: 32rpx;
		// padding-bottom: 0;
		box-sizing: border-box;
		margin: 0 auto;
		margin-bottom: 32rpx;
		background-color: #fff;
		border-radius: 16rpx;
		font-size: 34rpx;
		color: rgba(0, 0, 0, 1);

		&-title {
			font-weight: 600;
		}
		
		.card-badge {
			display: inline-block;
			font-weight: 400;
			font-size: 28rpx;
			line-height: 48rpx;
			padding: 0 16rpx;
			color: #FAAD14;
			background: #FFF7E8;
			border-radius: 8rpx;
		}
		
		.card-badge-1 {
			color: #1890FF;
			background: #E8F4FF;
		}
		
		.card-badge-2 {
			color: #FA4848;
			background: #FEE9EA;
		}
		
		.card-badge-3 {
			color: #52C41A;
			background: #EEF9E8;
		}
		

		&-info {
			color: rgba(0, 0, 0, 0.5);
			padding: 16rpx 0;
		}

		&-badge {
			display: inline-block;
			line-height: 72rpx;
			padding: 0 24rpx;
			border-radius: 16rpx;
			background-color: #E8F4FF;
			color: #1890FF;
			margin-bottom: 16rpx;
		}

		&-action {
			line-height: 96rpx;
			color: #1890FF;
			text-align: center;
		}
	}

	.empty-block {
		width: 100%;
		height: 120rpx;
	}

	.page-footer {
		width: 100%;
		position: fixed;
		bottom: 0%;
		left: 0%;
		padding: 32rpx;
		box-sizing: border-box;
		background-color: #fff;
		box-shadow: 0px 18rpx 30rpx 2rpx rgba(24, 144, 255, 0.15);
	}

	.active-color {
		color: #1890FF !important;
	}
</style>