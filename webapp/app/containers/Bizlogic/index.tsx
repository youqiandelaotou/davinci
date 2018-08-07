/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2017 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * >>
 */

import * as React from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Link } from 'react-router'
import { InjectedRouter } from 'react-router/lib/Router'

import { compose } from 'redux'
import injectReducer from '../../utils/injectReducer'
import injectSaga from '../../utils/injectSaga'
import reducer from './reducer'
import saga from './sagas'

import Container from '../../components/Container'
import Box from '../../components/Box'
import SearchFilterDropdown from '../../components/SearchFilterDropdown'

const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Table = require('antd/lib/table')
const Button = require('antd/lib/button')
const Tooltip = require('antd/lib/tooltip')
const Icon = require('antd/lib/icon')
const Popconfirm = require('antd/lib/popconfirm')
const Breadcrumb = require('antd/lib/breadcrumb')

import { loadBizlogics, deleteBizlogic } from './actions'
import { makeSelectBizlogics, makeSelectTableLoading } from './selectors'
const utilStyles = require('../../assets/less/util.less')
import { makeSelectLoginUser } from '../App/selectors'

interface IBizlogicsProps  {
  params: any
  bizlogics: boolean | any[]
  loginUser: object
  tableLoading: false
  router: InjectedRouter
  onLoadBizlogics: (projectId: number) => any
  onDeleteBizlogic: (id: number) => any
}

interface IBizlogicsStates {
  tableSource: any[]
  tableSortedInfo: {columnKey?: string, order?: string}
  nameFilterValue: string
  nameFilterDropdownVisible: boolean
  screenWidth: number
}

export class Bizlogics extends React.PureComponent<IBizlogicsProps, IBizlogicsStates> {
  constructor (props) {
    super(props)
    this.state = {
      tableSource: [],
      tableSortedInfo: {},
      nameFilterValue: '',
      nameFilterDropdownVisible: false,
      screenWidth: 0
    }
  }

  public componentWillMount () {
    this.props.onLoadBizlogics(this.props.params.pid)
    this.setState({ screenWidth: document.documentElement.clientWidth })
  }

  public componentWillReceiveProps (props) {
    // const { loginUser } = this.props

    window.onresize = () => this.setState({ screenWidth: document.documentElement.clientWidth })

    if (props.bizlogics) {
      this.setState({
        tableSource: props.bizlogics.map((g) => {
          g.key = g.id
          return g
        })
      })
    }
  }

  private showAdd = () => {
    const { params } = this.props
    this.props.router.push(`/project/${params.pid}/bizlogic`)
  }

  private showDetail = (id) => () => {
    this.props.router.push(`/project/${this.props.params.pid}/bizlogic/${id}`)
  }

  private handleTableChange = (pagination, filters, sorter) => {
    this.setState({ tableSortedInfo: sorter })
  }

  private onSearchInputChange = (e) => {
    this.setState({ nameFilterValue: e.target.value })
  }

  private onSearch = () => {
    const val = this.state.nameFilterValue
    const reg = new RegExp(val, 'gi')

    this.setState({
      nameFilterDropdownVisible: false,
      tableSource: (this.props.bizlogics as any[]).map((record) => {
        const match = record.name.match(reg)

        if (!match) {
          return null
        }

        return {
          ...record,
          name: (
            <span>
              {record.name.split(reg).map((text, i) => (
                i > 0 ? [<span key={i} className={utilStyles.highlight}>{match[0]}</span>, text] : text
              ))}
            </span>
          )
        }
      }).filter((record) => !!record)
    })
  }

  public render () {
    const {
      tableSource,
      tableSortedInfo,
      nameFilterValue,
      nameFilterDropdownVisible,
      screenWidth
    } = this.state

    const {
      onDeleteBizlogic,
      tableLoading
    } = this.props

    const columns = [{
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      filterDropdown: (
        <SearchFilterDropdown
          placeholder="name"
          value={nameFilterValue}
          onChange={this.onSearchInputChange}
          onSearch={this.onSearch}
        />
      ),
      filterDropdownVisible: nameFilterDropdownVisible,
      onFilterDropdownVisibleChange: (visible) => this.setState({ nameFilterDropdownVisible: visible }),
      sorter: (a, b) => a.name > b.name ? -1 : 1,
      sortOrder: tableSortedInfo.columnKey === 'name' && tableSortedInfo.order
    }, {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    }, {
      title: 'Source',
      dataIndex: 'sourceId',
      key: 'sourceId',
      render: (text, record) => record.source.name
    }, {
      title: '操作',
      key: 'action',
      width: 120,
      className: `${utilStyles.textAlignCenter}`,
      render: (text, record) => (
        <span className="ant-table-action-column">
          <Tooltip title="修改">
            <Button icon="edit" shape="circle" type="ghost" onClick={this.showDetail(record.id)} />
          </Tooltip>
          <Popconfirm
            title="确定删除？"
            placement="bottom"
            onConfirm={onDeleteBizlogic(record.id)}
          >
            <Tooltip title="删除">
              <Button icon="delete" shape="circle" type="ghost" />
            </Tooltip>
          </Popconfirm>
        </span>
      )
    }]

    const pagination = {
      simple: screenWidth < 768 || screenWidth === 768,
      defaultPageSize: 20,
      showSizeChanger: true
    }

    return (
      <Container>
        <Helmet title="View" />
        <Container.Title>
          <Row>
            <Col span={24}>
              <Breadcrumb className={utilStyles.breadcrumb}>
                <Breadcrumb.Item>
                  <Link to="">View</Link>
                </Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>
        </Container.Title>
        <Container.Body>
          <Box>
            <Box.Header>
              <Box.Title>
                <Icon type="bars" />View List
              </Box.Title>
              <Box.Tools>
                <Tooltip placement="bottom" title="新增">
                  <Button type="primary" icon="plus" onClick={this.showAdd} />
                </Tooltip>
              </Box.Tools>
            </Box.Header>
            <Box.Body>
              <Row>
                <Col span={24}>
                  <Table
                    dataSource={tableSource || []}
                    columns={columns}
                    pagination={pagination}
                    onChange={this.handleTableChange}
                    loading={tableLoading}
                    bordered
                  />
                </Col>
              </Row>
            </Box.Body>
          </Box>
        </Container.Body>
      </Container>
    )
  }
}

export function mapDispatchToProps (dispatch) {
  return {
    onLoadBizlogics: (projectId) => dispatch(loadBizlogics(projectId)),
    onDeleteBizlogic: (id) => () => dispatch(deleteBizlogic(id))
  }
}

const mapStateToProps = createStructuredSelector({
  bizlogics: makeSelectBizlogics(),
  loginUser: makeSelectLoginUser(),
  tableLoading: makeSelectTableLoading()
})

const withConnect = connect(mapStateToProps, mapDispatchToProps)

const withReducerBizlogic = injectReducer({ key: 'bizlogic', reducer })
const withSagaBizlogic = injectSaga({ key: 'bizlogic', saga })

export default compose(
  withReducerBizlogic,
  withSagaBizlogic,
  withConnect
)(Bizlogics)

