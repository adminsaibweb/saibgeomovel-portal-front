import React, { Component } from 'react';
import { withGoogleMap, withScriptjs, GoogleMap, Marker, InfoWindow, Polyline } from 'react-google-maps';
// import * as parkData from '../data/skateboard-parks.json';
import mapStyles from './mapStyles';
import { capitalize, formatDateTimeToBrUtc, haveData } from '../../../../../services/funcoes';
import { withRouter } from 'react-router-dom';

class Map extends Component {
  state = {
    selectedPoint: null,
  };
  componentDidMount = () => {
    let wayPoints = this.props.wayPoints;
    //console.log('wayPoints', wayPoints);
    // let wayPoints = parkData.default;

    const google = window.google;
    // const directionsService = new google.maps.DirectionsService();
    let center = this.props.center;
    let containerElement = this.props.containerElement;
    let defaultZoom = this.props.defaultZoom;
    let googleMapURL = this.props.googleMapURL;
    let loadingElement = this.props.loadingElement;
    let mapElement = this.props.mapElement;

    let origin = {};
    origin.lat = wayPoints.ORIGEM.LATITUDE;
    origin.lng = wayPoints.ORIGEM.LONGITUDE;
    let destination = {};
    destination.lat = wayPoints.DESTINO.LATITUDE;
    destination.lng = wayPoints.DESTINO.LONGITUDE;

    let localWayPoints = [];
    let localInfoData = [];
    let polilynes = [];
    let markers = [];

    for (const point of wayPoints.PING) {
      let polilyne = {};
      polilyne = {
        lat: point.CLI_LATITUDE !== undefined ? point.CLI_LATITUDE : point.LATITUDE,
        lng: point.CLI_LONGITUDE !== undefined ? point.CLI_LONGITUDE : point.LONGITUDE,
        data: point,
      };
      if (markers.length === 0) {
        markers.push(polilyne);
      }
      if (!point.CHECKIN) {
        polilynes.push(polilyne);
        let wayPoint = {};
        wayPoint.location = new google.maps.LatLng(point.LATITUDE, point.LONGITUDE);
        localWayPoints.push(wayPoint);
      } else {
        let item = {};
        item = {
          lat: point.CLI_LATITUDE,
          lng: point.CLI_LONGITUDE,
          data: point,
        };
        markers.push(item);
        if (point.ATENDIDO) {
          polilynes.push(polilyne);
        }
      }
    }

    //console.log('markers', markers);
    //console.log('polilynes', polilynes);

    this.setState({
      markers,
      center,
      containerElement,
      mapElement,
      loadingElement,
      googleMapURL,
      defaultZoom,
      localInfoData,
      polilynes,
    });
  };

  handleSelectPoint = (point) => {
    //console.log('point', point);
    this.setState({ selectedPoint: point });
  };

  render() {
    const { selectedPoint, polilynes, markers } = this.state;
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
                  onClick={() => {
                    this.handleSelectPoint(item.data);
                  }}
                  icon={{
                    url: `/img/${
                      item.data === undefined || item.data.IMG === undefined
                        ? `ping_${i > 50 ? '0' : String(i)}.svg`
                        : item.data.IMG
                    }`,
                    scaledSize: new window.google.maps.Size(30, 30),
                    origin: new window.google.maps.Point(0, 0),
                    anchor: new window.google.maps.Point(15, 15),
                  }}
                />
              </>
            ))}
            {polilynes.map((item, i) => (
              <>
                <Marker
                  key={item.lat}
                  position={{
                    lat: item.lat,
                    lng: item.lng,
                  }}
                  onClick={() => {
                    this.handleSelectPoint(item.data);
                  }}
                  icon={{
                    url: `/img/${
                      item.data === undefined || item.data.IMG === undefined
                        ? `ping_${i > 50 ? '0' : String(i)}.svg`
                        : item.data.IMG
                    }`,
                    scaledSize: new window.google.maps.Size(30, 30),
                    origin: new window.google.maps.Point(0, 0),
                    anchor: new window.google.maps.Point(15, 15),
                  }}
                />
              </>
            ))}
            <Polyline
              path={polilynes}
              strokeColor="#FF0000"
              suppressMarkers={false}
              strokeOpacity={0.8}
              strokeWeight={6}
            />

            {selectedPoint && (
              <InfoWindow
                onCloseClick={() => {
                  this.handleSelectPoint(null);
                }}
                position={{
                  lat: selectedPoint.CLI_LATITUDE === undefined ? selectedPoint.LATITUDE : selectedPoint.CLI_LATITUDE,
                  lng:
                    selectedPoint.CLI_LONGITUDE === undefined ? selectedPoint.LONGITUDE : selectedPoint.CLI_LONGITUDE,
                }}
              >
                {selectedPoint.CLI_NOME_FANTASIA !== undefined ? (
                  <>
                    <div style={{ maxWidth: '320px' }}>
                      <h6>
                        {capitalize(selectedPoint.CLI_NOME_FANTASIA, true)}(
                        <small>{capitalize(selectedPoint.CLI_RAZAO_SOCIAL, true)}</small>)
                      </h6>
                      <p>
                        <strong>Seq.Padrão:</strong> {selectedPoint.SEQ_PADRAO}
                        {selectedPoint.ATENDIDO && (
                          <>
                            {' '}
                            <strong>Seq.Atendimento:</strong> {selectedPoint.SEQ_ATD}
                          </>
                        )}
                        <br />
                        {selectedPoint.ATENDIDO && (
                          <>
                            <strong>Data/hora:</strong> {formatDateTimeToBrUtc(selectedPoint.DATAHORA)} <br />
                          </>
                        )}
                        <strong>Endereço:</strong>
                        {capitalize(selectedPoint.ENDERECO, true)}
                      </p>
                      {selectedPoint.ATENDIDO && (
                        <p>
                          <strong>Distância Checkin:</strong> {selectedPoint.DISTANCIA_CHECKIN} km
                        </p>
                      )}
                      {haveData(selectedPoint.MOTIVO_NAO_ATD) && (
                        <p>
                          <strong>Motivo não atendimento:</strong> {selectedPoint.MOTIVO_NAO_ATD}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ maxWidth: '320px' }}>
                      <h6>
                        <strong>Data/hora</strong>: {formatDateTimeToBrUtc(selectedPoint.DATAHORA)}
                      </h6>
                    </div>
                  </>
                )}
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
