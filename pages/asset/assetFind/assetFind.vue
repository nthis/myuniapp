<template>
	<view class="page-container">
		<block v-for="item in knifeList" :key="item.id">
			<AssetCard :info="item" />
		</block>
	</view>
</template>

<script lang="ts" setup>
	import { onBackPress, onHide, onShow } from '@dcloudio/uni-app';
	import { ref } from "vue";
	import AssetCard from '../components/assetCard.vue';
	import { requestResponse } from '@/api/index'
	import { knifeListByQuery } from '@/api/apis'
	// 引入 RFID 原生插件
	const RfidModule = uni.requireNativePlugin('Ucchip-RfidModule');
	
	// 根据读取到的 RFID 显示刀具列表
	const rfidList = ref([]);
	const readRfid = (rfid: string) => {
		if (rfidList.value.includes(rfid)) return;
		
		rfidList.value.push(rfid);
		getKnifeList(rfid);
	};
	const startInventory = () => {
		uni.showToast({
			icon: 'none',
			title: '开始读取'
		});
		RfidModule.startInventory((cb: any) => {
			if (cb.code == 200) readRfid(cb.data);
			// uni.showToast({
			// 	icon: 'none',
			// 	title: cb.data
			// })
		});
	};
	
	
	// 刀具列表
	const knifeList = ref([]);
	// 根据 RFID 查询刀具信息
	const getKnifeList = (rfid: string) => {
		const params = {
			// where: `rfidNumber=${rfid}`
			where: `rfidNumber like %${rfid}%`
		};
		knifeListByQuery(params).then((res: requestResponse) => {
			if (res.result.data.length > 0) {
				knifeList.value.push(res.result.data[0]);
			};
		});
	};
	
	const stopInventory = () => {
		RfidModule.stopInventory((cb: any) => {
			console.log('停止读取：', cb);
			uni.showToast({
				icon: 'none',
				title: '停止读取'
			})
		});
	};
	
	// 退出页面和页面隐藏时关闭 RFID 数据读取
	onBackPress(stopInventory);
	onHide(stopInventory);
	
	// 页面显示时打开 RFID 数据读取
	onShow(startInventory);
</script>

<style lang="scss" scoped>
	.page-container {
		padding: 32rpx;
		box-sizing: border-box;
	}
</style>