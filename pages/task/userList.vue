<template>
	<view>
		<uni-indexed-list :options="list" :showSelect="false" @click="bindClick"></uni-indexed-list>
	</view>
</template>

<script lang="ts" setup>
	// uniapp 页面生命周期
	import { onLoad } from '@dcloudio/uni-app'
	import { ref } from "vue";
	import { getUserListByQuery } from '@/api/apis'

	const pages = getCurrentPages();
	const currentPage = pages[pages.length - 1];
	// 用于页面之间通讯
	const eventChannel = currentPage.getOpenerEventChannel();

	const list = ref([]);

	let userList = [];
	const getUserList = () => {
		getUserListByQuery({ pageIndex: 0, pageSize: 9999 }).then((res : any) => {
			userList = res.result.data;
			list.value = userList.reduce((prov : Array<any>, cur : any) => {
				let letter = cur.name.substring(0, 1)
				let index = prov.findIndex(e => e.letter === letter);
				let itemName = `${cur.name}(${cur.username})`
				if (index < 0) {
					prov.push({
						letter,
						data: [itemName]
					})
				} else prov[index].data.push(itemName);
				return prov;
			}, []);
		});
	};

	const bindClick = (e : any) => {
		let info = userList.find(item => `${item.name}(${item.username})` === e.item.name);
		uni.navigateBack();
		eventChannel.emit('chooseUser', info);
	};
	
	onLoad(() => {
		getUserList();
	});
</script>

<style lang="scss" scoped>

</style>