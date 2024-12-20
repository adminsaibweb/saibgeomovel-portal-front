import React, { Component } from 'react';
import { withGoogleMap, withScriptjs, GoogleMap, Marker, InfoWindow } from 'react-google-maps';
import mapStyles from './mapStyles';
import { capitalize, alerta } from '../../../../../../services/funcoes';
import { withRouter } from 'react-router-dom';
// import { capitalize } from '../../../../../services/funcoes';

class Map extends Component {
  state = {
    selectedPoint: null,
  };

  componentDidMount = async () => {
    //console.log(this.props);
    let wayPoints = this.props.wayPoints;
    //console.log('wayPoints', wayPoints);

    let center = this.props.center;
    let containerElement = this.props.containerElement;
    let defaultZoom = this.props.defaultZoom;
    let googleMapURL = this.props.googleMapURL;
    let loadingElement = this.props.loadingElement;
    let mapElement = this.props.mapElement;

    let localInfoData = [];

    for (const point of wayPoints) {
      let item = {};
      item.center = {
        lat: point.LATITUDE,
        lng: point.LONGITUDE,
      };
      item.data = point;
      localInfoData.push(item);
    }
    if (localInfoData.length === 0) {
      alerta('Informações sobre pesquisadores não disponível.', 1);
      this.props.history.goBack();
      return;
    }

    //console.log('localInfoData', localInfoData);
    this.setState({ center, containerElement, mapElement, loadingElement, googleMapURL, defaultZoom, localInfoData });
  };

  handleSelectPoint = (point) => {
    //console.log('point', point);
    this.setState({ selectedPoint: point });
  };

  render() {
    const { selectedPoint, localInfoData } = this.state;
    return (
      <>
        {localInfoData !== undefined && (
          <GoogleMap
            defaultZoom={15}
            defaultCenter={{ lat: localInfoData[0].center.lat, lng: localInfoData[0].center.lng }}
            defaultOptions={{ styles: mapStyles }}
          >
            {localInfoData.map((item) => (
              <>
                <Marker
                  key={item.center.lat}
                  position={{
                    lat: item.center.lat,
                    lng: item.center.lng,
                  }}
                  onClick={() => {
                    this.handleSelectPoint(item.data);
                  }}
                  icon={{
                    url: item.data.USR_CARGO === 'Promotor' ? `/img/promotor.svg` : `/img/supervisor.svg`,
                    scaledSize: new window.google.maps.Size(30, 30),
                    origin: new window.google.maps.Point(0, 0),
                    anchor: new window.google.maps.Point(15, 15),
                  }}
                />
              </>
            ))}
            {selectedPoint && (
              <InfoWindow
                onCloseClick={() => {
                  this.handleSelectPoint(null);
                }}
                position={{
                  lat: selectedPoint.LATITUDE,
                  lng: selectedPoint.LONGITUDE,
                }}
              >
                <div style={{ maxWidth: '320px' }}>
                  <h6>
                    {capitalize(selectedPoint.USR_NOME, true)}(
                    <small>{capitalize(selectedPoint.USR_CARGO, true)}</small>)
                  </h6>
                  <p>{capitalize(selectedPoint.HORA, true)}</p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        )}
      </>
    );
  }
}

const MapWrapped = withScriptjs(withGoogleMap(Map));

export default withRouter(MapWrapped);
