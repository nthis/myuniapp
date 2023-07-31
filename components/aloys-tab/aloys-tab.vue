<template>
	<view class="container">
		<view class="tabs">
			<view v-for="(tab, index) in tabs" class="tab-item" :class="current==index&&'active'"
				@click="current = index">
				{{tab.title}}
			</view>
		</view>
		<swiper :current="current" class="swiper-box" @change="onChange">
			<swiper-item v-for="(item ,index) in tabs" :key="index">
				<scroll-view scroll-y="true" style="height: 100%;" @scrolltolower="scrolltolower">
					<!-- #ifdef MP -->
					<slot name="{{'content' + index}}"></slot>
					<!-- #endif -->
					<!-- #ifndef MP -->
					<slot :name="'content'+index"></slot>
					<!-- #endif -->
				</scroll-view>
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
	export default {
		name: 'swiperTab',
		props: {
			currentTab: {
				type: Number,
				default: 0
			},
			tabs: {
				type: Array,
				default: []
			}
		},
		data() {
			return {
				current: this.currentTab
			};
		},
		methods: {
			onChange(e) {
				this.current = e.detail.current;
				this.$emit('change', e.detail.current);
			},
			scrolltolower(e) {
				this.$emit('onReachBottom', this.current);
				console.log(this.current)
			}
		}
	}
</script>
<style>
	swiper-tab {
		display: block;
		height: 100%;
	}
</style>
<style lang="scss" scoped>
	.container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		.tabs {
			height: 80rpx;
			display: inline-flex;
			background-color: #F0F0F0;
			border-radius: 16rpx;
			align-items: center;
			padding: 0 4rpx;

			.tab-item {
				width: 344rpx;
				height: 68rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 28rpx;
				font-family: PingFangSC-Regular, PingFang SC;
				font-weight: 400;
				color: rgba(0, 0, 0, 0.5000);
				line-height: 40rpx;

				&.active {
					color: #FFFFFF;
					background-color: #1890FF;
					box-shadow: 0px 1px 2px 0px rgba(0,0,0,0.1500);
					border-radius: 12rpx;
				}
			}
		}

		.swiper-box {
			width: 100%;
			height: calc(100% - 75rpx);
			overflow: auto;
		}
	}
</style>
