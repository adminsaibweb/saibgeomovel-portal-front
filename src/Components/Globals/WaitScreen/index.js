import React, { Component } from 'react';
import { JanelaWaitScreen } from './styles';
import './forced.css';
import {Preloader } from 'react-materialize';
export default class WaitScreen extends Component {
  state = { loading: false, percent: undefined, message: undefined };
  componentDidUpdate = () => {
    let { message, loading, percent } = this.state;
    if (
      loading !== this.props.loading ||
      percent !== this.props.percent ||
      message !== this.props.message
    ) {
      this.setState({
        loading: this.props.loading,
        percent: this.props.percent,
        message: this.props.message,
      });
    }
  };
  render() {
    const { loading, percent, message } = this.state;
    return (
      <JanelaWaitScreen loading={String(loading)} className="loading">
        <div
          className="loadingInnerDiv"
          loading={String(loading)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 'auto',
            marginBottom: 'auto',
            zIndex: "999"
          }}
        >
          {/* <Row>
            <Col s={4}> */}
          <Preloader active color="blue" size="big" />
          {/* </Col>
          </Row> */}
          <h5
            style={{
              position: 'relative',
              top:
                percent !== undefined && percent > 0 && percent <= 99
                  ? '-62px'
                  : 'unset',
            }}
          >
            {percent !== undefined && percent > 0 && percent <= 99
              ? `${percent}%`
              : `Aguarde...`}
          </h5>
          <div
            style={{
              paddingLeft: '50px',
              paddingRight: '50px',
              width: '100%',
              display:
                percent !== undefined && percent > 0 && percent <= 99
                  ? 'block'
                  : 'none',
            }}
          >
            {/* <ProgressBar progress={percent} /> */}
            {message !== undefined && <h5>{message}</h5>}
          </div>
        </div>
        {/* <Loader loading={String(this.props.loading)} className="loadingSpiner"/> */}
      </JanelaWaitScreen>
    );
  }
}
