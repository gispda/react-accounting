
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { Menu, Icon } from 'antd'

class Header extends Component {
  constructor(props) {
    super(props)
    this.state = {
      current: 'dashboard'
    }
  }

  changeRoute(e) {
    console.log(e.key)
    this.setState({
      current: e.key
    })
  }

  render() {
    return <div className="ant-layout-header">
      <Menu onClick={(e) => this.changeRoute(e)}
        selectedKeys={[this.state.current]}
        mode="horizontal"
      >
        <Menu.Item key="dashboard">
          <Link to='dashboard'><Icon type="line-chart" />Dashboard</Link>
        </Menu.Item>
        <Menu.Item key="metadata">
          <Link to='metadata'><Icon type="desktop" />Meta Data</Link>
        </Menu.Item>
      </Menu>
    </div>
  }
}

export default Header