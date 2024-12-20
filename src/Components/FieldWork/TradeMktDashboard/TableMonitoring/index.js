import React, { Component } from 'react';
import Skeleton from 'react-loading-skeleton';
import { Icon, Table, Button, Modal } from 'react-materialize';
import { Link } from 'react-router-dom';
import { getFromStorage } from '../../../../services/auth';
import { alerta, dateFormat, haveData, parseDate } from '../../../../services/funcoes';
import { Linha, Container, DivDetalhe, Td, Th, Tr, DivFilter, Labels } from './styled';
import PanelMonitoringContext from '../../../../providers/monitoringPanel';
import api from '../../../../services/api';
import { getLocalObject, setLocalObject } from '../../../../services/databaseLocal';
import { format } from 'date-fns';
import { IoMdPhotos, IoMdTrash } from 'react-icons/io';
import imageCompression from 'browser-image-compression';
import { getBase64 } from '../../../../Pages/Trade/Home/tradeGlobalFunctions';

export default class TableMonitoring extends Component {
  state = {
    loading: true,
    today: dateFormat(new Date(), 'DD/MM/yyyy'),
    clicked: true,
    schedulesData: [],
    lineClicked: 0,
    activeFilterBox: false,
    textFilterBox: '',
    isOpenConfirmModal: false,
    selectedId: 0,
    kmDriven: null,
    isOpenModalKms: false,
    imageKmInitial: null,
    imageKmFinal: null,
  };

  async componentDidMount() {
    this.mounted = true;
    await this.carregarVariaveisEstado();
    TableMonitoring.contextType = PanelMonitoringContext;
    this.updateData();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  async componentDidUpdate(prevProps, prevState) {
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
        this.setState({
          loading: this.props.forceLoading,
        });
      }
    }
    if (this.state.selectedId !== 0 && prevState.isOpenConfirmModal === false) {
      this.setState({
        isOpenConfirmModal: true,
      });
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
    const { statePanelMonitoring } = this.context;
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
    } finally {
      this.setState({
        isOpenConfirmModal: false,
        selectedId: 0,
      });
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
    const { setStatePanelMonitoring, statePanelMonitoring } = this.context;
    if (statePanelMonitoring !== undefined && statePanelMonitoring.filtering) {
      return;
    }

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
      this.setState({
        lineClicked: statePanelMonitoring.lineClicked,
      });
    }

    if (statePanelMonitoring) {
      // //console.log('statePanelMonitoring.lineClicked', statePanelMonitoring.lineClicked);
      this.setState({
        lineClicked: statePanelMonitoring.lineClicked,
      });

      await setStatePanelMonitoring({
        ...statePanelMonitoring,
        orderPosition:
          statePanelMonitoring.orderPosition !== undefined && statePanelMonitoring.orderPosition === 'desc'
            ? 'asc'
            : 'desc',
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
    if (this.mounted) {
      return TEM_FOTO === 'Sim' ? true : false;
    }
  };

  onKeyPressFilterText = (e) => {
    //console.log('e.charCode', e.charCode);
    if (e.charCode === 13) {
      this.handleSetFilter();
    }
  };

  handleGetImage = async (event) => {
    const img = event.target.files[0];

    const options = {
      maxSizeMB: 0.2,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    let compressedFile = await imageCompression(img, options);

    const fileExtension = compressedFile.name.substring(
      compressedFile.name.lastIndexOf('.'),
      compressedFile.name.length
    );

    const resData = await getBase64(compressedFile.size > img.size ? img : compressedFile);
    return { image: resData, fileExtension };
  };

  handleGetKmDriven = async (user, date, name) => {
    try {
      let { usuarioAtivo, empresaAtiva } = this.state;
      this.setState({ loading: true });
      const res = await api.get(`v2/trade/kmdriven/${empresaAtiva}/${usuarioAtivo}`, {
        params: {
          data: format(new Date(date), 'dd/MM/yyyy'),
          usuarioAgenda: user,
        },
      });

      const { data, sucess } = res.data;

      if (sucess && data && data.length > 0) {
        data[0].USUARIO = name;
        this.setState({ isOpenModalKms: true, kmDriven: data[0] });
      } else if (data && data.length === 0) {
        alerta('Não há dados do hodômetro');
      }
    } catch (error) {
      alerta('Não foi possível buscar os dados do hodômetro');
    } finally {
      this.setState({ loading: false });
    }
  };

  handleSaveImage = async (image, filename, uniqueid) => {
    try {
      const { usuarioAtivo, empresaCnpj } = this.state;

      this.setState({
        loading: true,
      });

      const payload = {
        fileName: filename,
        id: 1,
        imageData: image,
        uniqueid,
      };

      const url = '/v2/trade/sync/image/' + empresaCnpj + '/' + usuarioAtivo;
      const res = await api.post(url, payload, {
        timeout: 30 * 1000,
      });

      const { data } = res.data;
      if (haveData(data)) {
        return data.urlPath;
      }
    } catch (error) {
      alerta('Não foi possível salvar a foto', 2);
    } finally {
      this.setState({ loading: false });
    }
  };

  handleSaveKmDriven = async () => {
    try {
      let {
        usuarioAtivo,
        empresaAtiva,
        kmDriven,
        imageKmInitial,
        imageKmFinal,
        fileExtensionInitial,
        fileExtensionFinal,
      } = this.state;

      this.setState({ loading: true });

      let imageInitial = null;
      let imageFinal = null;
      if (imageKmInitial) {
        imageInitial = await this.handleSaveImage(
          imageKmInitial,
          `Foto_inicio${fileExtensionInitial}`,
          `km inicio dia`
        );
      }

      if (imageKmFinal) {
        imageFinal = await this.handleSaveImage(imageKmFinal, `Foto_fim${fileExtensionFinal}`, `km fim dia`);
      }

      const payload = {
        GKM_ID: kmDriven.GKM_ID,
        GKM_USR_AGENDA_ID: kmDriven.GKM_USR_AGENDA_ID,
        GKM_DATA: format(new Date(kmDriven.GKM_DATA), 'yyyy-MM-dd'),
        GKM_KM_INICIAL: kmDriven.GKM_KM_INICIAL,
        GKM_KM_INICIAL_DATA: format(new Date(kmDriven.GKM_KM_INICIAL_DATA), 'yyyy-MM-dd'),
        GKM_KM_INICIAL_FOTO: imageInitial || kmDriven.GKM_KM_INICIAL_FOTO,
        GKM_KM_INICIAL_LATITUDE: kmDriven.GKM_KM_INICIAL_LATITUDE,
        GKM_KM_INICIAL_LONGITUDE: kmDriven.GKM_KM_INICIAL_LONGITUDE,
        GKM_KM_FINAL: kmDriven.GKM_KM_FINAL,
        GKM_KM_FINAL_FOTO: imageFinal || kmDriven.GKM_KM_FINAL_FOTO,
        GKM_KM_FINAL_DATA:
          kmDriven?.GKM_KM_FINAL_FOTO && !kmDriven?.GKM_KM_FINAL_DATA
            ? format(new Date(kmDriven.GKM_KM_FINAL_DATA), 'yyyy-MM-dd hh:mm:ss')
            : kmDriven?.GKM_KM_FINAL_DATA,
        GKM_KM_FINAL_LATITUDE:
          kmDriven?.GKM_KM_FINAL && !kmDriven?.GKM_KM_FINAL_LATITUDE
            ? kmDriven.GKM_KM_INICIAL_LATITUDE
            : kmDriven?.GKM_KM_FINAL_LATITUDE,
        GKM_KM_FINAL_LONGITUDE:
          kmDriven?.GKM_KM_FINAL && !kmDriven?.GKM_KM_FINAL_LONGITUDE
            ? kmDriven.GKM_KM_INICIAL_LONGITUDE
            : kmDriven?.GKM_KM_FINAL_LONGITUDE,
      };
      const res = await api.post(`v2/trade/kmdriven/${empresaAtiva}/${usuarioAtivo}`, payload);

      const { sucess } = res.data;

      if (sucess) {
        this.setState({ isOpenModalKms: false, kmDriven: null });
        alerta('Hodômetro atualizado com sucesso', 1);
      }
    } catch (error) {
      alerta('Erro ao atualizar hodômetro');
    } finally {
      this.setState({ loading: false, isOpenModalKms: false, kmDriven: null });
    }
  };

  render() {
    const {
      schedulesData,
      clicked,
      lineClicked,
      loading,
      activeFilterBox,
      textFilterBox,
      isOpenConfirmModal,
      isOpenModalKms,
      kmDriven,
      gmovelHodometro,
    } = this.state;
    const { onClickTable, handleScheduleSearch, isMobile } = this.props;
    const { setStatePanelMonitoring, statePanelMonitoring } = this.context;

    return (
      <Container>
        {loading && !isMobile ? (
          <div className="skeletonLoading">
            <Skeleton height={50} />
            <Skeleton height={1} />
            <Skeleton height={50} />
            <Skeleton height={50} />
            <Skeleton height={50} />
            <Skeleton height={50} />
          </div>
        ) : (
          <DivDetalhe flex="1">
            {!loading && !isMobile && (
              <Table className="table-scroll small-first-col">
                <thead>
                  <tr>
                    <Th></Th>
                    <Th data-field="id">Início</Th>
                    <Th data-field="name">Fim</Th>
                    <Th data-field="price">
                      <DivFilter>
                        <div
                          onClick={async () => {
                            await setStatePanelMonitoring({
                              ...statePanelMonitoring,
                              orderPosition:
                                statePanelMonitoring.orderPosition !== undefined &&
                                statePanelMonitoring.orderPosition === 'desc'
                                  ? 'asc'
                                  : 'desc',
                            });
                            this.reorderScheduleData();
                          }}
                          className="divIconReorder"
                        >
                          <Icon tiny>sort_by_alpha</Icon>
                        </div>
                        <div className="divIconFilter" onClick={this.handleActiveFilterBox}>
                          <Icon tiny>filter_alt</Icon>
                        </div>
                        <div className="divFilterByUserName">Nome</div>
                      </DivFilter>
                      {activeFilterBox && (
                        <>
                          <DivFilter className="filterBoxScreen">
                            <Linha className="topLineFilterBox">
                              <span className="saib-button is-primary" onClick={this.handleActiveFilterBox}>
                                X
                              </span>
                            </Linha>
                            <input
                              onChange={this.handleChangeFilterText}
                              value={textFilterBox}
                              onKeyPress={this.onKeyPressFilterText}
                              id="textFilterBox"
                            />
                            <div className="bottomLineFilterBox">
                              <span className="saib-button is-primary" onClick={this.handleClearFilter}>
                                Limpar
                              </span>
                              <span className="saib-button is-primary" onClick={this.handleSetFilter}>
                                Filtrar
                              </span>
                            </div>
                          </DivFilter>
                        </>
                      )}
                    </Th>
                    <Th data-field="price">Status</Th>
                    <Th data-field="price" flex="2">
                      Atendendo
                    </Th>
                    <Th smaller data-field="price">
                      Atend.
                    </Th>
                    <Th smaller data-field="price">
                      Fin.
                    </Th>
                    <Th smaller data-field="price">
                      And.
                    </Th>
                    <Th smaller data-field="price">
                      Just.
                    </Th>
                    <Th data-field="price"></Th>
                    <Th data-field="price"></Th>
                    <Th data-field="price"></Th>
                  </tr>
                </thead>

                <tbody className="body-half-screen">
                  {schedulesData.map(
                    (
                      {
                        GAA_ID,
                        INICIO_DIA,
                        FIM_DIA,
                        USR_NOME,
                        EM_ATD_CLI_NOME_FANTASIA,
                        ATD_TOTAL,
                        ATD_FINALIZADO,
                        ATD_ANDAMENTO,
                        ATD_JUSTIFICADOS,
                        GAA_USR_ID_AGENDA,
                        GAA_DTA_AGENDA,
                        QTDE_INTERRUPCOES,
                        havePhoto,
                        alerta,
                        status,
                      },
                      i
                    ) => (
                      <Tr
                        key={i}
                        clicked={clicked && lineClicked === i}
                        onClick={() => {
                          this.setState({
                            clicked: true,
                            lineClicked: i,
                          });
                          onClickTable(schedulesData[i], lineClicked);
                        }}
                      >
                        <Td className="td-iconAlert">
                          {alerta !== '' ? <Icon>info</Icon> : null}
                          {INICIO_DIA !== null &&
                            ATD_FINALIZADO === 0 &&
                            ATD_ANDAMENTO === 0 &&
                            ATD_JUSTIFICADOS === 0 && (
                              <div
                                onClick={() => {
                                  this.setState({ selectedId: GAA_ID });
                                }}
                                style={{ cursor: 'pointer', display: 'flex' }}
                              >
                                <Icon>autorenew</Icon>
                              </div>
                            )}
                        </Td>
                        <Td>{INICIO_DIA ? INICIO_DIA : '##:##'} </Td>
                        <Td>{FIM_DIA ? FIM_DIA : '##:##'}</Td>
                        <td className="truncate">
                          <>
                            {INICIO_DIA && (
                              <>
                                <Link
                                  to={{
                                    pathname: '/TradeRoute',
                                    state: [schedulesData[i], { lineClicked: i }],
                                    userId: GAA_USR_ID_AGENDA,
                                    data: GAA_DTA_AGENDA,
                                    gaaId: GAA_ID,
                                    urlPrevius: 'TradeMktDashboard',
                                  }}
                                >
                                  <Button
                                    className="saib-button is-circle mapButton"
                                    title="Ver trajeto"
                                    style={{ padding: '14px' }}
                                    onClick={handleScheduleSearch}
                                  >
                                    <Icon>map</Icon>
                                  </Button>
                                </Link>
                                &nbsp;
                              </>
                            )}
                            {USR_NOME?.indexOf('Promotor') === -1 ? USR_NOME : USR_NOME.split('Promotor', 2)}
                          </>
                        </td>
                        <Td>{status}</Td>
                        <td className="truncate">{EM_ATD_CLI_NOME_FANTASIA ? EM_ATD_CLI_NOME_FANTASIA : '-'}</td>
                        <Td smaller>{ATD_TOTAL}</Td>
                        <Td smaller>{ATD_FINALIZADO}</Td>
                        <Td smaller>{ATD_ANDAMENTO}</Td>
                        <Td smaller>{ATD_JUSTIFICADOS}</Td>
                        {gmovelHodometro && (
                          <Td>
                            <button
                              className="saib-button is-primary scheduleButton"
                              onClick={async () =>
                                await this.handleGetKmDriven(
                                  GAA_USR_ID_AGENDA,
                                  GAA_DTA_AGENDA,
                                  USR_NOME?.indexOf('Promotor') === -1 ? USR_NOME : USR_NOME.split('Promotor', 2)
                                )
                              }
                            >
                              KM
                            </button>
                          </Td>
                        )}
                        <Td>
                          <Link
                            to={{
                              pathname: '/TradeInterruptions',
                              state: [
                                schedulesData[i],
                                { urlPrevius: '/TradeMktDashboard', userName: USR_NOME, lineClicked: i },
                              ],
                              forceBack: true,
                              urlPrevius: 'TradeMktDashboard',
                            }}
                          >
                            <button className="saib-button is-primary scheduleButton" onClick={handleScheduleSearch}>
                              {QTDE_INTERRUPCOES <= 9 && QTDE_INTERRUPCOES % 1 === 0 && QTDE_INTERRUPCOES !== 0
                                ? '0' + QTDE_INTERRUPCOES
                                : QTDE_INTERRUPCOES}
                              &nbsp; Int.
                            </button>
                          </Link>
                        </Td>
                        <Td>
                          {INICIO_DIA && havePhoto && (
                            <Link
                              to={{
                                pathname: '/SchedulePhotos',
                                state: [
                                  schedulesData[i],
                                  { urlPrevius: '/TradeMktDashboard', userName: USR_NOME, lineClicked: i },
                                ],
                                forceBack: true,
                                urlPrevius: 'TradeMktDashboard',
                              }}
                            >
                              <button className="saib-button is-primary scheduleButton">
                                <Icon tiny>image</Icon>&nbsp; Fotos
                              </button>
                            </Link>
                          )}
                        </Td>
                        <Td>
                          {INICIO_DIA && (
                            <Link
                              to={{
                                pathname: '/ProfessionalSchedule',
                                state: [
                                  schedulesData[i],
                                  { urlPrevius: '/TradeMktDashboard', userName: USR_NOME, lineClicked: i },
                                ],
                                forceBack: true,
                                urlPrevius: 'TradeMktDashboard',
                                userName: USR_NOME,
                              }}
                            >
                              <button className="saib-button is-primary scheduleButton" onClick={handleScheduleSearch}>
                                <Icon tiny>calendar_today</Icon>Agenda
                              </button>
                            </Link>
                          )}
                        </Td>
                      </Tr>
                    )
                  )}
                </tbody>
              </Table>
            )}
          </DivDetalhe>
        )}
        {isOpenConfirmModal && (
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
        )}

        {isOpenModalKms && (
          <Modal
            className="modalQuestion"
            actions={[
              <>
                <Button
                  className="waves-effect waves-light saib-button is-primary modal-action modal-close"
                  onClick={this.handleSaveKmDriven}
                  color="primary"
                >
                  Salvar
                </Button>
                <Button
                  className="waves-effect waves-light saib-button is-primary modal-action modal-close"
                  onClick={() => {
                    this.setState({ isOpenModalKms: false });
                  }}
                  color="primary"
                >
                  Cancelar
                </Button>
              </>,
            ]}
            bottomSheet={false}
            fixedFooter={true}
            header={`Hodômetro - ${kmDriven?.USUARIO}`}
            options={{
              dismissible: true,
              endingTop: '10%',
              inDuration: 0,
              onCloseStart: null,
              onOpenEnd: null,
              opacity: 0.5,
              outDuration: 0,
              preventScrolling: true,
              startingTop: '4%',
              onCloseEnd: () => {
                this.setState({
                  isOpenModalKms: false,
                });
              },
            }}
            open={isOpenModalKms}
          >
            <div
              style={{
                overflowY: 'unset',
                overflowX: 'hidden',
                height: 'unset',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '16px',
                gap: '0.5rem',
                width: '95%',
              }}
            >
              <Labels color={'#000'} fontSize={'1.1rem'} style={{ marginTop: '0.4rem' }}>
                Km inicial do dia
              </Labels>
              <input
                id="km_initial"
                type="number"
                value={kmDriven.GKM_KM_INICIAL}
                placeholder="Informe a KM inicial do dia"
                onChange={(e) => {
                  kmDriven.GKM_KM_INICIAL = Number(e.target.value);
                  this.setState({ kmDriven });
                }}
                style={{ width: '100%' }}
              />
              <label
                htmlFor="inputPhoto"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  width: '98%',
                  color: '#fff',
                  fontSize: '1.2rem',
                  padding: '0.3rem 0.5rem',
                  background: '#8e44ad',
                }}
              >
                Foto do início do dia
                <IoMdPhotos size={20} />
              </label>
              <input
                className="hidden"
                id="inputPhoto"
                type="file"
                accept="image/*"
                capture
                onChange={async (event) => {
                  const res = await this.handleGetImage(event);
                  kmDriven.GKM_KM_INICIAL_FOTO = res.image;
                  this.setState({
                    imageKmInitial: res.image,
                    fileExtensionInitial: res.fileExtension,
                    kmDriven,
                  });
                }}
              />
              {kmDriven.GKM_KM_INICIAL_FOTO && (
                <>
                  <img src={kmDriven.GKM_KM_INICIAL_FOTO} alt="Foto saída" width={420} height={380} />
                  <Button
                    className="waves-effect waves-light saib-button is-primary"
                    onClick={() => {
                      kmDriven.GKM_KM_INICIAL_FOTO = null;
                      this.setState({
                        imageKmInitial: null,
                        fileExtensionInitial: null,
                        kmDriven,
                      });
                    }}
                  >
                    <IoMdTrash size={20} />
                    Remover imagem
                  </Button>
                </>
              )}

              <Labels color={'#000'} fontSize={'1.1rem'} style={{ marginTop: '0.4rem' }}>
                Km final do dia
              </Labels>
              <input
                id="km_final"
                type="number"
                placeholder="Informe a KM final do dia"
                value={kmDriven.GKM_KM_FINAL}
                onChange={(e) => {
                  kmDriven.GKM_KM_FINAL = Number(e.target.value);
                  this.setState({ kmDriven });
                }}
                style={{ width: '100%' }}
              />
              <label
                htmlFor="inputPhotoFinal"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  width: '98%',
                  color: '#fff',
                  fontSize: '1.2rem',
                  padding: '0.3rem 0.5rem',
                  background: '#8e44ad',
                }}
              >
                Foto do fim do dia
                <IoMdPhotos size={20} />
              </label>

              <input
                className="hidden"
                id="inputPhotoFinal"
                type="file"
                accept="image/*"
                capture
                onChange={async (event) => {
                  const res = await this.handleGetImage(event);
                  kmDriven.GKM_KM_FINAL_FOTO = res.image;
                  this.setState({
                    imageKmFinal: res.image,
                    fileExtensionFinal: res.fileExtension,
                    kmDriven,
                  });
                }}
              />
              {kmDriven.GKM_KM_FINAL_FOTO && (
                <>
                  <img src={kmDriven.GKM_KM_FINAL_FOTO} alt="Foto chegada" width={420} height={380} />
                  <Button
                    className="waves-effect waves-light saib-button is-primary"
                    onClick={() => {
                      kmDriven.GKM_KM_FINAL_FOTO = null;
                      this.setState({
                        imageKmFinal: null,
                        fileExtensionFinal: null,
                        kmDriven,
                      });
                    }}
                  >
                    <IoMdTrash size={20} />
                    Remover imagem
                  </Button>
                </>
              )}
            </div>
          </Modal>
        )}
      </Container>
    );
  }
}
