<template>
	<view class="page-container">
		<view class="edit-container" v-if="isEdit">
			<uni-forms :modelValue="formData" :rules="rules" :label-width="90" label-position="top" ref="formRef">
				<block v-for="item in editInfoFields" :key="item.key">
					<uni-forms-item :label="item.label" :name="item.key" :required="item.required">
						<!-- 数字输入 -->
						<uni-number-box v-model="formData[item.key]" v-if="item.type === 'number'"></uni-number-box>
						
						<!-- 文件上传 -->
						<uni-file-picker
							v-else-if="item.type === 'img'"
							v-model="formData[item.key]" 
							fileMediatype="image" 
							mode="grid"
							ref="filesUpload"
							:limit="9"
							:auto-upload="false"
							@select="selectFile"
						/>
						
						<!-- 单选 -->
						<uni-combox
							label=""
							:candidates="candidates"
							:placeholder="item.tips"
							v-model="formData[item.key]"
							v-else-if="item.type === 'select'"
						></uni-combox>
						
						<!-- 级联选，只能选到最后一级 -->
						<!-- <uni-data-picker
							:localdata="cascadeData"
							:popup-title="item.tips"
							@nodeclick="onnodeclick($event, item)"
							v-model="formData[item.key]"
							v-else-if="item.type === 'cascade'"
						></uni-data-picker> -->
						
						<!-- 输入框 -->
						<uni-easyinput
							:type="item.type"
							v-else
							v-model="formData[item.key]"
							:placeholder="item.tips"
							@focus="focusInput(item)"
						/>
					</uni-forms-item>					
				</block>
			</uni-forms>
		</view>
		
		<AssetCard v-else
			:showImg="false"
			:fieldList="detailFields"
			:isDetail="true"
			:info="formData"
			useType="info"
		/>
		
		<!-- #ifndef APP -->
		<button @click="infoAction">{{ isEdit ? '确定' : '编辑' }}</button>
		<!-- #endif -->
	</view>
	
</template>

<script lang="ts" setup>
	// uniapp 页面生命周期
	import { onNavigationBarButtonTap, onLoad } from '@dcloudio/uni-app'
	import { computed, nextTick, reactive, ref } from "vue";
	import AssetCard from '../components/assetCard.vue'
	import { infoFields } from './data'
	import { knifeTypeListByQuery, getKnifeInfo, saveKnifeInfo, getAreaListByQuery } from '@/api/apis'
	import { server, requestResponse } from '@/api/index'
	
	const formRef = ref();
	const formData: any = reactive({});
	const detailFields = computed(() => {
		return infoFields.map(e => {
			let obj = {
				label: e.label,
				key: e.key,
				type: e.type
			};
			
			switch (e.key){
				case 'maintenanceResidualCount':
					obj.type = 'warning'
					break;
				case 'residualLife':
					if (formData.lifeRate && formData.lifeRate >= 95) obj.type = 'warning';
					break
				default:
					break;
			}
			
			return obj;
		});
	});
	const editInfoFields = computed(() => {
		let fields = [
			{
				label: '品名',
				key: 'productName',
				type: 'input',
				tips: '请输入品名',
				required: true
			},
			...infoFields.filter(e => e.edit)
		];
		return fields;
	});
	const rules = editInfoFields.value.reduce((prov, cur) => {
		if (cur.required) {
			prov[cur.key] = {
				rules: [
					{ required: true, errorMessage: cur.tips }
				],
				label: cur.label,
				validateTrigger: 'submit'
			}
		}
		
		return prov;
	}, {});
	
	// const onnodeclick = (value: any, info: any) => {
	// 	formData[`${info.key}Name`] = value.text;
	// 	console.log('onnodeclick-value:', value);
	// 	console.log('onnodeclick-info:', info);
	// 	console.log('onnodeclick-formData:', formData);
	// };
	const focusInput = (item: any) => {
		if (item.key === 'locationName') {
			uni.hideKeyboard();
			uni.navigateTo({
				url: '/pages/asset/areaTree/areaTree',
				events: {
					chooseArea: (res: any) => {
						formData.locationName = res.label;
						formData.location = res.value;
					}
				}
			});
		}
	};
	
	const filesUpload = ref();
	// 选择图片
	const selectFile = (e: any) => {
		server.uploadFile(e.tempFilePaths[0]).then((res: any) => {
			let imgUrl = JSON.parse(res.data).result;
			formData.imgList.push(convertImgData(imgUrl)[0]);
		}).catch(err => {
			console.log('uploadErr:', err);
		})
	};
	
	// 刀具类型
	const knifeTypeList = ref([]);
	const candidates = computed(() => {
		return knifeTypeList.value.map(e => e.name);
	});
	const getKnifeTypeList = () => {
		knifeTypeListByQuery({ pageIndex: 0, pageSize: 9999 }).then((res: any) => {
			knifeTypeList.value = res.result.data;
		});
	};
	// 图片数据转换
	const convertImgData = (str: string) => {
		let arr = str.split(';');
		
		return arr.map(url => {
			let fileName = url.substring(url.lastIndexOf('/') + 1);
			return {
				name: fileName,
				extname: fileName.substring(fileName.lastIndexOf('.') + 1),
				url
			}
		});
	};
	// 查询刀具详情
	const getInfo = (id: string) => {
		getKnifeInfo(id).then((res: any) => {
			res.result.imgList = res.result.img ? convertImgData(res.result.img) : [];
			for(let key in res.result) {
				formData[key] = res.result[key];
			};
			
			formatLocationName();
		}).catch(err => {
			console.log('err:', err);
			uni.showToast({
				icon: 'error',
				title: '刀具信息查询失败'
			})
		});
	};
	// 查询储位名称
	const formatLocationName = async () => {
		const queryData = {
			where: formData.location.split(',').map((id: string) => `id=${id}`).join(' or ')
		};
		const resp = await getAreaListByQuery(queryData) as requestResponse;
		if (resp.result.data && resp.result.data.length > 0) {
			formData.locationName = resp.result.data.map(e => e.name).join('-');
		}
	};
	onLoad((opt: any) => {
		getInfo(opt.id);
		getKnifeTypeList();
	});
	
	// 导航栏按钮
	const isEdit = ref(false);
	// #ifdef APP
	const pages = getCurrentPages();
	const currentPage = pages[pages.length - 1];
	const currentWebView = currentPage.$getAppWebview();
	// app 端时，需要动态修改导航栏按钮名称
	onNavigationBarButtonTap((e) => {
		isEdit.value ? validateForm(e) : changeNavTitle(e);
	});
	// #endif
	const infoAction = () => {
		isEdit.value ? validateForm({}) : changeNavTitle({});
	}
	const validateForm = (event: any) => {
		nextTick(() => {
			formRef.value.validate().then(() => {
				formData.typeId = knifeTypeList.value.find(e => e.name === formData.typeName).id;
				const formValue = JSON.parse(JSON.stringify(formData));
				formValue.img = formData.imgList.map((e: any) => e.url).join(';');
				
				saveInfo(formValue, event);
			}).catch(() => {
				uni.showToast({
					icon: 'none',
					title: '请完善刀具信息'
				})
			})
		});
	};
	const saveInfo = async (formValue: any, e: any) => {
		uni.showLoading({
			title: '保存中...'
		});
		const res = await saveKnifeInfo([formValue]);
		console.log('保存信息:', res);
		uni.showToast({
			icon: 'none',
			title: '保存成功'
		});
		changeNavTitle(e);
	};
	const changeNavTitle = (e: any) => {
		// #ifdef APP
		// app 端修改导航栏按钮
		currentWebView.setTitleNViewButtonStyle(e.index, {
			text: isEdit.value ? '编辑' : '确定'
		});
		// #endif
		
		isEdit.value = !isEdit.value;
	};
</script>

<style lang="scss" scoped>
	.page-container {
		width: 100%;
		padding: 32rpx;
		box-sizing: border-box;
		
		.edit-container {
			width: 100%;
			padding: 32rpx;
			box-sizing: border-box;
			background-color: #fff;
			border-radius: 16rpx;
		}
	}
</style>