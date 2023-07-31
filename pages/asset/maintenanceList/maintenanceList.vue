<template>
	<view class="page-container">
		<block v-for="item in assetList" :key="item.id">
			<AssetCard :showImg="false" :fieldList="item.Fields" :info="item" useType="info" />
		</block>
		<uni-load-more :status="pageStatus"></uni-load-more>
	</view>
</template>

<script lang="ts" setup>
	// uniapp 页面生命周期
	import { onLoad, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app'
	import { ref } from 'vue'
	import AssetCard from '../components/assetCard.vue'
	import { requestResponse } from '@/api/index'
	import { knifeListByQuery, getAreaListByQuery } from '@/api/apis'

	const maintenanceFields: any = ref([
		{ label: '刀具编号', key: 'knifeNumber' },
		{ label: '刀具代码', key: 'code' },
		{ label: '型号', key: 'model' },
		{ label: '剩余寿命', key: 'residualLife', type: 'warning' },
		{ label: '剩余保养次数', key: 'maintenanceResidualCount', type: 'warning' },
		{ label: '类型', key: 'typeName' },
		{ label: '储位', key: 'locationName' },
		// { label: '预警时间', key: 'time' }
	]);

	const assetList = ref([]);
	const pageStatus = ref('more');
	const key = ref('');
	const page = {
		paging: true,
		pageIndex: 0,
		pageSize: 10,
	};
	const initData = () => {
		pageStatus.value = 'loading';
		const params = {
			...page,
			terms: [{
				column: key.value,
				value: 95,
				type: 'and',
				termType: 'gte'
			}]
		};
		knifeListByQuery(params).then((res : requestResponse) => {
			res.result.data.forEach((item: any) => {
				item.Fields = JSON.parse(JSON.stringify(maintenanceFields.value));
				// 当已使用寿命小于 95% 是，不标红
				if (item.lifeRate < 95) {
					item.Fields[3].type = 'normal'
				}
			});
			
			formatLocationName(res.result.data);
			assetList.value = assetList.value.concat(res.result.data);
			pageStatus.value = res.result.total > assetList.value.length ? 'more' : 'noMore';
			uni.stopPullDownRefresh();
		}).catch(() => {
			uni.stopPullDownRefresh();
			pageStatus.value = 'more';
		})
	};

	// 储位列表
	const areaList = ref([]);
	const getAreaList = () => {
		getAreaListByQuery({
			pageIndex: 0,
			pageSize: 999
		}).then((res : requestResponse) => {
			areaList.value = res.result.data;
			formatLocationName(assetList.value);
		});
	};
	const formatLocationName = (metaData : Array<any>) => {
		metaData.forEach((item : any) => {
			if (item.location) {
				let location = item.location.split(',');
				let locationName = location.reduce((prov : Array<string>, cur : String) => {
					let index = areaList.value.findIndex(e => e.id === cur);
					if (index > -1) prov.push(areaList.value[index].name);

					return prov;
				}, []).join('-');

				item.locationName = locationName || '';
			}
		});
	};

	onLoad((opt : any) => {
		key.value = opt.key;
		uni.setNavigationBarTitle({
			title: opt.key === 'maintenanceRate' ? '需要保养' : '即将报废'
		});
		maintenanceFields.value.push({
			label: '预警时间',
			key: opt.key === 'maintenanceRate' ? 'knifeMaintenanceAlarmTime' : 'knifeLifeAlarmTime',
			format: 'YYYY-MM-DD',
			type: 'timestamp'
		});
		getAreaList();
		uni.startPullDownRefresh({
			complete: res => {
				console.log('pullComplete:', res);
			}
		});
	});
	// 页面下拉
	onPullDownRefresh(() => {
		page.pageIndex = 0;
		assetList.value = [];
		initData();
	});
	onReachBottom(() => {
		if (pageStatus.value === 'noMore') return;
		page.pageIndex += 1;
		initData();
	});
</script>

<style lang="scss" scoped>
	.page-container {
		padding: 32rpx;
		box-sizing: border-box;
	}
</style>