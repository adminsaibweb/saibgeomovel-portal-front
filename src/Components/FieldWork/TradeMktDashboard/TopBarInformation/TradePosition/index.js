import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import api from '../../../../../services/api';
import Header from '../../../../System/Header';
import { Icon } from 'react-materialize';
import { Container, MapContainer } from './styled';
import DirectTituloJanela from '../../../../Globals/DirectTituloJanela';
import { formatDateTimeToBr, alerta } from '../../../../../services/funcoes';
import MapWrapped from './MapWrapped';
import PanelMonitoringContext from '../../../../../providers/monitoringPanel';
// import MapWrapped from './MapWrapped';

class TradePosition extends Component {
  static contextType = PanelMonitoringContext;
  state = {
    latitude: undefined,
    longitude: undefined,
    wayPoints: undefined,
  };

  componentDidMount = async () => {
    await this.loadGpsAllLocation();
    TradePosition.contextType = PanelMonitoringContext;
    if (this.props.location.state !== undefined && this.props.location.state[1] !== undefined) {
      let { lineClicked } = this.props.location.state[1];
      this.setState({ lineClicked }, () => this.setLineClicked());
    }
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

  loadGpsAllLocation = async () => {
    try {
      const { usuarioAtivo, empresaAtiva } = this.props.history.location;
      const dataToSend = {
        data: formatDateTimeToBr(new Date(), 'DD/MM/YYYY'),
      };
      const res = await api.post(
        `/v1/gps/todos/${empresaAtiva}/${usuarioAtivo}`,
        dataToSend
      );

      const { sucess, data } = res.data;
      //console.log(data);
      //console.log(data.USUARIO);
      if (sucess) {
        this.setState({ wayPoints: data.USUARIO });
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
    const { wayPoints } = this.state;
    const { forceBack } = this.props;
    const { isMobile } = this.context;

    return (
      <>
        {wayPoints !== undefined && (
          <>
            <Header />
            <Container isMobile={isMobile}>
              <DirectTituloJanela
                classNameTitulo="professionalScheduleTitle"
                style={{ paddingLeft: '64px' }}
                stateUrl={'/tradeMktDashboard'}
                forceBack={forceBack}
                urlVoltar={undefined}
                titulo={
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <Icon>map</Icon>Posição pesquisadores
                  </span>
                }
              />
              <MapContainer>
                <MapWrapped
                  {...this.props}
                  googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=AIzaSyBdN4niRiYdhPBIxEny9lGB-OpBJ0NPpnY`}
                  loadingElement={<div style={{ height: `100%` }} />}
                  containerElement={<div style={{ height: `100%` }} />}
                  mapElement={<div style={{ height: `100%` }} />}
                  wayPoints={wayPoints}
                />
              </MapContainer>
            </Container>
          </>
        )}
      </>
    );
  }
}

export default withRouter(TradePosition);
