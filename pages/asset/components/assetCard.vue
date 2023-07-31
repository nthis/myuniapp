<template>
	<view class="card d-flex" :class="{ 'flex-center': isSelect }" @click="toDetail">
		<image :src="cardImg" mode="aspectFill" class="card-img" v-if="showImg && !isSelect" @error="imgError"></image>
		<view class="card-checkbox" v-if="isSelect">
			<uni-icons
				size="24"
				:type="isCheck ? 'checkbox-filled' : 'checkbox'"
				:color="isCheck ? '#1890FF' : 'rgba(0, 0, 0, 0.2)'"
			></uni-icons>
		</view>
		<view class="" style="flex: 1;">
			<view class="d-flex">
				<view class="card-title" :class="{ 'card-title-bigger': useType === 'info' }">{{ info.productName }}</view>
				<text class="card-badge" :class="'card-badge-' + info.state" v-if="stateText[info.state]">{{ stateText[info.state] }}</text>
			</view>
			<view class="card-item" v-for="item in fieldList" :key="item.key">
				<text class="card-label" :class="{ 'card-label-info': useType === 'info' }">
					{{ item.label }}
				</text>
				<uni-row class="demo-uni-row" :gutter="32" v-if="item.type === 'img'">
					<block v-for="(item, index) in urls" :key="index">
						<uni-col :span="8">
							<image :src="item" mode="aspectFill" class="card-info-img" @click="previewImg(index)"></image>
						</uni-col>
					</block>
				</uni-row>
				<view class="" v-else-if="item.key === 'rfidNumber'">
					<view v-for="item in rfidList">
						<uni-tag :text="item" />
					</view>
				</view>
				<text :class="{ 'warning-color': item.type === 'warning' }" class="card-text" v-else>
					{{ formatValue(info[item.key], item) }}
				</text>
			</view>
		</view>
	</view>
</template>

<script lang="ts" setup>
	import { ref, computed } from 'vue'
	import dayjs from 'dayjs'
	const emit = defineEmits(['change']);

	const props = defineProps({
		// 卡片信息
		info: {
			type: Object,
			default: () => { }
		},
		// 基础字段
		fieldList: {
			type: Array,
			default: () => {
				return [
					{ label: '刀具代码', key: 'code' },
					{ label: '储位', key: 'locationName' },
				]
			}
		},
		showImg: {
			type: Boolean,
			default: true
		},
		// 使用情况，list/info
		useType: {
			type: String,
			default: 'list'
		},
		// 是否在资产详情中
		isDetail: {
			type: Boolean,
			default: false
		},
		// 是否选择
		isSelect: {
			type: Boolean,
			default: false
		}
	});
	
	const formatValue = (val: any, item: any) => {
		switch (item.type){
			case 'timestamp':
				return dayjs(val).format(item.format)
			default:
				return val;
		}
	};
	
	const isCheck = ref(false);
	const changeState = () => {
		isCheck.value = !isCheck.value;
		emit('change', isCheck.value);
	};
	const rfidList = computed(() => {
		return props.info.rfidNumber ? props.info.rfidNumber.split(',') : [];
	});
	let cardImg = ref(props.info && props.info.img && props.info.img.split(';')[0] || '/static/icon.png');
	const imgError = () => {
		cardImg.value = '/static/icon.png';
	};
	const stateText = ['在库', '被领用', '维保中', '报废']

	// 跳转到详情页面
	const toDetail = () => {
		if (props.isSelect) {
			changeState();
			return;
		}
		if (props.isDetail) return;
		// uni.setStorageSync('ASSET-KNIFE-INFO', props.info);
		uni.navigateTo({
			url: '/pages/asset/assetDetail/assetDetail?id=' + props.info.id
		});
	};

	const urls = computed(() => {
		try{
			return props.info.img.split(';')
		}catch(e){
			//TODO handle the exception
			return [];
		}
	});
	// 图片预览
	const previewImg = (index: number) => {
		// console.log('图片预览：', index, urls.value);
		uni.previewImage({
			urls: urls.value,
			current: index,
			loop: true,
		})
	}
</script>

<style lang="scss" scoped>
	.card {
		width: 100%;
		padding: 32rpx;
		box-sizing: border-box;
		margin-bottom: 32rpx;
		background-color: #fff;
		border-radius: 16rpx;
		font-size: 28rpx;
		color: rgba(0, 0, 0, 0.9);
		box-shadow: 0rpx 10rpx 50rpx 0rpx rgba(55, 58, 64, 0.06);
		border-radius: 16rpx;

		align-items: flex-start;

		&-img {
			width: 112rpx;
			height: 112rpx;
			border-radius: 8rpx;
			overflow: hidden;
			margin-right: 32rpx;
		}
		
		.card-checkbox {
			padding-right: 32rpx;
		}

		.card-title {
			font-size: 34rpx;
			font-weight: 600;
			color: #000;
			padding-bottom: 16rpx;
		}

		.card-title-bigger {
			font-size: 48rpx;
		}

		.card-badge {
			display: inline-block;
			width: 104rpx;
			text-align: center;
			line-height: 48rpx;
			border-radius: 8rpx;
			border: 1px solid;
		}
		
		.card-badge-0 {
			color: #52C41A;
			border-color: #52C41A;
			background-color: #EEF9E8;
		}
		
		.card-badge-1 {
			color: #1890FF;
			border-color: #1890FF;
			background-color: #E8F4FF;
		}
		.card-badge-2 {
			color: #FAAD14;
			border-color: #FAAD14;
			background-color: #FFF7E8;
		}
		.card-badge-3 {
			color: #F5222D;
			border-color: #F5222D;
			background-color: #fee9ea;
		}

		.card-item {
			line-height: 64rpx;

			.card-label {
				display: inline-block;
				width: 120rpx;
				color: rgba(0, 0, 0, 0.5);
			}

			.card-label-info {
				width: 180rpx;
			}
		}

		.card-info-img {
			width: 200rpx;
			height: 200rpx;
			border-radius: 16rpx;
		}
	}
	
	.flex-center {
		// justify-content: ;
		align-items: center;
	}
	
	.warning-color {
		color: #F5222D !important;
	}
	
	.card-text {
		word-break: break-all;
		word-wrap: break-word;
		white-space: pre-line;
	}
</style>