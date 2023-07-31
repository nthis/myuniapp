<template>
	<view class="page-container">
		<view class="page-card">
			<view class="page-container-tips">{{ tips }}</view>
			<view class="title-des">
				<text>刀具总数:</text>
				<text class="title-number">{{ totalCount }}</text>
			</view>
			<view class="charts-box">
				<qiun-data-charts type="pie" :opts="opts" :chartData="chartData" />
			</view>
			<block v-for="(item, index) in assetList" :key='item.key'>
				<view class="asset-cell d-flex" :class="{ 'no-border': index + 1 === assetList.length }" @click="toList(item)">
					<view class="">
						<text class="asset-icon" :style="{ backgroundColor: item.color }"></text>
						<text>{{ item.name }}</text>
					</view>
					<view class="">
						<text class="cell-value">{{ item.value }}</text>
						<uni-icons type="right" size="16" color="rgba(0, 0, 0, 0.3)"></uni-icons>
					</view>
				</view>
			</block>
		</view>
	</view>
</template>

<script lang="ts" setup>
	// uniapp 页面生命周期
	import { onReady } from '@dcloudio/uni-app'
	import { reactive, ref } from "vue";
	import { knifeCountByQuery } from '@/api/apis'

	const tips = '当前资产情况';
	const totalCount = ref(0);
	const assetList = reactive([
		{ name: '在库', color: '#7D9FF3', value: 0, key: '0', isLoad: false },
		{ name: '被领用', color: '#91DCB6', value: 0, key: '1', isLoad: false },
		{ name: '维保中', color: '#7884A0', value: 0, key: '2', isLoad: false },
		{ name: '报废', color: '#F0C961', value: 0, key: '3', isLoad: false },
	]);

	const opts = {
		color: assetList.map(e => e.color),
		padding: [5, 5, 5, 5],
		enableScroll: false,
		extra: {
			pie: {
				activeOpacity: 0.5,
				activeRadius: 10,
				offsetAngle: 0,
				labelWidth: 15,
				border: false,
				borderWidth: 3,
				borderColor: "#FFFFFF"
			}
		}
	};
	const chartData = ref({});

	// 获取刀具数量
	const getServerData = () => {
		totalCount.value = 0;
		const paramList = assetList.map((item : any) => {
			item.isLoad = false;
			return {
				where: `state=${item.key} and isDeleted=0`,
				key: item.key
			}
		});
		paramList.forEach((item : any) => {
			knifeCountByQuery(item).then((res : any) => {
				item.count = Number(res.result) || 0;
				loadData(item);
			}).catch(() => {
				item.count = 0;
				loadData(item);
			});
		});
	};
	const loadData = (info : any) => {
		let index = assetList.findIndex(e => e.key === info.key);
		assetList[index].value = info.count;
		assetList[index].isLoad = true;
		totalCount.value += info.count;
		if (assetList.every(e => e.isLoad)) {
			let res = {
				series: [
					{
						data: assetList
					}
				]
			};
			chartData.value = JSON.parse(JSON.stringify(res));
		}
	};

	// 跳转到刀具列表
	const toList = (item : any) => {
		// console.log('item:', item);
		uni.navigateTo({
			url: '/pages/asset/assetList/assetList?state=' + item.key
		})
	};

	onReady(() => {
		getServerData();
	});
</script>

<style lang="scss" scoped>
	.page-container {
		padding: 32rpx;
		box-sizing: border-box;

		.page-card {
			background-color: #fff;
			border-radius: 16rpx;
			padding: 0 32rpx;
		}

		.page-container-tips {
			padding: 30rpx 0;
			font-weight: 500;
			font-size: 34rpx;
			color: #000;
		}

		.title-des {
			color: #808080;
			font-size: 34rpx;
			padding: 24rpx 0;
			padding-top: 0;
		}

		.title-number {
			font-weight: 500;
			font-size: 48rpx;
			color: #000;
		}

		.asset-cell {
			width: 100%;
			line-height: 112rpx;
			box-sizing: border-box;
			color: #000;
			font-size: 34rpx;
			border-bottom: 1px solid #E5E5E5;

			.asset-icon {
				display: inline-block;
				width: 16rpx;
				height: 16rpx;
				border-radius: 50%;
				margin-right: 16rpx;
			}

			.cell-value {
				color: rgba(0, 0, 0, 0.5);
				padding-right: 32rpx;
			}
		}
	}

	.charts-box {
		width: 100%;
		height: 300px;
	}

	.no-border {
		border: none !important;
	}
</style>