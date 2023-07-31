<template>
	<view class="page-header">
		<le-dropdown
			v-model:menuList="menuData"
			themeColor="#3185FF"
			:duration="300"
			@onConfirm="onConfirm"
		></le-dropdown>
	</view>
		
	<view class="empty-block"></view>
	
	<uni-drawer ref="filterDrawer" mode="right" :width="300">
		<view class="drawer-container">
			<view class="drawer-header">
				<uni-icons type="settings-filled" size="24"></uni-icons>
				<text>&nbsp;筛选</text>
			</view>

			<uni-forms :modelValue="formData" label-width="50">
				<block v-for="item in drawerFilter" :key="item.key">
					<uni-forms-item :label="item.label" :name="item.key">
						<uni-easyinput
							type="text"
							v-model="formData[item.key]"
							:placeholder="item.tips"
							@focus="focusInput(item)"
						/>
					</uni-forms-item>
				</block>
			</uni-forms>
			<view class="drawer-footer d-flex">
				<button @click="resetFormData">重置</button>
				<button type="primary" @click="closeDrawer">查询</button>
			</view>
		</view>
	</uni-drawer>

	<view class="page-container">
		<block v-for="item in assetList" :key="item">
			<AssetCard :info="item" :isSelect="isSelect" @change="changeState($event, item)" />
		</block>
		<uni-load-more :status="pageStatus"></uni-load-more>
	</view>
	
	<view class="empty-block" v-if="isSelect"></view>
	<view class="page-footer">
		<uni-row class="demo-uni-row" :gutter='34' v-if="isSelect">
			<uni-col :span="12">
				<button type="primary" @click="addSelectKnife()">添加选中</button>
			</uni-col>
			<uni-col :span="12">
				<button type="warn" style="background-color: #FAAD14;" @click="addAllKnife()">添加全部</button>
			</uni-col>
		</uni-row>		
	</view>
</template>

<script lang="ts" setup>
	// uniapp 页面生命周期
	import { onPullDownRefresh, onLoad, onReachBottom } from '@dcloudio/uni-app'
	import { reactive, ref } from "vue";
	import { menuList, drawerFilter } from './headerFilter'
	import { requestResponse } from '@/api/index'
	import { knifeListByQuery, getAreaListByQuery } from '@/api/apis'
	import AssetCard from '../components/assetCard.vue'

	const pages = getCurrentPages();
	const currentPage = pages[pages.length - 1];
	// 用于页面之间通讯
	const eventChannel = currentPage.getOpenerEventChannel();

	const menuData = ref(JSON.parse(JSON.stringify(menuList)));
	const headerData = reactive({});
	const filterDrawer = ref();
	const onConfirm = (e : any) => {
		switch (e.type){
			case 'click':
				filterDrawer.value.open();
				return;
			case 'cell':
				headerData[e.key] = e.value;
				break;
			case 'filter':
				e.children.forEach(t => headerData[t.key] = t.value);
				break;
			default:
				break;
		};
		uni.startPullDownRefresh();
	};
	const formKey = drawerFilter.reduce((prov, cur) => {
		prov[cur.key] = '';

		return prov;
	}, {});
	const formData: any = reactive(formKey);
	const closeDrawer = () => {
		filterDrawer.value.close();
		uni.startPullDownRefresh();
	};
	const resetFormData = () => {
		for (let key in formData) {
			formData[key] = '';
		}
	};
	const focusInput = (item: any) => {
		if (item.key === 'locationName') {
			uni.hideKeyboard();
			uni.navigateTo({
				url: '/pages/asset/areaTree/areaTree',
				events: {
					chooseArea: (res: any) => {
						let locationIds = res.value.split(',');
						formData.locationName = res.label;
						formData.location = locationIds[locationIds.length - 1];
					}
				}
			})
		}
	};
	
	const assetList = ref([]);
	const pageStatus = ref('more');
	const page = {
		paging: true,
		pageIndex: 0,
		pageSize: 10,
	};
	const formatParams = () => {
		let terms = [];
		if (!formData.locationName) delete formData.location;
		const params = {
			...headerData,
			...formData
		};
		for(let key in params) {
			let term = {
				column: key,
				value: params[key],
				type: 'and',
				termType: 'like'					
			};
			switch (key){
				// 刀具状态
				case 'state':
					term.termType = 'in';
					if (Array.isArray(params[key]) && params[key].length > 0) terms.push(term);
					break;
				// 刀具剩余使用寿命 0~100
				case 'life':
					if (params[key] !== '-1') {
							let termObj = JSON.parse(JSON.stringify(term));
							termObj.column = 'lifeRate';
							// 后端字段是已使用的寿命
							termObj.value = 100 - Number(params[key]);
							termObj.termType = 'gte';
							terms.push(termObj);
					};
					break;
				// 忽略字段
				case 'locationName':
					break;
				default:
					term.value = '%' + term.value + '%';
					if (params[key]) terms.push(term);
					break;
			}
		};
		return terms;
	};
	const initData = () => {
		const params = {
			...page,
			terms: formatParams()
		};
		pageStatus.value = 'loading';
		knifeListByQuery(params).then((res: requestResponse) => {
			formatLocationName(res.result.data);
			assetList.value = assetList.value.concat(res.result.data);
			pageStatus.value = res.result.total > assetList.value.length ? 'more' : 'noMore';
			// console.log('assetList:', assetList.value);
			uni.stopPullDownRefresh();
		}).catch(err => {
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
		}).then((res: requestResponse) => {
			areaList.value = res.result.data;
			// console.log('区域列表：', areaList.value);
			formatLocationName(assetList.value);
		});
	};
	const formatLocationName = (metaData: Array<any>) => {
		metaData.forEach((item: any) => {
			if (item.location) {
				let location = item.location.split(',');
				let locationName = location.reduce((prov: Array<string>, cur: String) => {
					let index = areaList.value.findIndex(e => e.id === cur);
					if (index > -1) prov.push(areaList.value[index].name);
					
					return prov;
				}, []).join('-');
				
				item.locationName = locationName || '';
			}
		});
	};

	// 选择刀具
	const isSelect = ref(false);
	let selectObj: any = {};
	const changeState = (e: Boolean, info: any) => {
		selectObj[info.id] = e;
	};
	const addSelectKnife = () => {
		const knifes: Array<any> = assetList.value.reduce((prov, cur) => {
			if (selectObj[cur.id]) prov.push(cur);
			
			return prov;
		}, []);
		if (knifes.length > 0) {
			uni.navigateBack();
			eventChannel.emit('chooseAssets', knifes);
		} else {
			uni.showToast({
				icon: 'none',
				title: '请选择盘点的刀具'
			})
		}
	};
	const addAllKnife = () => {
		if (pageStatus.value === 'noMore') {
			uni.navigateBack();
			eventChannel.emit('chooseAssets', assetList.value);
		} else {
			const params = {
				pageIndex: 0,
				pageSize: 9999,
				terms: formatParams()
			};
			uni.showLoading({
				title: '添加中...'
			});
			// 查询所有刀具
			knifeListByQuery(params).then((res: requestResponse) => {
				uni.hideLoading();
				formatLocationName(res.result.data);
				uni.navigateBack();
				eventChannel.emit('chooseAssets', res.result.data);
			}).catch((err: any) => {
				console.log('查询所有刀具失败:', err);
				uni.showToast({
					icon: 'none',
					title: '添加失败!'
				});
			});
		}
	};
	
	onLoad((opt) => {
		if (opt.state) {
			headerData['state'] = [Number(opt.state)];
			menuData.value[0].children[0].value = [Number(opt.state)];
		};
		if (opt.select) {
			isSelect.value = true;
			uni.setNavigationBarTitle({
				title: '选择刀具'
			});
		}
		getAreaList();
		uni.startPullDownRefresh({
			complete: res => {
				console.log('pullComplete:', res);
			}
		})
	});
	// 页面下拉
	onPullDownRefresh(() => {
		page.pageIndex = 0;
		assetList.value = [];
		initData();
	});
	// 页面触底
	onReachBottom(() => {
		if (pageStatus.value === 'noMore') return;
		page.pageIndex += 1;
		initData();
	});
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

	.empty-block {
		width: 100%;
		height: 120rpx;
	}

	.drawer-container {
		width: 100%;
		height: 100vh;
		padding: 32rpx;
		box-sizing: border-box;
		background-color: #fff;
		position: relative;

		.drawer-header {
			display: flex;
			align-items: center;
			margin-bottom: 60rpx;
			font-size: 28rpx;
			color: #000;
			margin-bottom: 32rpx;
		}

		.drawer-footer {
			width: 100%;
			position: fixed;
			bottom: 32rpx;
			left: 0;

			button {
				width: 260rpx;
			}
		}
	}

	.page-container {
		padding: 32rpx;
		box-sizing: border-box;
	}
	
	.page-footer {
		width: 100%;
		position: fixed;
		bottom: 0%;
		left: 0%;
		padding: 32rpx;
		box-sizing: border-box;
		background-color: #fff;
		box-shadow: 0px 18rpx 30rpx 2rpx rgba(24,144,255,0.15);
	}
</style>