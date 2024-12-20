import React, { Component } from 'react';
import { Button, Icon, Collapsible, CollapsibleItem, Modal } from 'react-materialize';
import { Link } from 'react-router-dom';
import api from '../../../../../services/api';
import ListAlterts from '../../BottomMonitoring/ListAlterts';
import { Container, Item, PTitle, PData, Row, HeaderCollapsible, ContentCollapsible } from './styled';
import './forced.css';
import { alerta, haveData } from '../../../../../services/funcoes';
import { format } from 'date-fns';
import { Labels } from '../styled';
import { getFromStorage } from '../../../../../services/auth';
import imageCompression from 'browser-image-compression';
import { IoMdPhotos, IoMdTrash } from 'react-icons/io';
import { getBase64 } from '../../../../../Pages/Trade/Home/tradeGlobalFunctions';
export default class ItemDataTable extends Component {
  state = {
    alerts: [],
    kmDriven: null,
    isOpenModalKms: false,
  };

  componentDidMount = async () => {
    let { alerts } = this.state;
    await this.carregarVariaveisEstado();
    if (this.props.data.alerta === 'Sim') {
      const getAlerts = await api.post(
        `v1/tradedashboard/alerts/${this.props.empresaAtiva}/${this.props.data.GAA_USR_ID_AGENDA}`,
        {
          gaaId: this.props.data.GAA_ID,
        }
      );

      let alertsUser = [];
      getAlerts.data.data.forEach((element) => {
        let item = {};
        item.descricao = element.GTI_DESCRICAO;
        item.gaaId = element.GAL_ID;
        item.status = 0;
        item.impede = element.GTI_FLG_IMPEDE_ATD;
        item.userName = this.props.data.USR_NOME;
        item.observation = element.GAL_OBSERVACAO;
        alertsUser.push(item);
      });

      alerts = alertsUser;
      this.setState({ alerts });
    } else {
      alerts.push({
        descricao: this.props.data.alerta,
        gaaId: this.props.data.GAA_ID,
        status: 2,
        impede: 0,
        userName: this.props.data.USR_NOME,
      });

      this.setState({ alerts });
    }
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
    const { data, lineClicked, gmovelHodometro } = this.props;
    const { alerts, isOpenModalKms, kmDriven } = this.state;

    return (
      <Container>
        <Row>
          <Item>
            <PTitle>Ínicio</PTitle>

            <PData>{data?.INICIO_DIA ? data.INICIO_DIA : '##:##'}</PData>
          </Item>
          <Item>
            <PTitle>Fim</PTitle>

            <PData withPaddingLeft>{data.FIM_DIA ? data.FIM_DIA : '##:##'}</PData>
          </Item>
          <Item align="flex-start">
            <PTitle withPaddingLeft>Atendendo</PTitle>

            <PData withPaddingLeft>{data.EM_ATD_CLI_NOME_FANTASIA ? data.EM_ATD_CLI_NOME_FANTASIA : '-'}</PData>
          </Item>
        </Row>
        <Row>
          <Item align="center">
            <PTitle>Finalizados</PTitle>

            <PData>{data.ATD_FINALIZADO}</PData>
          </Item>
          <Item align="center">
            <PTitle>Andamento</PTitle>

            <PData>{data.ATD_ANDAMENTO}</PData>
          </Item>
          <Item align="center">
            <PTitle>Atendimentos</PTitle>

            <PData>{data.ATD_TOTAL}</PData>
          </Item>
        </Row>

        <Row withMarginTop>
          {data.INICIO_DIA && data.havePhoto && (
            <Link
              to={{
                pathname: '/SchedulePhotos',
                state: [data, { urlPrevius: '/TradeMktDashboard', userName: data.USR_NOME, lineClicked }],
                forceBack: true,
                urlPrevius: 'TradeMktDashboard',
              }}
            >
              <button className="saib-button is-primary photoButton">
                <Icon tiny>image</Icon>&nbsp; Fotos
              </button>
            </Link>
          )}

          {data.INICIO_DIA && (
            <Link
              to={{
                pathname: '/ProfessionalSchedule',
                state: [data, { urlPrevius: '/TradeMktDashboard', userName: data.USR_NOME, lineClicked }],
                forceBack: true,
                urlPrevius: 'TradeMktDashboard',
                userName: data.USR_NOME,
              }}
            >
              <button className="saib-button is-primary scheduleButton">
                <Icon tiny>calendar_today</Icon>&nbsp; Agenda
              </button>
            </Link>
          )}
          <Link
            to={{
              pathname: '/TradeInterruptions',
              state: [data, { urlPrevius: '/TradeMktDashboard', userName: data.USR_NOME, lineClicked }],
              forceBack: true,
              urlPrevius: 'TradeMktDashboard',
            }}
          >
            <button className="saib-button is-primary scheduleButton">
              {data.QTDE_INTERRUPCOES <= 9 && data.QTDE_INTERRUPCOES % 1 === 0 && data.QTDE_INTERRUPCOES !== 0
                ? '0' + data.QTDE_INTERRUPCOES
                : data.QTDE_INTERRUPCOES}
              &nbsp;
              {data.QTDE_INTERRUPCOES === 1 ? 'Interrupção' : 'Interrupções'}
            </button>
          </Link>
          <Link
            to={{
              pathname: '/TradeRoute',
              state: [data, { lineClicked }],
              userId: data.GAA_USR_ID_AGENDA,
              data: data.GAA_DTA_AGENDA,
              gaaId: data.GAA_ID,
              urlPrevius: 'TradeMktDashboard',
            }}
          >
            <Button
              className="saib-button is-circle mapButton"
              style={{ padding: '14px' }}
              // onClick={handleScheduleSearch}
            >
              <Icon>map</Icon>
            </Button>
          </Link>
        </Row>
        <Row withMarginTop>
          {gmovelHodometro && (
            <button
              onClick={async () =>
                await this.handleGetKmDriven(
                  data.GAA_USR_ID_AGENDA,
                  data.GAA_DTA_AGENDA,
                  data.USR_NOME?.indexOf('Promotor') === -1 ? data.USR_NOME : data.USR_NOME.split('Promotor', 2)
                )
              }
              className="saib-button is-primary photoButton"
            >
              KM
            </button>
          )}
        </Row>
        {alerts.length > 0 && this.props.data.alerta !== '' && (
          <Row withMarginTop>
            <Collapsible
              accordion
              style={{
                width: '100%',
                borderStyle: 'none',
                boxShadow: 'none',
              }}
            >
              <CollapsibleItem
                expanded={false}
                className="collapsibleItemAlerts"
                header={
                  <HeaderCollapsible>
                    <>
                      <Icon className="material-icons plusAlert">add_circle_outline</Icon>

                      <Icon className="material-icons minusAlert">remove_circle_outline</Icon>
                    </>
                    {alerts.length > 1 ? `${alerts.length} ALERTAS` : `${alerts.length} ALERTA`}
                  </HeaderCollapsible>
                }
                node="div"
              >
                <ContentCollapsible>
                  <ListAlterts alerts={alerts} forceLoading={false} />
                </ContentCollapsible>
              </CollapsibleItem>
            </Collapsible>
          </Row>
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
                <img src={kmDriven.GKM_KM_INICIAL_FOTO} alt="Foto saída" width={320} height={320} />
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
                <img src={kmDriven.GKM_KM_FINAL_FOTO} alt="Foto chegada" width={320} height={320} />
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
