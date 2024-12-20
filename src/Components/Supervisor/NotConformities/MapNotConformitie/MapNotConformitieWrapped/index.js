import React, { Component } from 'react';
import { withGoogleMap, withScriptjs, GoogleMap, Marker, InfoWindow } from 'react-google-maps';
import mapStyles from './mapStyles';
import { withRouter } from 'react-router-dom';

class MapNotConformitieWrapped_ extends Component {
  state = {
    selectedPoint: null,
  };

  componentDidMount = () => {
    let wayPoints = this.props.wayPoints;
    let data = this.props.data;
    // console.log(data);
    // console.log(wayPoints);
    this.setState({
      markers: wayPoints,
      data,
    });
  };

  handleSelectPoint = (point, atual) => {
    //console.log('point', point);
    if (point != null) {
      point.atual = atual;
    }
    this.setState({ selectedPoint: point });
  };

  render() {
    const { data, markers, selectedPoint } = this.state;
    return (
      <>
        {markers !== undefined && markers[0] !== undefined && (
          <GoogleMap
            defaultZoom={13}
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
                  onClick={() => {
                    this.handleSelectPoint(data, i);
                  }}
                  icon={{
                    url: `/img/${i === 1 ? `customer-atendido.svg` : `customer-justificado.svg`}`,
                    scaledSize: new window.google.maps.Size(30, 30),
                    origin: new window.google.maps.Point(0, 0),
                    anchor: new window.google.maps.Point(15, 15),
                  }}
                />
              </>
            ))}
            {selectedPoint && (
              <>
                <InfoWindow
                  onCloseClick={() => {
                    this.handleSelectPoint(null, null);
                  }}
                  position={{
                    lat: markers[selectedPoint.atual].lat,
                    lng: markers[selectedPoint.atual].lng,
                  }}
                >
                  <>
                    <div style={{ maxWidth: '320px' }}>
                      <h6 style={{fontWeight: '900'}}>
                       <u>{selectedPoint.atual === 0 ? `Último endereço de atendimento.` : `Novo endereço de atendmento.`}</u>
                      </h6>
                    </div>
                  </>
                </InfoWindow>
              </>
            )}
          </GoogleMap>
        )}
      </>
    );
  }
}

const MapNotConformitieWrapped = withScriptjs(withGoogleMap(MapNotConformitieWrapped_));

export default withRouter(MapNotConformitieWrapped);
