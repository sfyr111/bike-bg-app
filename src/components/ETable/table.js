/**
 * create at 09/04/18
 */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Table } from 'antd'
// import _ from 'lodash'

// utils
// import { utils } from '../../utils'

class TableComponent extends Component{

	_onSelectChange = ()=>{
	}

	_onRowClick = (record, index)=>{
		const {rowSelection} = this.props
		if(rowSelection === 'checkbox'){

		} else if(rowSelection === 'radio'){
			let selectedRowKeys = [record.id]
			let selectedRowId = record.id
			this.props.updateSelectedItem(selectedRowKeys, selectedRowId)
		}
	}

	_tableInit = ()=>{
		const { 
			columns, dataSource, pagination, rowSelection, selectedRowKeys,
		} = this.props

		const defaultSection = {
			type: 'radio',
			selectedRowKeys,
			onChange: this._onSelectChange,
		}
		let initSection = null
		if(rowSelection === 'checkbox' || rowSelection === 'radio'){
			defaultSection.type = rowSelection
			initSection = defaultSection
		}
		return (
			<Table 
				bordered
				columns={columns}
				dataSource={dataSource}
				pagination={pagination}
				rowSelection={initSection}
				rowKey={record =>  record.id}
				onRow={(record, index)=>{
					return {
						onClick: ()=>{
							this._onRowClick(record, index)
						}
					}
				}}
			/>
		)
	}

	render(){
		return (
			<div>
				{this._tableInit()}
			</div>
		)
	}
}

TableComponent.propTypes = {
	columns: PropTypes.array,
	dataSource: PropTypes.array,
	pagination: PropTypes.object,
	rowSelection: PropTypes.string,
	selectedRowKeys: PropTypes.array,
	updateSelectedItem: PropTypes.func,
}

TableComponent.defaultProps = {
	columns: [],
	dataSource: [],
	pagination: {},
	rowSelection: '', // 默认不选择
	selectedRowKeys: [],
	updateSelectedItem: ()=> null,
}

export default TableComponent