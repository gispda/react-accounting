
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { Row, Col } from 'antd'
import Header from '../Header'
import './index.less'

class App extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    return <div>
      <Row>
        <Col span={24}>
          <Header currentRoute={this.props} />
        </Col>
      </Row>
      <div className="ant-layout-wrapper">
        <div className="ant-layout-container">
          <Row
            type="flex"
            justify="space-around"
            align="middle"
            gutter={20}
          >
            {this.props.children}
          </Row>
        </div>
      </div>
    </div>
  }

}

export default App
