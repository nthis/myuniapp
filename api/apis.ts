import { server } from './index'

interface term {
	column : string;
	value : any;
	type : string | number;
	termType: string;
	options ?: any;
	terms ?: Array<term>;
}

interface requestQuery {
	terms ?: Array<term>,
	includes ?: any;
	paging ?: Boolean;
	firstPageIndex ?: number;
	pageIndex ?: number;
	pageSize ?: number;
	sorts ?: any;
	context ?: any;
	where ?: string;
	orderBy ?: string;
	total ?: number;
	parallelPager ?: Boolean
}

const jsonOptions = {
	header: {
		'content-type': 'application/json'
	}
}

// 登录
export const authLogin = (data : any) => server.post(`/authorize/login`, data)
/**
 * 退出登录
 */
export const loginout_api = () => server.get('/user-token/reset')


// 刀具数量查询
export const knifeCountByQuery = (data : requestQuery) => server.post('/knife/manager/_count', data);
// 刀具列表查询
export const knifeListByQuery = (data : requestQuery) => server.post('/knife/manager/_query', data, jsonOptions);
// 刀具信息查询
export const getKnifeInfo = (id : string) => server.get(`/knife/manager/${id}`);
// 刀具信息保存
export const saveKnifeInfo = (data : any) => server.post('/knife/manager/save', data, jsonOptions);
// 刀具类型查询
export const knifeTypeListByQuery = (data : requestQuery) => server.post('/type-setting/_query', data, jsonOptions);
// 刀具操作查询
export const knifeOperatoinByQuery = (data: requestQuery) => server.post('/operation/records/_query', data, jsonOptions);


// 用户列表查询
export const getUserListByQuery = (data : requestQuery) => server.post('/user/detail/_query', data, jsonOptions);


// 盘点任务保存
export const saveInventoryTask = (data : any) => server.post('/inventory/task/save', data, jsonOptions);
// 更新盘点任务数据
export const updateInventoryTask = (data: any) => server.post('/inventory/task/update', data, jsonOptions);
// 盘点任务列表查询
export const getInventoryTaskList = (data : requestQuery) => server.post('/inventory/task/_query', data, jsonOptions);
// 盘点任务信息查询
export const getInventoryTaskInfo = (taskId: string) => server.get(`/inventory/task/${taskId}`);
// 查询任务关联的刀具
export const getTaskRelationKnifeList = (data : requestQuery) => server.post('/task/knife/relation/_query', data, jsonOptions);
// 盘点任务数量查询
export const getTaskCountByQuery = (data: requestQuery) => server.post('/inventory/task/_count', data, jsonOptions);
// 删除盘点任务
export const deleteInventoryTaskById = (taskId: string) => server.delete(`/inventory/task/${taskId}`);


// 区域树查询
export const getAreaTreeByQuery = (data : any = {}) => server.post('/area-manager/_tree', data, jsonOptions);
// 区域列表查询
export const getAreaListByQuery = (data : requestQuery) => server.post('/area/manager/_query', data, jsonOptions);