<template>
	<image src="/static/BG@2x.png" mode="" class="login-header"></image>

	<view class="login-container">
		<image src="/static/icon.png" mode="" class="login-icon"></image>
		<uni-forms :modelValue="formData" :rules="formRules" ref="form">
			<uni-forms-item label="" name="username">
				<uni-easyinput type="text" prefixIcon="person" v-model="formData.username" placeholder="请输入账号" />
			</uni-forms-item>
			<uni-forms-item label="" name="password">
				<uni-easyinput type="password" prefixIcon="locked" v-model="formData.password" placeholder="请输入密码" />
			</uni-forms-item>
		</uni-forms>
		<button @click="submitForm" class="login-btn">登录</button>
		<view class="login-container-tips">{{ tips }}</view>
	</view>

	<view class="service-set">
		<view class="icon-container" @click="toSet">
			<uni-icons type="gear" size="24" color="#eee"></uni-icons>
		</view>
		<view class="">服务器设置</view>
	</view>
</template>

<script lang="ts" setup>
	import { reactive, ref } from "vue";
	import { authLogin } from '@/api/apis'
	import { TOKEN_KEY, USER_INFO } from '@/api/index'

	const tips = '新用户请联系管理员分配帐号和密码';
	const formData = reactive({
		username: '',
		password: ''
	});
	const formRules = {
		username: {
			rules: [
				{ required: true, errorMessage: '请填写账号' }
			],
			label: '账号',
			validateTrigger: 'submit'
		},
		password: {
			rules: [
				{ required: true, errorMessage: '请填写密码' }
			],
			label: '密码',
			validateTrigger: 'submit'
		}
	};
	const form = ref();
	const submitForm = () => {
		form.value.validate().then((res : any) => {
			// console.log('res:', res, authLogin);
			loginApp(res)
		}).catch(() => {
			uni.showToast({
				icon: 'none',
				title: '请填写账号或密码'
			})
		});
	};
	const loginApp = async (data : any) => {
		uni.showLoading({
			title: '登录中...'
		});
		authLogin(data).then((resp: any) => {
			// console.log('登录:', resp);
			uni.hideLoading();
			uni.showToast({
				icon: 'success',
				title: '登录成功'
			});
			uni.setStorageSync(USER_INFO, resp.result);
			uni.setStorageSync(TOKEN_KEY, resp.result.token);

			setTimeout(() => {
				uni.reLaunch({
					url: '/pages/index/index'
				});
			}, 200);			
		}).catch((err) => {
			console.log('err:', err);
			uni.showToast({
				icon: 'error',
				title: '登录失败'
			})
		});
	};

	const toSet = () => {
		uni.navigateTo({
			url: '/pages/index/serviceSet'
		})
	}
</script>

<style lang="scss" scoped>
	.login-header {
		width: 100%;
		height: 434rpx;
	}

	.login-container {
		width: calc(100vw - 64rpx);
		padding: 32rpx;
		box-sizing: border-box;
		background-color: rgba(247, 247, 247, .7);
		backdrop-filter: blur(16rpx);
		margin: 0 auto;
		border-radius: 24rpx;
		transform: translateY(-120rpx);
		font-size: 28rpx;
		text-align: center;
		color: rgba(0, 0, 0, 0.5);

		.login-icon {
			width: 160rpx;
			height: 160rpx;
			border-radius: 50%;
			position: relative;
			top: -110rpx;
		}

		.login-btn {
			color: #fff;
			background: linear-gradient(90deg, #0ACFFE 0%, #495AFF 100%);
			box-shadow: 0rpx 18rpx 30rpx 2rpx rgba(24, 144, 255, 0.15);
			border-radius: 76rpx;
			margin-bottom: 48rpx;
		}
	}

	.service-set {
		width: 100%;
		position: fixed;
		bottom: 126rpx;
		left: 0%;

		font-size: 28rpx;
		color: rgba(0, 0, 0, 0.5);

		display: flex;
		flex-direction: column;
		// justify-content: center;
		align-items: center;

		.icon-container {
			width: 80rpx;
			height: 80rpx;
			text-align: center;
			line-height: 80rpx;
			border-radius: 50%;
			background-color: #000;
			margin-bottom: 16rpx;
		}
	}
</style>