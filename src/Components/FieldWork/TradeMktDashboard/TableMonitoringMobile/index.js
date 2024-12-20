import React, { Component } from 'react';
import Skeleton from 'react-loading-skeleton';
import { Button, Collapsible, CollapsibleItem, Icon, Modal } from 'react-materialize';
import { getFromStorage } from '../../../../services/auth';
import { alerta, dateFormat, parseDate } from '../../../../services/funcoes';
import {
  Container,
  DivDetalhe,
  ContentData,
  ContentBodyCollapsible,
  ContentHeader,
  PTitle,
  ContentItemsBody,
  PDescriptionItem,
} from './styled';
import PanelMonitoringContext from '../../../../providers/monitoringPanel';
import './forced.css';
import ItemDataTable from './ItemDataTable';
import api from '../../../../services/api';
import { getLocalObject, setLocalObject } from '../../../../services/databaseLocal';

export default class TableMonitoringMobile extends Component {
  state = {
    loading: false,
    today: dateFormat(new Date(), 'DD/MM/yyyy'),
    clicked: true,
    schedulesData: [],
    lineClicked: -1,
    activeFilterBox: false,
    textFilterBox: '',
    itemsClicked: [-1],
    isOpenConfirmModal: false,
    selectedId: 0,
  };

  async componentDidMount() {
    this.mounted = true;
    this.setState({
      loading: true,
    });
    await this.carregarVariaveisEstado();
    TableMonitoringMobile.contextType = PanelMonitoringContext;
    await this.updateData();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data) {
      await this.updateData();
    }
    // let {lineClicked, clicked} = this.state;
    // if (this.props.lineClicked !== undefined && this.props.lineClicked !== lineClicked){
    //   // this.props.lineClicked = lineClicked;
    //   // lineClicked = this.props.lineClicked;
    //   clicked = true;
    //   this.setState({lineClicked, clicked})

    // }
    if (prevProps.forceLoading !== this.props.forceLoading) {
      if (this.mounted) {
        this.setState(
          {
            loading: this.props.forceLoading,
          },
          async () => {
            !this.props.forceLoading && (await this.updateData());
          }
        );
      }
    }
  }

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();

    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
      empresaCnpj: sessao.empresaCnpj,
      gmovelHodometro: sessao.gmovelHodometro,
    });
  };

  reorderScheduleData = async () => {
    let { schedulesData } = this.state;
    const { setStatePanelMonitoring, statePanelMonitoring } = this.context;
    if (statePanelMonitoring !== undefined && statePanelMonitoring.orderPosition === 'desc') {
      schedulesData = JSON.parse(
        JSON.stringify(
          schedulesData.sort((a, b) => {
            return a.USR_NOME < b.USR_NOME ? -1 : 0;
          })
        )
      );
    } else {
      schedulesData = JSON.parse(
        JSON.stringify(
          schedulesData.sort((a, b) => {
            return a.USR_NOME > b.USR_NOME ? -1 : 0;
          })
        )
      );
    }

    await setStatePanelMonitoring({
      ...statePanelMonitoring,
      orderPosition:
        statePanelMonitoring.orderPosition !== undefined && statePanelMonitoring.orderPosition === 'desc'
          ? 'asc'
          : 'desc',
    });

    this.setState({ schedulesData });
  };

  handleChangeFilterText = async (e) => {
    let { textFilterBox } = this.state;
    textFilterBox = e.target.value;
    this.setState({ textFilterBox });
  };

  handleActiveFilterBox = async () => {
    let { activeFilterBox } = this.state;
    activeFilterBox = !activeFilterBox;
    this.setState({ activeFilterBox });
    if (activeFilterBox) {
      setTimeout(() => document.getElementById('textFilterBox').focus(), 100);
    }
  };

  handleClearFilter = async () => {
    let { activeFilterBox } = this.state;
    activeFilterBox = !activeFilterBox;
    this.setState({ activeFilterBox, textFilterBox: '' });
    const { setStatePanelMonitoring, statePanelMonitoring } = this.context;
    let { schedulesData } = statePanelMonitoring;
    if (statePanelMonitoring !== undefined && statePanelMonitoring.orderPosition === 'desc') {
      schedulesData = JSON.parse(
        JSON.stringify(
          schedulesData.sort((a, b) => {
            return a.USR_NOME < b.USR_NOME ? -1 : 0;
          })
        )
      );
    } else {
      schedulesData = JSON.parse(
        JSON.stringify(
          schedulesData.sort((a, b) => {
            return a.USR_NOME > b.USR_NOME ? -1 : 0;
          })
        )
      );
    }
    await setStatePanelMonitoring({
      ...statePanelMonitoring,
      orderPosition:
        statePanelMonitoring.orderPosition !== undefined && statePanelMonitoring.orderPosition === 'desc'
          ? 'asc'
          : 'desc',
      filtering: false,
    });

    this.setState({ schedulesData, textFilterBox: '' });
  };

  handleSetFilter = async () => {
    let { activeFilterBox, textFilterBox } = this.state;
    activeFilterBox = !activeFilterBox;
    this.setState({ activeFilterBox });
    const { setStatePanelMonitoring, statePanelMonitoring } = this.context;
    let { schedulesData } = statePanelMonitoring;
    if (statePanelMonitoring !== undefined && statePanelMonitoring.orderPosition === 'desc') {
      schedulesData = JSON.parse(
        JSON.stringify(
          schedulesData.sort((a, b) => {
            return a.USR_NOME < b.USR_NOME ? -1 : 0;
          })
        )
      );
    } else {
      schedulesData = JSON.parse(
        JSON.stringify(
          schedulesData.sort((a, b) => {
            return a.USR_NOME > b.USR_NOME ? -1 : 0;
          })
        )
      );
    }

    if (textFilterBox !== '') {
      let keyToSearch = textFilterBox.toUpperCase();
      let newScheduleData = schedulesData.filter((item) => item.USR_NOME.toUpperCase().indexOf(keyToSearch) !== -1);

      await setStatePanelMonitoring({
        ...statePanelMonitoring,
        orderPosition:
          statePanelMonitoring.orderPosition !== undefined && statePanelMonitoring.orderPosition === 'desc'
            ? 'asc'
            : 'desc',
        filtering: true,
      });

      this.setState({ schedulesData: newScheduleData });
    }
  };

  updateData = async () => {
    if (this.mounted)
      this.setState({
        loading: true,
      });
    const { setStatePanelMonitoring, statePanelMonitoring } = this.context;
    if (statePanelMonitoring !== undefined && statePanelMonitoring.filtering) {
      return;
    }

    if (this.mounted && statePanelMonitoring.lineClicked !== undefined)
      this.setState({
        lineClicked: statePanelMonitoring.lineClicked,
      });

    const { onClickTable } = this.props;
    let data;
    if (statePanelMonitoring !== undefined && statePanelMonitoring.orderPosition === 'desc') {
      data = JSON.parse(
        JSON.stringify(
          this.props.data.sort((a, b) => {
            return a.USR_NOME > b.USR_NOME ? -1 : 0;
          })
        )
      );
    } else {
      data = JSON.parse(
        JSON.stringify(
          this.props.data.sort((a, b) => {
            return a.USR_NOME < b.USR_NOME ? -1 : 0;
          })
        )
      );
    }
    if (this.mounted) {
      this.setState({
        loading: true,
      });
      let status = '-';
      data.length > 0 && onClickTable(data[0]);
      for (let item of data) {
        if (item.INICIO_DIA) {
          if (item.INICIO_DIA.length > 8) {
            const date = parseDate(item.INICIO_DIA);
            let minutes = date.getMinutes();
            String(minutes).length < 2 && (minutes = '0' + minutes);
            let seconds = date.getSeconds();
            String(seconds).length < 2 && (seconds = '0' + seconds);
            let hour = date.getHours();
            String(hour).length < 2 && (hour = '0' + hour);
            item.INICIO_DIA = `${hour}:${minutes}:${seconds}`;
          }
        }
        if (item.FIM_DIA) {
          const date = parseDate(item.FIM_DIA);
          const hour = date.getHours();
          let minutes = date.getMinutes();
          String(minutes).length < 2 && (minutes = '0' + minutes);
          let seconds = date.getSeconds();
          String(seconds).length < 2 && (seconds = '0' + seconds);
          item.FIM_DIA = `${hour}:${minutes}:${seconds}`;
        }
        if (item.INICIO_DIA && item.FIM_DIA === null) {
          if (item.ATD_ANDAMENTO !== 0) {
            status = 'Ativo';
          } else if (item.ATD_PAUSADO === 1) {
            status = 'Pausado';
          } else {
            status = 'Em trânsito';
          }
          item.status = status;
        } else {
          status = '-';
          item.status = status;
        }

        item.havePhoto = await this.verifyIfHavePhotoPerScheduleData(item);
      }
    }

    if (statePanelMonitoring) {
      // //console.log('statePanelMonitoring.lineClicked', statePanelMonitoring.lineClicked);
      if (this.mounted && statePanelMonitoring.lineClicked !== undefined)
        this.setState({
          lineClicked: statePanelMonitoring.lineClicked,
        });
      await setStatePanelMonitoring({
        ...statePanelMonitoring,
        orderPosition: 'asc',
        schedulesData: data,
      });
    }

    if (this.mounted)
      this.setState({
        schedulesData: data,
        loading: false,
      });
  };

  verifyIfHavePhotoPerScheduleData = async ({ TEM_FOTO }) => {
    return TEM_FOTO === 'Sim' ? true : false;
  };

  onKeyPressFilterText = (e) => {
    //console.log('e.charCode', e.charCode);
    if (e.charCode === 13) {
      this.handleSetFilter();
    }
  };

  restartDay = async () => {
    let { selectedId, usuarioAtivo, empresaAtiva, schedulesData } = this.state;
    const localSchedule = await getLocalObject('scheduleData');
    try {
      const data = await api.post(`v1/tradedashboard/route/reset/${empresaAtiva}/${usuarioAtivo}`, {
        gaaId: selectedId,
      });
      if (data.data.sucess) {
        this.setState({
          schedulesData: schedulesData.map((item) => {
            if (item.GAA_ID === selectedId) {
              item.ATD_ANDAMENTO = 0;
              item.ATD_FINALIZADO = 0;
              item.ATD_JUSTIFICADOS = 0;
              item.INICIO_DIA = null;
              item.alerta = 'Não iniciou o dia.\n';
              item.status = '';
            }
            return item;
          }),
        });
        localSchedule.status = undefined;
        setLocalObject('scheduleData', localSchedule);
        alerta('Dia reiniciado com sucesso!', 1);
      }
    } catch (e) {
      alerta('Erro ao reiniciar o dia!');
    }
  };

  render() {
    const { schedulesData, loading, lineClicked, empresaAtiva, isOpenConfirmModal, gmovelHodometro } = this.state;

    return (
      <Container>
        {loading ? (
          <div className="skeletonLoading">
            <Skeleton height={30} />
            <Skeleton height={1} />
            <Skeleton height={30} />
            <Skeleton height={30} />
            <Skeleton height={30} />
            <Skeleton height={30} />
            <Skeleton height={30} />
            <Skeleton height={30} />
            <Skeleton height={30} />
            <Skeleton height={30} />
            <Skeleton height={30} />
            <Skeleton height={30} />
            <Skeleton height={30} />
          </div>
        ) : (
          <DivDetalhe flex="1">
            {
              <ContentData>
                <ContentHeader>
                  <PTitle width="20%"></PTitle>
                  <PTitle width="30%">Status</PTitle>
                  <PTitle width="40%">Nome</PTitle>
                  <PTitle width="10%"></PTitle>
                </ContentHeader>
                {schedulesData.map((schedule, i) => (
                  <Collapsible
                    key={i}
                    accordion
                    style={{
                      width: '100%',
                      borderStyle: 'none',
                      boxShadow: 'none',
                    }}
                    options={{
                      onOpenStart: () => {
                        this.setState((prevState) => ({
                          lineClicked: schedule.GAA_ID,
                          itemsClicked: [...prevState.itemsClicked, i],
                        }));
                      },
                      onCloseStart: () => {
                        const { itemsClicked } = this.state;
                        this.setState({
                          itemsClicked: itemsClicked.filter((item) => item !== i),
                        });
                      },
                    }}
                  >
                    <CollapsibleItem
                      expanded={lineClicked === schedule.GAA_ID}
                      className="collapsibleItemDashboard"
                      header={
                        <ContentItemsBody clicked={lineClicked === schedule.GAA_ID}>
                          <PDescriptionItem width="20%">
                            {schedule.alerta !== '' ? <Icon>info</Icon> : null}
                            {schedule.INICIO_DIA !== null &&
                              schedule.ATD_FINALIZADO === 0 &&
                              schedule.ATD_ANDAMENTO === 0 &&
                              schedule.ATD_JUSTIFICADOS === 0 && (
                                <div
                                  onClick={() =>
                                    this.setState({ isOpenConfirmModal: true, selectedId: schedule.GAA_ID })
                                  }
                                  style={{ display: 'flex', marginRight: 0 }}
                                >
                                  <Icon>autorenew</Icon>
                                </div>
                              )}
                          </PDescriptionItem>
                          <PDescriptionItem width="35%">{schedule.status}</PDescriptionItem>
                          <PDescriptionItem width="50%">
                            {schedule.USR_NOME?.indexOf('Promotor') === -1
                              ? schedule.USR_NOME
                              : schedule.USR_NOME.split('Promotor', 2)}
                          </PDescriptionItem>
                          <PDescriptionItem width="5%">
                            <>
                              <Icon className="material-icons plus">add_circle_outline</Icon>

                              <Icon href="#" className="material-icons minus">
                                remove_circle_outline
                              </Icon>
                            </>
                          </PDescriptionItem>
                        </ContentItemsBody>
                      }
                      node="div"
                    >
                      <ContentBodyCollapsible>
                        <ItemDataTable
                          data={schedule}
                          index={i}
                          lineClicked={lineClicked}
                          empresaAtiva={empresaAtiva}
                          gmovelHodometro={gmovelHodometro}
                        />
                      </ContentBodyCollapsible>
                    </CollapsibleItem>
                  </Collapsible>
                ))}
              </ContentData>
            }
          </DivDetalhe>
        )}
        {isOpenConfirmModal ? (
          <div
            style={{
              width: '100%',
            }}
          >
            <Modal
              className="modalQuestion"
              actions={[
                <>
                  <Button
                    className="waves-effect waves-light saib-button is-primary modal-action modal-close"
                    onClick={() => this.restartDay()}
                    color="primary"
                  >
                    Sim
                  </Button>
                  <Button
                    className="waves-effect waves-light saib-button is-primary modal-action modal-close"
                    onClick={() => {
                      this.setState({ isOpenConfirmModal: false });
                    }}
                    color="primary"
                  >
                    Não
                  </Button>
                </>,
              ]}
              bottomSheet={false}
              fixedFooter={true}
              header={'Confirmação'}
              options={{
                dismissible: true,
                endingTop: '10%',
                inDuration: 0,
                onCloseEnd: null,
                onCloseStart: null,
                onOpenEnd: null,
                opacity: 0.5,
                outDuration: 0,
                preventScrolling: true,
                startingTop: '4%',
              }}
              open={isOpenConfirmModal}
            >
              <div
                style={{
                  overflowY: 'unset',
                  overflowX: 'hidden',
                  height: 'unset',
                }}
              >
                Deseja confirmar o reinicio do dia?
              </div>
            </Modal>
          </div>
        ) : null}
      </Container>
    );
  }
}
