export const TOKEN_KEY = 'X-Access-Token';
export const USER_INFO = 'UCCHIP-USERINFO';

export interface requestResponse {
	message: string;
	result: any;
	status: number;
	timestamp: number;
}

const enum ToastType {
	Error = 'error',
	Exception = 'exception',
	Fail = 'fail',
	Loading = 'loading',
	None = 'none',
	Success = 'success'
};

class Request {
	// baseUrl : string
	header : Object

	constructor() {
		// this.baseUrl = requestAddress;
		this.header = {};
	};
	
	// 获取请求的 IP 地址
	getRequestIpAddress() {
		const ipAddress : string = uni.getStorageSync('APP-IP-ADDRESS') || '';
		const port : string = uni.getStorageSync('APP-PORT') || '';
		let requestAddress = ipAddress.indexOf('http') === 0 ? ipAddress : 'http://' + ipAddress;
		if (port) requestAddress += `:${ port }`;
		
		// return ipAddress ? requestAddress + '/api' : '';
		return ipAddress ? requestAddress : '';
	};
	
	requestToast(title: string, type: ToastType = ToastType.None) {
		uni.showToast({
			icon: type,
			title
		});
	};

	// 错误处理
	errorCheck(res : any, errfun = () => { }, resfun = () => { }) {
		console.log('errorCheck:', res);
		switch (res.statusCode) {
			case 200:
				typeof resfun === 'function' && resfun();
				return true;
			case 401:
				uni.removeStorageSync(TOKEN_KEY);
				uni.removeStorageSync(USER_INFO);
				uni.reLaunch({
					url: '/pages/index/login'
				});
				return false;
			default:
				typeof errfun === 'function' && errfun();
				this.requestToast(res.data && res.data.message || '服务器请求失败');
				return false;
		};
	};

	// options 参数说明，请参考 https://uniapp.dcloud.net.cn/api/request/request.html
	request(options : any = {}) {
		return new Promise((resolve, reject) => {
			const requestAddress = this.getRequestIpAddress();
			if (!requestAddress) {
				uni.stopPullDownRefresh();
				this.requestToast('请先配置服务器地址');
				reject('请先配置服务器地址');
				return;
			};
			
			options.header = options.header || this.header;
			options.method = options.method || 'GET';
			options.url = options.url.indexOf('http') === 0 ? options.url : requestAddress + options.url;
			
			const userToken = uni.getStorageSync(TOKEN_KEY);
			// TODO：token增加等操作
			if (userToken) {
				options.header[TOKEN_KEY] = userToken;
			}
			uni.request({
				...options,
				success: (res : any) => {
					this.errorCheck(res) ? resolve(res.data) : reject(res);
				},
				fail: (err : any) => {
					reject(err);
				}
			});
		});
	};

	get(url : string, data : any = {}, options : any = {}) {
		options.url = url;
		options.data = data;
		options.method = "GET";

		return new Promise((resolve, reject) => {
			this.request(options).then(resp => resolve(resp)).catch(err => reject(err));
		});
	};

	post(url : string, data : any = {}, options : any = {}) {
		options.url = url;
		options.data = data;
		options.method = "POST";
		return new Promise((resolve, reject) => {
			this.request(options).then(resp => resolve(resp)).catch(err => reject(err));
		});
	};

	put(url : string, data : any = {}, options : any = {}) {
		options.url = url;
		options.data = data;
		options.method = "PUT";
		return new Promise((resolve, reject) => {
			this.request(options).then(resp => resolve(resp)).catch(err => reject(err));
		});
	};

	delete(url : string, data : any = {}, options : any = {}) {
		options.url = url;
		options.data = data;
		options.method = "DELETE";
		return new Promise((resolve, reject) => {
			this.request(options).then(resp => resolve(resp)).catch(err => reject(err));
		});
	};
	
	/**
	 * @param file 文件路径
	 * @description 文件上传
		* */
	uploadFile(file: string) {
		const userToken = uni.getStorageSync(TOKEN_KEY);
		return new Promise((resolve, reject) => {
			uni.uploadFile({
				url: this.getRequestIpAddress() + '/file/static',
				filePath: file,
				name: 'file',
				header: {
					[TOKEN_KEY]: userToken
				},
				success: res => {
					resolve(res);
				},
				fail: err => {
					reject(err);
				}
			});
		});
	}
}

export const server = new Request();