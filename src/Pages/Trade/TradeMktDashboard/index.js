import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Header from '../../../Components/System/Header';
import UsersUnGroupedIndicators from './UsersUnGroupedIndicators';
// import UsersGroupedIndicators from './UsersGroupedIndicators';

class TradeMktDashboard extends Component {
  render() {
    return (
      <>
        <Header />
        <UsersUnGroupedIndicators />
        {/* <UsersGroupedIndicators /> */}
      </>
    );
  }
}

export default withRouter(TradeMktDashboard);
