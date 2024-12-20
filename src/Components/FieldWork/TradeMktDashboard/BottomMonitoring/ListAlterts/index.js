import { Collapsible, CollapsibleItem, Modal } from 'react-materialize';
import React, { Component } from 'react';
import Skeleton from 'react-loading-skeleton';
import { Button, Icon } from 'react-materialize';
import api from '../../../../../services/api';
import { getFromStorage } from '../../../../../services/auth';
import {
  Container,
  ContentBodyModal,
  ContentBody,
  Content,
  ContentDescription,
  ButtonSeen,
  HeaderAlerts,
} from './styled';
import PanelMonitoringContext from '../../../../../providers/monitoringPanel';
import MapWrapped from './Map';

export default class ListAlerts extends Component {
  static contextType = PanelMonitoringContext;
  state = {
    alerts: [],
    alertsModal: [],
    loading: false,
    openModal: false,
    isMobile: false,
  };

  async componentDidMount() {
    await this.carregarVariaveisEstado();
  }
  carregarVariaveisEstado = async () => {
    const sessao = getFromStorage();
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
      isMobile: window.innerWidth > 450,
    });
  };

  componentDidUpdate(prevProps) {
    if (prevProps.forceLoading !== this.props.forceLoading) {
      this.setState({
        loading: this.props.forceLoading,
      });
    }
  }

  handleStatusAlert = async (alert, impede) => {
    try {
      const { empresaAtiva, usuarioAtivo } = this.state;
      let { alerts } = this.props;

      if (impede === 2) {
        alerts.forEach(async (element) => {
          if (element.impede === 0) {
            let item = {};
            item.galId = element.gaaId;
            item.liberado = true;
            item.lido = true;
            const res = await api.put(`v1/tradedashboard/alerts/${empresaAtiva}/${usuarioAtivo}`, item);

            if (res.data.sucess) {
              let pos = alerts.findIndex((alert) => alert.gaaId === item.galId);
              alerts[pos].status = 1;
              alerts[pos].impede = 0;
              this.setState({
                alerts,
              });
            }
          }
        });
      } else {
        const update = {
          galId: alert.gaaId,
          liberado: impede === -1 ? false : true,
          lido: true,
        };
        const res = await api.put(`v1/tradedashboard/alerts/${empresaAtiva}/${usuarioAtivo}`, update);

        if (res.data.sucess) {
          let pos = alerts.findIndex((element) => element.gaaId === alert.gaaId);
          alerts[pos].status = 1;
          alerts[pos].impede = impede === 1 ? 2 : impede === 0 ? 0 : -1;
          this.setState({
            alerts,
          });
        }
      }
    } catch (error) {}
  };

  render() {
    const { loading, openModal, isMobile } = this.state;
    const { alerts } = this.props;
    const { setForceLoading } = this.context;

    return (
      <Container>
        {loading ? (
          <div className="skeletonLoading">
            <Skeleton height={60} />
            <Skeleton height={40} />
            <Skeleton height={40} />
            <Skeleton height={40} />
            <Skeleton height={40} />
          </div>
        ) : (
          <>
            <HeaderAlerts>
              <div className="titleList">
                <Icon>info</Icon>
                <h5>
                  {alerts.filter((item) => item.status !== 1).length > 1
                    ? `${alerts.filter((item) => item.status !== 1).length} Alertas`
                    : `${alerts.filter((item) => item.status !== 1).length} Alerta`}
                </h5>
              </div>
              {alerts.filter((item) => item.status !== 2).length > 0 && (
                <ButtonSeen color="#00c853" hover="#00bd4f" onClick={() => this.handleStatusAlert(alert, 2)}>
                  <Icon tiny>done_all</Icon>
                  Marcar todos como visto
                </ButtonSeen>
              )}
            </HeaderAlerts>

            <ContentBodyModal>
              {alerts.length > 0 &&
                alerts.map((alert) => (
                  <ContentBody key={alert.gaaId}>
                    <div className="alerts">
                      <Icon>info</Icon>
                      <span>{alert.descricao}</span>
                    </div>
                    {alert.status === 0 ? (
                      alert.impede && alert.impede === 1 ? (
                        <ButtonSeen
                          color="#4298e8"
                          hover="#338fe6"
                          onClick={() => {
                            this.setState({ openModal: true });
                            setForceLoading(true);
                          }}
                        >
                          <Icon tiny>open_in_new</Icon>
                          Analisar
                        </ButtonSeen>
                      ) : (
                        <ButtonSeen color="#4298e8" hover="#338fe6" onClick={() => this.handleStatusAlert(alert, 0)}>
                          <Icon tiny>done</Icon>
                          Visto
                        </ButtonSeen>
                      )
                    ) : alert.impede === 2 ? (
                      <ButtonSeen color="#00c853" hover="#00bd4f">
                        <Icon tiny>done</Icon>
                        Liberado
                      </ButtonSeen>
                    ) : alert.impede === -1 ? (
                      <ButtonSeen color="#d50000" hover="#c70000">
                        <Icon tiny>close</Icon>
                        Não liberado
                      </ButtonSeen>
                    ) : (
                      alert.status === 1 && (
                        <ButtonSeen color="#00c853" hover="#00bd4f">
                          <Icon tiny>done</Icon>
                          Visto
                        </ButtonSeen>
                      )
                    )}
                  </ContentBody>
                ))}
            </ContentBodyModal>
          </>
        )}
        <Modal
          className="modal-list-users"
          actions={[
            <Button
              modal="close"
              node="button"
              href="#modal1"
              waves="green"
              className="saib-button is-primary"
              onClick={() => {
                this.setState({
                  openModal: false,
                });
                setForceLoading(false);
              }}
            >
              Fechar
            </Button>,
          ]}
          bottomSheet={false}
          fixedFooter={false}
          header="Liberar ação"
          id="modal1"
          open={openModal}
          options={{
            dismissible: true,
            endingTop: '10%',
            inDuration: 250,
            onCloseEnd: () => {
              this.setState({
                openModal: false,
              });
              setForceLoading(false);
            },
            onCloseStart: null,
            onOpenEnd: null,
            onOpenStart: null,
            opacity: 0.5,
            outDuration: 250,
            preventScrolling: true,
            startingTop: '4%',
          }}
          root={document.body}
        >
          <ContentBodyModal>
            {alerts.length > 0 &&
              alerts.map(
                (alert) =>
                  alert.impede !== 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                      <ContentBody full key={alert.gaaId}>
                        <Content>
                          <ContentDescription>
                            <Icon>info</Icon>
                            <span>{alert.descricao}</span>
                          </ContentDescription>
                          <div className="observation">{isMobile && <span>{alert.observation.split('[')[0]}</span>}</div>
                        </Content>

                        {alert.impede && alert.impede === 1 ? (
                          <div className="alerts">
                            <ButtonSeen
                              color="#00c853"
                              hover="#00bd4f"
                              onClick={() => this.handleStatusAlert(alert, 1)}
                            >
                              <Icon tiny>lock_open</Icon>
                              Liberar
                            </ButtonSeen>
                            <ButtonSeen
                              color="#d50000"
                              hover="#c70000"
                              onClick={() => this.handleStatusAlert(alert, -1)}
                            >
                              <Icon tiny>lock</Icon>
                              Não liberar
                            </ButtonSeen>
                          </div>
                        ) : alert.impede === 2 ? (
                          <ButtonSeen color="#00c853" hover="#00bd4f">
                            <Icon tiny>done</Icon>
                            Liberado
                          </ButtonSeen>
                        ) : (
                          <ButtonSeen color="#d50000" hover="#c70000">
                            <Icon tiny>close</Icon>
                            Não liberado
                          </ButtonSeen>
                        )}
                      </ContentBody>
                      <Collapsible accordion>
                        <CollapsibleItem
                          expanded={false}
                          header="Posição cliente x vendedor"
                          icon={<Icon>map</Icon>}
                          node="div"
                        >
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: isMobile ? 'row' : 'column',
                              width: '100%',
                              alignItems: 'center',
                              justifyContent: 'space-around',
                              textAlign: 'center',
                              fontWeight: 'bold',
                              paddingBottom: '6px',
                            }}
                          >
                            <div
                              style={{
                                width: isMobile ? '45%' : '100%',
                                marginBottom: isMobile ? '0px' : '24px',
                                borderRadius: '4px',
                                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)',
                                padding: '6px',
                              }}
                            >
                              <p style={{ marginBottom: '14px' }}>POSIÇÃO CLIENTE</p>
                              <MapWrapped
                                googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=AIzaSyBdN4niRiYdhPBIxEny9lGB-OpBJ0NPpnY`}
                                wayPoints={[
                                  {
                                    lat: parseFloat(alert.observation.split('[')[1].split('|')[0].split(':')[0]),
                                    lng: parseFloat(alert.observation.split('[')[1].split('|')[0].split(':')[1]),
                                  },
                                ]}
                                loadingElement={<div style={{ height: `100%` }} />}
                                containerElement={<div style={{ height: `350px` }} />}
                                mapElement={<div style={{ height: `100%` }} />}
                              />
                            </div>
                            <div
                              style={{
                                width: isMobile ? '45%' : '100%',
                                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)',
                                padding: '6px',
                              }}
                            >
                              <p style={{ marginBottom: '14px' }}>POSIÇÃO VENDEDOR</p>
                              <MapWrapped
                                googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=AIzaSyBdN4niRiYdhPBIxEny9lGB-OpBJ0NPpnY`}
                                wayPoints={[
                                  {
                                    lat: parseFloat(alert.observation.split('[')[1].split('|')[1].split(':')[0]),
                                    lng: parseFloat(
                                      alert.observation.split('[')[1].split('|')[1].split(':')[1].split(']')[0]
                                    ),
                                  },
                                ]}
                                loadingElement={<div style={{ height: `100%` }} />}
                                containerElement={<div style={{ height: `350px` }} />}
                                mapElement={<div style={{ height: `100%` }} />}
                              />
                            </div>
                          </div>
                        </CollapsibleItem>
                      </Collapsible>
                    </div>
                  )
              )}
          </ContentBodyModal>
        </Modal>
      </Container>
    );
  }
}
