<template>
	<scroll-view scroll-x="true" class="area-header">
		<block v-for="(item, index) in treeData.header">
			<view class="header-item" @click="backLevel(item, index)">
				<text
					class="header-item-text"
					:class="{ 'active-text': index + 1 < treeData.header.length }"
				>{{ item.label }}</text>
				<uni-icons type="right" size="18" color="rgba(0, 0, 0, 0.3)"
					v-if="index + 1 < treeData.header.length"></uni-icons>
			</view>
		</block>
	</scroll-view>

	<view class="empty-block"></view>

	<view class="area-list">
		<block v-for="item in treeData.list" :key="item.key">
			<view class="d-flex area-list-item">
				<view class="area-list-label d-flex" @click="chooseItem(item)">
					<uni-icons type="circle" size="24" color="rgba(0, 0, 0, 0.2)"></uni-icons>
					<text>&nbsp;{{ item.label }}</text>
				</view>

				<view class="area-list-next d-flex" @click="toNext(item)">
					<text v-if="item.children">{{ item.children.length || 0 }}&nbsp;</text>
					<uni-icons
						type="right"
						size="18"
						color="rgba(0, 0, 0, 0.3)"
						v-if="item.children.length > 0"
					></uni-icons>
				</view>
			</view>
		</block>
	</view>
</template>

<script lang="ts" setup>
	// uniapp 页面生命周期
	import { onLoad } from '@dcloudio/uni-app'
	import { requestResponse } from '@/api/index'
	import { getAreaTreeByQuery } from '@/api/apis'
	import { reactive } from "vue";

	const treeData = reactive({
		mateData: [],
		header: [
			{ label: '全部', value: '-1' }
		],
		list: [],
		lastId: '-1'
	});
	const formatData = (item: any) => {
		return {
			label: item.name,
			value: item.id,
			children: item.children || []
		}
	};
	const getArea = async () => {
		uni.showLoading({
			mask: true
		});
		const listTree = await getAreaTreeByQuery() as requestResponse;
		uni.hideLoading();
		treeData.mateData = listTree.result;
		treeData.list = treeData.mateData.map(e => formatData(e));
	};

	const backLevel = (item : any, index: number) => {
		if (item.value === treeData.lastId) return;
		treeData.header = treeData.header.slice(0, index + 1);
		treeData.list = (item.value === '-1' ? treeData.mateData : item.children).map(e => formatData(e));
	};

	const pages = getCurrentPages();
	const currentPage : any = pages[pages.length - 1];
	// 用于页面之间通讯
	const eventChannel = currentPage.getOpenerEventChannel();
	const chooseItem = (item : any) => {
		let result = treeData.header.slice(1);
		result.push(item);
		
		uni.navigateBack();
		eventChannel.emit('chooseArea', {
			label: result.map(e => e.label).join('-'),
			value: result.map(e => e.value).join(',')
		});
	};
	const toNext = (item : any) => {
		if (item.children.length > 0) {
			treeData.header.push(item);
			treeData.lastId = item.value;
			treeData.list = item.children.map(e => formatData(e));
		};
	};

	onLoad(() => {
		getArea()
	});
</script>

<style lang="scss" scoped>
	.area-header {
		width: 100%;
		white-space: nowrap;

		position: fixed;
		top: 0%;
		left: 0%;
		background-color: #fff;

		.header-item {
			display: inline-block;
			padding-left: 24rpx;
			line-height: 90rpx;
			font-size: 34rpx;
			color: rgba(0, 0, 0, 0.9);

			&-text {
				margin-right: 24rpx;
			}
		}

		.active-text {
			color: #1890FF;
		}
	}

	.empty-block {
		width: 100%;
		height: 120rpx;
	}

	.area-list {
		width: 100%;
		background-color: #fff;
		line-height: 120rpx;
		padding: 0 32rpx;
		font-size: 34rpx;
		box-sizing: border-box;

		&-item {
			border-bottom: 1px solid #E5E5E5;

			&:last-of-type {
				border: none;
			}
		}

		&-label {
			flex: 1;
			justify-content: flex-start;
		}

		&-next {
			width: 200rpx;
			justify-content: flex-end;
			color: rgba(0, 0, 0, 0.4)
		}
	}
</style>