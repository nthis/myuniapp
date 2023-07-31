<template>
	<view class="set-container">
		<block v-for="item in list" :key="item.key">
			<view class="page-card">
				<view class="card-title">{{ item.label }}</view>
				<uni-easyinput :type="item.type" v-model="formData[item.key]" :placeholder="item.tips" :inputBorder="false" />
			</view>
		</block>
		
		<!-- #ifdef MP-WEIXIN -->
		<button @click="saveServiceSet">保存</button>
		<!-- #endif -->
	</view>
</template>

<script lang="ts" setup>
	import { reactive } from 'vue'
	import { onNavigationBarButtonTap, onLoad } from '@dcloudio/uni-app'

	const list = [
		{ key: 'ipAddress', label: '服务器IP', tips: '请输入服务器地址', type: 'text' },
		{ key: 'port', label: '端口', tips: '请输入端口地址', type: 'text' },
		// { key: 'key', label: '秘钥', tips: '请输入秘钥', type: 'password' },
	]
	const formData = reactive({
		ipAddress: 'https://iot-hexin.dev.ucthings.com',
		// ipAddress: '172.16.2.74',
		// port: '60004',
		key: ''
	});
	const setIpAddress = () => {
		uni.setStorageSync('APP-IP-ADDRESS', formData.ipAddress);
		uni.setStorageSync('APP-PORT', formData.port);
		uni.showToast({
			icon: 'success',
			title: '设置成功'
		});
			
		setTimeout(() => {
			uni.navigateBack();
		}, 600);
	};
	
	const saveServiceSet = () => {
		formData.ipAddress ? setIpAddress() : uni.showToast({
			icon: 'none',
			title: '请填写服务器地址'
		});
	}
	
	onLoad(() => {
		let ipAddress = uni.getStorageSync('APP-IP-ADDRESS');
		let port = uni.getStorageSync('APP-PORT')
		if(ipAddress) formData.ipAddress = uni.getStorageSync('APP-IP-ADDRESS');
		if (port) formData.port = uni.getStorageSync('APP-PORT');
	});

	// 自定义按钮点击事件
	onNavigationBarButtonTap(() => {
		saveServiceSet();
	});
</script>
<style lang="scss" scoped>
	.set-container {
		width: 100%;
		padding: 32rpx;
		box-sizing: border-box;

		.page-card {
			width: 100%;
			padding: 32rpx 12rpx;
			padding-bottom: 12rpx;
			box-sizing: border-box;
			background-color: #fff;
			margin-bottom: 32rpx;
			border-radius: 16rpx;
			box-shadow: 0rpx 10rpx 50rpx 0rpx rgba(0, 0, 0, 0.06);
			
			.card-title {
				font-size: 34rpx;
				color: rgba(0, 0, 0, 0.9);
				padding-left: 22rpx;
				// padding-bottom: 12rpx;
			}
		}
	}
</style>