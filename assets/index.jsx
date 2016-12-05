
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import Request from 'superagent'
import classnames from 'classnames'

import { getAllDatas } from './components/Actions.jsx'
import Store from './components/Reducer.jsx'

import LoginPage from './components/LoginPage.jsx'
import ChartsDatas from './components/ChartsDatas.jsx'
import Summary from './components/Summary.jsx'
import FormOptions from './components/FormOptions.jsx'
import DetailLists from './components/DetailLists.jsx'
import LogSpecDetail from './components/LogSpecDetail.jsx'

class App extends Component {

	constructor(props) {
		console.time('App constructor()')
		super(props)
		this.state = this.initGenData()
		console.log(this.state)
		if (this.state.loginStatus) {
			Store.dispatch(getAllDatas('Pending'))
		}
		console.timeEnd('App constructor()')
	}

	componentDidMount() {
		console.time('App componentDidMount()')
		Store.subscribe(() => {
			let newState = this.initGenData()
			newState.chartActive = this.state.chartActive
			newState.detailActive = this.state.detailActive
			this.setState(newState)
		})
		console.timeEnd('App componentDidMount()')
	}

	initGenData() {
		let initData = Store.getState()
		let newState = {}
		newState.loginStatus = initData.loginStatus
		newState.loginPending = initData.loginPending
		newState.log = this.parseLogData(initData.log)
		newState.logSpec = this.parseLogSpecData(initData.logSpec)
		newState.pending = initData.pending
		newState.addPending = initData.addPending
		newState.chartActive = true
		newState.detailActive = false
		return newState
	}

	render() {
		let height = 400//Math.ceil(window.innerHeight / 4) * 3
		this.state.log.chartsData.height = height
		let ChartsClass = classnames({
			'is-active': this.state.chartActive
		})
		let DetailsClass = classnames({
			'is-active': this.state.detailActive
		})
		let ChartsTab = classnames({
			'index-tabs': true,
			'index-tabs-active': this.state.chartActive
		})
		let DetailsTab = classnames({
			'index-tabs': true,
			'index-tabs-active': this.state.detailActive
		})
		return <div>
			{!this.state.loginStatus ?
				<LoginPage pending={this.state.loginPending} />
			:
				<div>
					<Summary data={this.state.log.sum} />
					<div className="tile is-parent">
						<article className="tile is-child notification">
	        				<p className="title">Add new record</p>
							<FormOptions pending={this.state.pending} />
						</article>
					</div>
					<nav className="tabs">
						<ul>
							<li className={ChartsClass} onClick={this._selectTab.bind(this, 'chartActive')}><a>Charts</a></li>
							<li className={DetailsClass} onClick={this._selectTab.bind(this, 'detailActive')}><a>Details</a></li>
						</ul>
					</nav>
					<div className={ChartsTab}>
						<ChartsDatas pending={this.state.pending} data={this.state.log.chartsData} />
					</div>
					<div className={DetailsTab}>
						<div className="columns columns-overflow">
							<div className="column">
								<DetailLists data={this.state.log.detailsData} />
							</div>
						</div>
						<div className="details-placeholder"></div>
					</div>
				</div>
			}
		</div>
		
	}

	_selectTab(which, e) {
		let newState = this.state
		newState[which] = !newState[which]
		let another = which == 'chartActive' ? 'detailActive' : 'chartActive'
		newState[another] = !newState[another]
		Object.keys(newState.log.sum).map((name) => {
			newState.log.sum[name] = Number(newState.log.sum[name].join('.').replace(/,/g, ''))
			console.log(name, newState.log.sum[name])
		})
		console.log('clicked', this.state, this.state.log.sum)
		this.setState(newState)
	}

	myOrderBy(prev, next) {
		if (prev && next) {
			let prevDateYear = Number(prev.date_year)
			let prevDate = Number(prev.date)
			let prevId = Number(prev.id)

			let nextDateYear = Number(next.date_year)
			let nextDate = Number(next.date)
			let nextId = Number(next.id)

			if (prevDateYear < nextDateYear) {
				return -1
			}
			if (prevDateYear > nextDateYear) {
				return 1
			}
			if (prevDate < nextDate) {
				return -1
			}
			if (prevDate > nextDate) {
				return 1
			}
			if (prevId < nextId) {
				return -1
			}
			if (prevId > nextId) {
				return 1
			}
		}
		return 0
	}

	parseLogData(_data) {
		console.time('App parseAllData()')
		console.log(_data)
		// let data = orderBy(JSON.parse(JSON.stringify(_data)), ['date_year', 'asc'], ['date', 'asc'], ['id', 'asc'])
		let data = JSON.parse(JSON.stringify(_data)).sort(this.myOrderBy)
		let chartsData = this.parseChartsData(data)
		let resData = {
			"sum": {
				"shouru": chartsData.shouru.length && chartsData.shouru.reduce((p, c, i, o) => {
					if (isNaN(Number(c))) {
						c = 0
					}
					return p + c
				}, 0) || 0,
				"zhichu": chartsData.zhichu.length && chartsData.zhichu.reduce((p, c, i, o) => {
					if (isNaN(Number(c))) {
						c = 0
					}
					return p + c
				}, 0) || 0,
				"ave": 0,
				"rem": 0
			},
			"chartsData": chartsData,
			"detailsData": {}
		}
		resData.sum.ave = chartsData.zhichu.length && (resData.sum.zhichu / chartsData.zhichu.length) || 0
		resData.sum.rem = resData.sum.shouru - resData.sum.zhichu
		data = data.reverse()
		data.length && data.forEach((row, index) => {
			if (row) {
				row.key = index
				let _date = row.date_year + '-' + row.date
				if (!resData.detailsData[_date]) {
					resData.detailsData[_date] = {
						active: false,
						rows: []
					}
				}
				resData.detailsData[_date].rows.push(row)
			}
		})
		console.time('App parseAllData()')
		return resData
	}

	parseChartsData(data) {
		console.time('App parseChartsData()')
		let tmpData = {}
		let chartsData = {
			"month": [],
			"shouru": [],
			"zhichu": []
		}
		data.length && data.forEach((row, index) => {
			if (row) {
				let _month = row.date_year + '-' + row.date
				tmpData[_month] = tmpData[_month] || {}
				if (row.type == 1) {
					tmpData[_month].shouru = (tmpData[_month].shouru || 0) + Number(row.amount)
				}
				if (row.type == 2) {
					tmpData[_month].zhichu = (tmpData[_month].zhichu || 0) + Number(row.amount)
				}
			}
		})
		Object.keys(tmpData).length && Object.keys(tmpData).map((key) => {
			if (!tmpData[key].shouru) {
				tmpData[key].shouru = 0
			}
			if (!tmpData[key].zhichu) {
				tmpData[key].zhichu = 0
			}
			chartsData.month.push(key)
			chartsData.shouru.push(Number(tmpData[key].shouru.toFixed(2)))
			chartsData.zhichu.push(Number(tmpData[key].zhichu.toFixed(2)))
		})
		console.timeEnd('App parseChartsData()')
		return chartsData
	}

	parseLogSpecData(_data) {
		console.time('App parseWifeData()')
		var tableData = {}
		if (_data.length) {
			let data = JSON.parse(JSON.stringify(_data))
			data = data.map((row) => {
				row.date_time = +new Date(row.date)
				return row
			})
			data = data.sort((a, b) => a.date_time - b.date_time).reverse()
			// data = orderBy(data, ['date', 'asc'], ['amount', 'asc'])
			console.log(data)
			data.map((row) => {
				var _month = row.date.split('-').map((piece) => Number(piece)).splice(0, 2).join('-')
				if (!tableData[_month]) {
					tableData[_month] = {
						total: 0,
						detail: []
					}
				}
				tableData[_month].total += Number(row.amount)
				tableData[_month].detail.push(row)
			})
			console.info(tableData)
		}
		console.timeEnd('App parseWifeData()')
		return tableData
	}

}

ReactDOM.render(<App />, document.getElementById('app'))



						// <div className="column col-3">
						// 	<h6>老婆的钱</h6>
						// 	<LogSpecDetail data={this.state.logSpec} />
						// </div>

					// {this.state.pending ? <div className="level-item loading-fixed"><div className="is-loading"></div></div> : null}
// 
