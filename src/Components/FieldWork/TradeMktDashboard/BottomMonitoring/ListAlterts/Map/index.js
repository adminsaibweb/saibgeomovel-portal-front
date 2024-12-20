import React, { Component } from 'react';
import { withGoogleMap, withScriptjs, GoogleMap, Marker} from 'react-google-maps';
// import * as parkData from '../data/skateboard-parks.json';
import mapStyles from './mapStyles';
import { withRouter } from 'react-router-dom';

class Map extends Component {
  state = {
    selectedPoint: null,
  };
  componentDidMount = () => {
    let wayPoints = this.props.wayPoints;
    this.setState({
      markers: wayPoints,
    });
  };

  render() {
    const { markers } = this.state;
    return (
      <>
        {markers !== undefined && markers[0] !== undefined && (
          <GoogleMap
            defaultZoom={15}
            defaultCenter={{ lat: markers[0].lat, lng: markers[0].lng }}
            defaultOptions={{ styles: mapStyles }}
          >
            {markers.map((item, i) => (
              <>
                <Marker
                  key={item.lat}
                  position={{
                    lat: item.lat,
                    lng: item.lng,
                  }}
                />
              </>
            ))}
          </GoogleMap>
        )}
      </>
    );
  }
}

const MapWrapped = withScriptjs(withGoogleMap(Map));

export default withRouter(MapWrapped);