import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Header from '../../../System/Header';
import { Icon } from 'react-materialize';
import { Container, MapContainer } from './styled';
import DirectTituloJanela from '../../../Globals/DirectTituloJanela';
import { formatDateTimeToBr, alerta } from '../../../../services/funcoes';
import api from '../../../../services/api';
import { getFromStorage } from '../../../../services/auth';
import MapWrapped from './MapWrapped';
import PanelMonitoringContext from '../../../../providers/monitoringPanel';
import './forced.css';

class TradeRoute extends Component {
  state = {
    latitude: undefined,
    longitude: undefined,
    wayPoints: undefined,
  };

  componentDidMount = async () => {
    TradeRoute.contextType = PanelMonitoringContext;
    let { lineClicked } = this.props.location.state[1];
    this.setState({ lineClicked }, () => this.setLineClicked());

    await this.getActualPosition();

    let userRoute = this.props.location.userId;
    let gaaId = this.props.location.gaaId;
    let data = formatDateTimeToBr(this.props.location.data, 'DD/MM/YYYY');

    await this.carregarVariaveisEstado();
    await this.loadGpsLocation(userRoute, data, gaaId);
  };

  setLineClicked = async () => {
    const { setStatePanelMonitoring, statePanelMonitoring } = this.context;
    let { lineClicked } = this.state;
    await setStatePanelMonitoring({
      ...statePanelMonitoring,
      filtering: false,
      lineClicked: lineClicked,
    });
  };

  getActualPosition = async () => {
    let { lastUpdate } = this.state;
    this.setState({ lastUpdate: lastUpdate + 1 });
  };

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
      empresaCnpj: sessao.empresaCnpj,
    });
  };

  loadGpsLocation = async (userRoute, dataGps, gaaId) => {
    try {
      const dataToSend = {
        data: dataGps,
        usuarioAgenda: userRoute,
        gaaId,
      };
      const res = await api.post(`/v1/gps/list/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`, dataToSend);

      const { sucess, data } = res.data;
      //console.log(data);
      if (sucess) {
        let latitude = data.ORIGEM.LATITUDE;
        let longitude = data.ORIGEM.LONGITUDE;
        // //console.log('WAIPOINTS ===> ', data);
        this.setState({ wayPoints: data, latitude, longitude });
        return data.length > 0 ? true : false;
      } else {
        alerta('Erro ao carregar as posições do pesquisador.');
        this.props.history.push('/tradeMktDashboard');
        return false;
      }
    } catch (error) {
      this.props.history.push('/tradeMktDashboard');
      alerta('Erro ao carregar as posições do pesquisador.');
      return false;
    }
  };

  render() {
    const { latitude, wayPoints } = this.state;
    const { forceBack } = this.props;

    return (
      <>
        {wayPoints !== undefined && latitude !== undefined && (
          <>
            <Header />
            <Container>
              {/* <DirectTituloJanela
                urlVoltar={'/tradeMktDashboard'}
                titulo={
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <Icon>schedule</Icon>Agendas
                  </span>
                }
              /> */}

              <DirectTituloJanela
                classNameTitulo="professionalScheduleTitle"
                style={{ paddingLeft: '64px' }}
                stateUrl={'/tradeMktDashboard'}
                forceBack={forceBack}
                urlVoltar={undefined}
                titulo={
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <Icon>map</Icon>Mapa
                  </span>
                }
              />
              <MapContainer>
                <MapWrapped
                  googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=AIzaSyBdN4niRiYdhPBIxEny9lGB-OpBJ0NPpnY`}
                  loadingElement={<div style={{ height: `100%` }} />}
                  containerElement={<div style={{ height: `100%` }} />}
                  mapElement={<div style={{ height: `100%` }} />}
                  wayPoints={wayPoints}
                />
              </MapContainer>
              {/* <div style={{ width: "100vw", height: "100vh" }}> */}
              {/* </div> */}
            </Container>
          </>
        )}
      </>
    );
  }
}

export default withRouter(TradeRoute);
