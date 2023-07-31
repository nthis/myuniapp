<template>
	<view>
		start page
	</view>
</template>

<script lang="ts" setup>
	import { TOKEN_KEY } from '@/api/index'
	
	// uni.setStorageSync('APP-IP-ADDRESS', '	');
	// uni.setStorageSync('APP-PORT', '60006');
	
	const token = uni.getStorageSync(TOKEN_KEY);
	// // 启动页，判断是否登录
	uni.reLaunch({
		url: token ? '/pages/index/index' : '/pages/index/login',
		complete: res => {
			console.log('启动页:', res);
			uni.showToast({
				icon: 'none',
				title: res
			})
		}
	});
</script>

<style>

</style>