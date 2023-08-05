<template>
	<view class="page-header">
		<le-dropdown
			v-model:menuList="menuData"
			themeColor="#3185FF"
			:duration="300"
			@onConfirm="onConfirm"
		></le-dropdown>
	</view>
	
	<view class="page-container">
		<block v-for="(item, index) in opeartions" :key="index">
			<view class="operation-card">
				<view>
					<text class="card-title">操作类型：</text>
					<text>{{ item.stateText }}</text>
				</view>
				<view>
					<text class="card-title">处理时间：</text>
					<text>{{ item.createDate }}</text>
				</view>
				<view>
					<text class="card-title">处理人：</text>
					<text>{{ item.modifierName }}</text>
				</view>
				<view>
					<text class="card-title">处理内容：</text>
					<text class="card-operation-content">{{ item.operatorContent }}</text>
				</view>
				<view class="">
					<block v-for="(imgUrl, i) in item.imgList" :key="imgUrl">
						<image
							:src="imgUrl"
							mode="aspectFill"
							class="card-info-img"
							@click="previewImg(item, i)"
						></image>
					</block>
				</view>
			</view>
		</block>

		<uni-load-more :status="pageStatus"></uni-load-more>
	</view>
</template>

<script lang="ts" setup>
	// uniapp 页面生命周期
	import { onLoad, onReachBottom } from '@dcloudio/uni-app'
	import { reactive, ref } from "vue";
	import { knifeOperatoinByQuery } from '@/api/apis'
	import { requestResponse } from '@/api/index'
	import dayjs from 'dayjs';

	const opeartions = ref([]);
	let stateValue = -1;
	const menuData = ref([
		{
			title: '操作类型',
			type: 'cell',
			key: 'state',
			options: [
				{ label: '全部', value: -1 },
				{ label: '入库', value: 0 },
				{ label: '生产领出', value: 1 },
				{ label: '维保出库', value: 2 },
				{ label: '报废', value: 3 },
				{ label: '生产归还', value: 4 },
				{ label: '维保归还', value: 5 },			
			]
		}
	]);
	const onConfirm = (e: any) => {
		console.log('eeee:', e);
		stateValue = e.value;
		pages.pageIndex = 0;
		opeartions.value = [];
		getKnifeOperation();
	}
	
	const assetId = ref('');
	const pageStatus = ref('more');
	const pages = reactive({
		pageIndex: 0,
		pageSize: 10,
	})
	const getKnifeOperation = () => {
		pageStatus.value = 'loading';
		const params = {
			...pages,
			sorts: [{
				name: 'createTime',
				order: 'desc'
			}],
			terms: [
				{
					column: "assetId",
					termType: "eq",
					type: "and",
					value: assetId.value
				}
			]
		};
		if (stateValue > -1) {
			params.terms.push({
				column: 'state',
				termType: 'eq',
				type: 'and',
				value: stateValue
			});
		}
			
		knifeOperatoinByQuery(params).then((res: requestResponse) => {
			console.log('刀具履历:', res);
			if (res.result && Array.isArray(res.result.data)) {
				res.result.data.forEach((item: any) => {
					item.imgList = item.img ? (item.img + '').split(';') : [];
					item.createDate = dayjs(item.createTime).format('YYYY-MM-DD');;
					item.stateText = menuData.value[0].options.find(e => e.value === item.state)?.label || '';
				});
				opeartions.value = [...opeartions.value, ...res.result.data];
				pageStatus.value = res.result.total > opeartions.value.length ? 'more' : 'noMore';			
			} else {
				pageStatus.value = 'noMore';
				// uni.showToast({
				// 	icon: 'error',
				// 	title: '加载失败！'
				// })
			}
		})
	};
	
	// 图片预览
	const previewImg = (item: any, index: number) => {
		// console.log('图片预览：', index, urls.value);
		uni.previewImage({
			urls: item.imgList,
			current: index,
			loop: true,
		})
	}

	onLoad((opt : any) => {
		assetId.value = opt.assetId || '';
		getKnifeOperation();
		console.log('刀具ID：', opt);
	});
	onReachBottom(() => {		
		if (pageStatus.value === 'noMore') return;
		pages.pageIndex += 1;
		getKnifeOperation();
	})
</script>

<style lang="scss" scoped>	
.page-header {
	width: 100%;
	height: 90rpx;
	background-color: #fff;
	position: fixed;
	top: 0%;
	z-index: 999;
}
.page-container {
	width: 100%;
	padding: 32rpx;
	box-sizing: border-box;
	padding-top: 120rpx;
	
	.operation-card {
		width: 100%;
		border-radius: 16rpx;
		background-color: #fff;
		padding: 32rpx;
		box-sizing: border-box;
		margin-bottom: 32rpx;
		color: #444447;
		font-size: 28rpx;
		
		.card-title {
			display: inline-block;
			width: 160rpx;
			color: #A9ABB3;
			line-height: 1.8;
		}
		
		.card-operation-content {
			width: 100%;
			color: #9B9EA8;
			background-color: #EFF2F6;
			display: block;
			line-height: 1.6;
			font-size: 24rpx;
			padding: 12rpx 24rpx;
			border-radius: 12rpx;
			box-sizing: border-box;
			margin-top: 12rpx;
		}
	}
}

.card-info-img {
	width: 180rpx;
	height: 180rpx;
	border-radius: 16rpx;
	margin: 24rpx 24rpx 0 0;
}
</style>