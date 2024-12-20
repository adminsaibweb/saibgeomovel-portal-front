import React, { Component } from 'react';
import Header from '../../../../Components/System/Header';
import { withRouter } from 'react-router-dom';
import { getFromStorage } from '../../../../services/auth';
import './forced.css';

import { alerta } from '../../../../services/funcoes';
import { Collapsible, CollapsibleItem, Icon } from 'react-materialize';
import api from '../../../../services/api';
import { Container, Linha, DivDetalhe } from './styled';
import Skeleton from 'react-loading-skeleton';
import DirectTituloJanela from '../../../../Components/Globals/DirectTituloJanela';
import PhotosList from '../../../../Components/FieldWork/TradeMktDashboard/BottomMonitoring/PhotosList';
import PanelMonitoringContext from '../../../../providers/monitoringPanel';

class SchedulePhotos extends Component {
  state = {
    nameClient: '',
    gatId: undefined,
    loading: false,
    clientsData: [],
  };

  componentDidMount = async () => {
    SchedulePhotos.contextType = PanelMonitoringContext;

    let { item } = this.state;

    let gatId = this.props.location.state[0].GAT_ID;
    let gaaId = this.props.location.state[0].GAA_ID;
    const { statePrevius, urlPrevius, lineClicked } = this.props.location.state[1];
    //console.log('componentDidMount -> lineClicked', lineClicked);
    let forceBack = this.props.history.location.forceBack;
    item = this.props.location.state;
    // item.GAA_ID = gaaId;
    await this.carregarVariaveisEstado();

    this.setState({ item, loading: true, gaaId, gatId, forceBack, urlPrevius, statePrevius, lineClicked }, () => {
      this.handlePhotosSchedules();
      this.setLineClicked();
    });
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

  handlePhotosSchedules = async () => {
    this.setState({
      // loading: true,
    });
    try {
      const { empresaAtiva, usuarioAtivo, gatId, gaaId } = this.state;
      const url = '/v1/tradedashboard/photolist/' + empresaAtiva + '/' + usuarioAtivo;
      let data = { gatId, gaaId };
      const retorno = await api.post(url, data);
      if (!retorno) {
        return [];
      } else {
        if (retorno.data && retorno.data.sucess) {
          let photosList = retorno.data.data;

          const idClients = photosList.map((photoItem) => photoItem.CLI_CODIGO);

          const newIdClients = [...new Set(idClients)]; //removerndo id de clientes duplicados

          let clientsData = [];
          newIdClients.forEach((id) => {
            clientsData.push({
              id,
              name: photosList.find((photoItem) => photoItem.CLI_CODIGO === id).CLI_NOME_FANTASIA,
              images: photosList.filter((photoItem) => photoItem.CLI_CODIGO === id),
            });
          });

          this.setState({
            clientsData,
          });
        } else {
          return [];
        }
      }
    } catch (err) {
      alerta(`Erro ao carregar fotos => ` + err);
    } finally {
      setTimeout(() => {
        this.setState({ loading: false });
      }, 600);
    }
  };

  carregarVariaveisEstado = async () => {
    const sessao = getFromStorage();
    // //console.log(sessao);
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
    });
  };

  render() {
    const { clientsData, loading, forceBack } = this.state;
    return (
      <>
        <Header />

        <Container className="professionalScheduleContainer">
          <DirectTituloJanela
            classNameTitulo="professionalScheduleTitle"
            style={{ paddingLeft: '64px' }}
            // urlVoltar={this.props.history.location.urlPrevius}
            state={this.state.statePrevius ? this.state.statePrevius : this.props.location.statePrevius}
            stateUrl={this.state.urlPrevius ? this.state.urlPrevius : this.props.location.urlPrevius}
            forceBack={forceBack}
            titulo={
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <Icon>calendar_today</Icon>Fotos
              </span>
            }
          />
          <>
            {loading ? (
              <Linha>
                <DivDetalhe
                  style={{
                    padding: '5px',
                    borderRadius: '10px',
                    width: '100%',
                    margin: '2px',
                  }}
                >
                  <Skeleton height={50} />
                  <Skeleton height={50} />
                  <Skeleton height={50} />
                </DivDetalhe>
              </Linha>
            ) : (
              <Linha>
                {clientsData.map((client, i) => (
                  <Collapsible
                    key={i}
                    accordion
                    style={{
                      width: '100%',
                      borderStyle: 'none',
                      boxShadow: 'none',
                    }}
                  >
                    <CollapsibleItem
                      expanded={false}
                      header={client.name}
                      icon={
                        <>
                          <Icon className="plus1">expand_more</Icon>

                          <Icon className="minus1">navigate_next</Icon>
                        </>
                      }
                      node="div"
                    >
                      <PhotosList withNavigation forceLoading={false} photosList={client.images} />
                    </CollapsibleItem>
                  </Collapsible>
                ))}
              </Linha>
            )}
          </>
        </Container>
      </>
    );
  }
}

export default withRouter(SchedulePhotos);
