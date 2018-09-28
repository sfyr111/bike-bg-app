/**
 * create at 09/19/18
 */
import React, { Component } from 'react'
import { Card, Button, message, Modal } from 'antd'
import _ from 'lodash'

// components
import { ETable } from '../../components'
import { HandleFormComponent, } from './components'

// axios
import axiosApi from '../../axios'

// util
import { utils } from '../../utils'

// const 
import { permissonColumns } from './constants'

const CREATE = 'option_create'
const SETTING = 'option_setting'
const AUTH = 'option_auth'

class CurrentPage extends Component{
	state = {
		list: [],
		pagination: null,
		selectedRowKeys: [], // rowKeys 存储的即是选择 的 item ids 
		selectedItems: [], // 选择的 list items
		modalTitle: '',
		modalVisible: false,
		modalType: '',
	}

	modelForm = null

	params = {
		page: 1
	}

	tableWidth = utils.calculateTableWidth(permissonColumns)+60 // 'radio' width 60

	componentDidMount(){
		this._requestList()
	}

	_requestList = async ()=>{
		try{
			const _this = this
			const ret = await axiosApi.ajax({
				url: 'role/list',
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

	_btnClick = (code)=>{
		const {selectedRowKeys} = this.state
		if((code === SETTING || code === AUTH) && selectedRowKeys.length === 0 ){
			message.info('请选择一个角色')
			return
		}
		let curTitle = ''
		switch(code){
			case CREATE:
				curTitle = '创建角色'
				break
			case SETTING:
				curTitle = '设置权限'
				break
			case AUTH:
				curTitle = '用户授权'
				break
			default:
				break
		}
		this.setState({
			modalTitle: curTitle,
			modalVisible: true,
			modalType: code
		})
	}

	// modal
	_hideModal = ()=>{
		const {resetFields} = this.modelForm.props.form
		// 重置 model form
		resetFields()
		this.setState({
			modalTitle: '',
			modalType: '',
			modalVisible: false
		})
	}
	_modalSubmit = ()=>{
		const { modalType, selectedRowKeys, selectedItems } = this.state
		const {getFieldsValue, validateFields, resetFields} = this.modelForm.props.form
		let modelValues = getFieldsValue()
		validateFields((err, values)=>{
			if(!err){
				// 设置权限 情况 modelValues 需要补充 修改的 item menus内容
				if(modalType === SETTING ){
					modelValues = {
						...modelValues,
						menus: (_.isArray(selectedItems) && selectedItems.length>0) ? selectedItems[0].menus : [],
						role_id: (_.isArray(selectedRowKeys) && selectedRowKeys.length>0) ? selectedRowKeys[0] : null
					}
				} 
				// 重置 model form
				resetFields()
				this._hideModal()
				this._handleSubmitQuery(modelValues)
			}
		})
	}
	_handleSubmitQuery = async (values)=>{
		let failMsg = ''
		try{
			const {modalType} = this.state
			let curUrl
			if(modalType === CREATE){
				curUrl = 'role/create'
				failMsg = '创建角色'
			} else if(modalType === SETTING){
				curUrl = 'role/edit'
				failMsg = '设置权限'
			} else {
				curUrl = ''
				failMsg = '用户授权'
			}
			const ret = await axiosApi.ajax({
				url: curUrl,
				data: {
					isShowLoading: true,
					params: values
				}
			})
			message.success(ret.message)
			this._requestList()
		}catch(e){
			console.log('_handleSubmitQuery e=>', e)
			message.error(`${failMsg}失败`)
		}
	}

	// 更新 设置权限 复选框选择内容
	_updateCheckKeys = (keys)=>{
		const {selectedItems} = this.state
		if(_.isArray(selectedItems) && selectedItems.length > 0){
			let newSelItems = [] 
			selectedItems.forEach((item, idx)=>{
				if(idx===0){
					item.menus = keys
				}
				newSelItems.push(item)
			})
			this.setState({
				selectedItems: newSelItems
			})
		}
	}

	render(){
		const { 
			list, pagination, selectedRowKeys, selectedItems,
			modalTitle, modalVisible, modalType,
		} = this.state
		let curData = (_.isArray(selectedItems) && selectedItems.length > 0) ? selectedItems[0] : null
		return (
			<div>
				<Card>
					<Button type="primary" 
						onClick={()=> this._btnClick(CREATE)}
					>创建角色</Button>
					<Button type="primary" onClick={()=> this._btnClick(SETTING)} 
						style={{marginLeft: 10}}
					>设置权限</Button>
					<Button type="primary" onClick={()=> this._btnClick(AUTH)} 
						style={{marginLeft: 10}}
					>用户授权</Button>
					<div className="content-wrap" style={{marginTop: 20}}>
						<ETable 
							updateSelectedItem={(keys, items)=>utils.updateSelectedItem(this, keys, items)}
							columns={permissonColumns}
							dataSource={list}
							pagination={pagination}
							rowSelection={'radio'}
							scroll={{x: this.tableWidth, y: 500}}
							selectedRowKeys={selectedRowKeys}
						/>
					</div>
				</Card>
				<Modal title={modalTitle} visible={modalVisible}
					onCancel={this._hideModal}
					onOk={this._modalSubmit}
				>
					<HandleFormComponent 
						currentData={modalType === SETTING ? curData : null}
						editRoleName={modalType === SETTING}
						showTree={modalType === SETTING}
						wrappedComponentRef={(form)=> this.modelForm = form}
						updateCheckKeys={this._updateCheckKeys}
					/>
				</Modal>
			</div>
		)
	}
}

export default CurrentPage