/**
 * create at 09/12/18
 */
import React, { Component } from 'react'
import { Card, Button, Modal, message} from 'antd'
import _ from 'lodash'

// components
import { FilterForm, ETable, formConfig } from '../../components'
import { HandleFormComponent } from './components'

// axios
import axiosApi from '../../axios'

// utils
import {utils} from '../../utils'

// const 
import { userColumns } from './constants'
const FORM_LOGIN = 'form_option_login'
// operator code
const OPE_ADD = 'operator_add'
const OPE_EDIT = 'operator_edit'
const OPE_INFO = 'operator_info'
const OPE_DEL = 'operator_delete'

class UserListComponent extends Component{
	state = {
		list: [],
		pagination: null,
		selectedRowKeys: [], // rowKeys 存储的即是选择 的 item ids 
		selectedItems: [], // 选择的 list items
		modelIsVisible: false, 
		modelTitle: '',
		modelType: '',
	}

	tableWidth = utils.calculateTableWidth(userColumns)+60 // 'radio' width 60

	params = {
		page: 1
	}

	componentWillMount(){
		this._requestList()
	}

	formList = [
		{
			type: formConfig.baseFormType.INPUT,
			field: 'tel',
			label: '',
			placeholder: '请输入手机号',
			rules: [
				{
					required: true,
					message: '手机号码不能为空'
				},
				{
					len: 11,
					pattern: /^1\d{10}$/g,
					message: '手机号不符合规则'
				}
			]
		},
		{
			type: formConfig.baseFormType.INPUT,
			field: 'password',
			label: '',
			placeholder: '请输入密码',
			rules: [
				{
					required: true,
					message: '密码不能为空'
				},
				{
					min: 6,
					max: 20,
					message: '密码为6~20位'
				}
			]
		}
	]

	_loginClick = (code, values)=>{
		if(code === FORM_LOGIN){
			this.params = {
				...this.params,
				...values,
			}
			this._requestList()
		}
	}
	formOptions = [
		{
			type: formConfig.optionsBtnType.QUERY,
			code: FORM_LOGIN,
			btnType: 'primary',
			title: '登录',
			optionItemPress: this._loginClick
		}
	]

	_requestList = async()=>{
		try{
			const _this = this
			const ret = await axiosApi.ajax({
				url: 'user/list',
				data: {
					isShowLoading: true,
					params: this.params
				}
			})

			// 数据重置
			this.setState({
				list: _.isArray(ret.list) ? ret.list : [],
				selectedRowKeys: [],
				selectedItems: [],
				pagination: utils.pagination(ret, (current)=>{
					_this.params.page = current
					// 翻页请求数据
					_this._requestList()
				})
			})
		}catch(e){
			console.log('_requestList e=>', e)
		}
	}

	_handleOperatorClick = (code)=>{
		const { selectedRowKeys } = this.state
		if((code === OPE_EDIT || code === OPE_INFO || code === OPE_DEL) && selectedRowKeys.length<1){
			message.warn('请选择一个员工')
			return
		}
		if(code !== OPE_DEL){
			// 添加、编辑、详情
			let title = code === OPE_ADD ? '创建员工' : (
				code === OPE_EDIT ? '编辑员工' : (
					code === OPE_INFO ? '员工详情' : ''
				)
			)
			this.setState({
				modelType: code,
				modelTitle: title,
				modelIsVisible: true
			})
		} else {
			// 移除
			Modal.confirm({
				title: '确认移除',
				content: '是否要移除当前选中的员工',
				onOk: this._handleRemoveQuery,
				onCancel:()=> null
			})
		}
	}
	_hideModal = ()=>{
		const {resetFields} = this.modelForm.props.form
		// 重置 model form
		resetFields()
		this.setState({
			modelType: '',
			modelTitle: '',
			modelIsVisible: false
		})
	}
	_modelSubmit = ()=>{
		const { modelType, selectedRowKeys } = this.state
		// 添加和修改
		const {getFieldsValue, validateFields, resetFields} = this.modelForm.props.form
		let modelValues = getFieldsValue()
		// 修改时要提交修改的 员工 id
		modelType === OPE_EDIT ? modelValues.id = selectedRowKeys[0] : null
		validateFields((err, values)=>{
			if(!err){
				modelValues = {
					...modelValues,
					birthday: modelValues.birthday ? modelValues.birthday.format('YYYY-MM-DD') : '',
					registertime: modelValues.registertime ? modelValues.registertime.format('YYYY-MM-DD HH:mm') : ''
				}
				// 重置 model form
				resetFields()
				this._hideModal()
				this._handleSubmitQuery(modelValues)
			}
		})
	}
	_handleSubmitQuery = async (values)=>{
		try{
			const { modelType } = this.state
			let curUrl = modelType === OPE_ADD ? 'user/add' : ( modelType === OPE_EDIT ? 'user/edit' : '' )
			const ret = await axiosApi.ajax({
				url: curUrl ,
				data: {
					isShowLoading: true,
					params: values
				}
			})
			if(ret.success){
				await this._requestList()
				message.success(ret.result)
			} else {
				throw new Error('_handleSubmitQuery fail')
			}
		}catch(e){
			console.log('_modelSubmit e=>', e)
			message.error('提交失败')
		}
	}
	_handleRemoveQuery = async ()=>{
		try{
			const {selectedRowKeys} = this.state
			const ret = await axiosApi.ajax({
				url: 'user/remove' ,
				data: {
					isShowLoading: true,
					params: selectedRowKeys[0]
				}
			})
			if(ret.success){
				await this._requestList()
				message.success(ret.result)
			} else {
				throw new Error('_handleSubmitQuery fail')
			}
		}catch(e){
			message.error('移除失败')
		}
	} 

	render(){
		const { 
			list, pagination, selectedRowKeys, selectedItems, 
			modelIsVisible, modelTitle, modelType,
		} = this.state
		let footer = {}
		if(modelType === OPE_INFO){
			footer = {
				footer: null
			}
		}
		return (
			<div>
				<Card>
					<FilterForm formList={this.formList} options={this.formOptions}/>
				</Card>
				<Card style={{marginTop: 10}} className="operator-wrap">
					<Button type="primary" icon="plus" 
						onClick={()=> this._handleOperatorClick(OPE_ADD)}
					>创建员工</Button>
					<Button type="primary" icon="edit"  
						onClick={()=> this._handleOperatorClick(OPE_EDIT)}
					>编辑员工</Button>
					<Button type="primary"  icon="info-circle"
						onClick={()=> this._handleOperatorClick(OPE_INFO)}
					>员工详情</Button>
					<Button style={{color: '#f00'}} icon="delete"
						onClick={()=> this._handleOperatorClick(OPE_DEL)}
					>移除员工</Button>
				</Card>
				<div className="content-wrapper">
					<ETable 
						updateSelectedItem={(keys, items)=>utils.updateSelectedItem(this, keys, items)}
						columns={userColumns}
						dataSource={list}
						pagination={pagination}
						rowSelection={'radio'}
						scroll={{x: this.tableWidth, y: 500}}
						selectedRowKeys={selectedRowKeys}
					/>
				</div>
				<Modal 
					title={modelTitle}
					visible={modelIsVisible}
					onCancel={this._hideModal}
					onOk={()=> this._modelSubmit()}
					{...footer}
				>
					<HandleFormComponent  
						editAble={(modelType === OPE_ADD || modelType === OPE_EDIT) ? true : false}
						currentData={selectedItems.length>0 ? selectedItems[0] : null}
						wrappedComponentRef={(form)=> this.modelForm = form}
					/>
				</Modal>
			</div>
		)
	}
}

export default UserListComponent