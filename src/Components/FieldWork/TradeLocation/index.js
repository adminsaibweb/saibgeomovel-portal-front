import React, { Component } from 'react';
import { geolocated } from 'react-geolocated';
class TradeLocation extends Component {
  state = {
    lastUpdate: -1,
  };
  componentDidMount = () => {};

  componentDidUpdate = () => {
    let { lastUpdate } = this.state;
    if (
      this.props.lastUpdate !== lastUpdate &&
      this.props.onUpdateCoord !== undefined &&
      this.props.coords != null
    ) {
      this.setState({ lastUpdate: this.props.lastUpdate });
      this.onUpdateCoord();
    }
  };

  onUpdateCoord = () => {
    this.props.onUpdateCoord(
      this.props.isGeolocationAvailable,
      this.props.isGeolocationEnabled,
      this.props.coords
    );
  };

  render() {
    return <div></div>;
  }
}

export default geolocated({
  positionOptions: {
    enableHighAccuracy: true,
  },
  userDecisionTimeout: 5000,
})(TradeLocation);
