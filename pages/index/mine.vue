<template>
	<view class="mine-header">
		<image src="/static/icon.png" mode="" class="header-img"></image>
		<view class="user-name">测试测试</view>
	</view>

	<block v-for="(item, index) in list" :key="index">
		<view class="d-flex index-cell" @click="cellAction(item)">
			<view class="d-flex">
				<uni-icons :type="item.icon" size="24" color="#1890FF"></uni-icons>
				<text>&nbsp;{{ item.name }}</text>
			</view>
			<view class="d-flex">
				<text class="cell-tips">{{ item.tips }}&nbsp;</text>
				<uni-icons type="right" size="24" color="rgba(0, 0, 0, 0.3)"></uni-icons>
			</view>
		</view>
	</block>

	<button type="default" class="log-out-btn" @click="signout">退出</button>
	<uni-popup ref="popup" type="dialog">
		<uni-popup-dialog
			mode="base"
			content="确认退出登录"
			type="warning"
			:duration="2000"
			:before-close="true"
			@close="close"
			@confirm="confirm"
		></uni-popup-dialog>
	</uni-popup>
</template>

<script lang="ts" setup>
	import { ref } from "vue";
	import { loginout_api } from '@/api/apis'
	import { TOKEN_KEY, USER_INFO } from '@/api/index'
	const list = [
		{ icon: 'help', name: '帮助', key: 'help', tips: '', url: '' },
		{ icon: 'paperclip', name: '版本', key: 'version', tips: 'V1.0.0', url: '' },
	];
	const cellAction = (item) => {
		switch (item.key){
			case 'help':
				jumpToHelp();
				break;
			default:
				break;
		}
	};
	const jumpToHelp = () => {
		// #ifdef APP
		// plus.runtime.openURL('https://hexin.help.ucthings.com');
		plus.runtime.openURL('https://hexin.help.ucthings.com/cutter/management-app.html#_1.%E7%99%BB%E5%BD%95%E4%B8%8E%E6%9C%8D%E5%8A%A1%E5%99%A8%E8%AE%BE%E7%BD%AE');
		// #endif
		
		// #ifndef APP
		uni.navigateTo({
			url: '/pages/webview/webview'
		});
		// #endif
	}

	const popup = ref();
	const signout = () => {
		popup.value.open();
	};
	const close = () => {
		popup.value.close();
	};
	const confirm = () => {
		close();
		uni.removeStorageSync(TOKEN_KEY);
		uni.removeStorageSync(USER_INFO);
		uni.reLaunch({
			url: '/pages/index/login'
		});
		loginout_api();
	};
</script>

<style lang="scss" scoped>
	.mine-header {
		width: 100%;
		height: 472rpx;
		background: linear-gradient(90deg, #0ACFFE 0%, #495AFF 100%);
		box-shadow: 0px 10px 50px 0px rgba(72, 94, 255, 0.25);
		text-align: center;
		padding-top: 240rpx;
		box-sizing: border-box;

		.header-img {
			width: 120rpx;
			height: 120rpx;
			border-radius: 50%;
		}

		.user-name {
			font-size: 34rpx;
			color: rgba(255, 255, 255, 0.9);
			padding: 24rpx 0;
		}
	}

	.index-cell {
		width: 686rpx;
		line-height: 112rpx;
		background: #FFFFFF;
		box-shadow: 0px 10px 50px 0px rgba(0, 0, 0, 0.06);
		border-radius: 16rpx;
		margin: 0 auto;
		margin-top: 32rpx;
		padding: 0 32rpx;
		box-sizing: border-box;
		font-size: 34rpx;
		color: rgba(0, 0, 0, 0.9);

		.cell-tips {
			color: rgba(0, 0, 0, 0.4);
		}
	}

	.log-out-btn {
		width: 686rpx;
		margin: 0 auto;
		background-color: #FFFFFF;
		margin-top: 48rpx;
		border-radius: 16rpx;
		border: none;
	}
</style>