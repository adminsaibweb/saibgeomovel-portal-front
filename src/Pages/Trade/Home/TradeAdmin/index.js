import React, { Component, forwardRef } from 'react';
import { withRouter } from 'react-router-dom';
import { getFromStorage } from '../../../../services/auth';
import { Icon, Button, Modal } from 'react-materialize';
import DatePicker from 'react-datepicker';
import { delLocalObject, deleteDB, getAllImages } from '../../../../services/databaseLocal';
import { Labels, Container, Linha, DivDetalhe, Titulo } from '../style';
import ptBR from 'date-fns/locale/pt-BR';
// import { JSONEditor } from 'react-json-editor-viewer';
import { EnviromentVars } from '../../../../config/env';
// import Question from '../../../../Components/Globals/Question';
import PhotosList from './PhotosList';
import InputMask from 'react-input-mask';

import WaitScreen from '../../../../Components/Globals/WaitScreen';
import { syncImages, uploadLocalData, getDataCloud, loadLocalData, getAllSyncs } from '../tradeGlobalFunctions';
import { alerta, getScheduleData, haveData } from '../../../../services/funcoes';
import api from '../../../../services/api';
import { ViewSyncs } from './ViewSyncs';
import { DataFilter } from '../../../Supervisor/ApprovalOfPayments/styles';
import { format } from 'date-fns';
import { LastSync } from './LastSync';

const CustomCalendarInput = forwardRef(({ value, onClick, onChange }, ref) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'row',
      width: '110px',
      justifyContent: 'space-between',
      borderBottom: '1px solid #ccc',
    }}
  >
    <InputMask style={{ width: '90px' }} mask="99/99/9999" value={value} maskChar={null} onChange={onChange} />
    <span onClick={onClick} style={{ cursor: 'pointer', color: 'rgb(97, 9, 138)' }}>
      <Icon>date_range</Icon>
    </span>
  </div>
));
class TradeAdmin extends Component {
  state = {
    customSelectedInitial: new Date(),
    loading: false,
    viewScheduleData: false,
    email: '',
    password: '',
    error: '',
    isOpenModal: false,
    code: '',
    isOpenViewSyncs: false,
    dataViewSync: -1,
    modalLastSync: false
  };

  componentDidMount = async () => {
    await this.carregarVariaveisEstado();
    let scheduleData = await getScheduleData()
    if (haveData(scheduleData)) {
      let gaaId = scheduleData.GAA_ID;
      let nomeUsuario = scheduleData.USR_NOME;
      let qtdeClientes = scheduleData.QTDE_CLIENTES;
      let dataAgenda = scheduleData.GAA_DTA_AGENDA;
      this.setState({ gaaId, nomeUsuario, qtdeClientes, dataAgenda });
    }

    let imagesList = await getAllImages();
    let images = [];
    let output = await this.veryfySyncImages(images, imagesList);

    this.setState({ scheduleData, images: output });
  };

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
      empresaCnpj: sessao.empresaCnpj,
      frotaId: sessao.frotaId,
      gmovel: sessao.gmovel,
      gmovelTrade: sessao.gmovelTrade,
      gmovelPromotor: sessao.gmovelPromotor,
      gmovelSupervisor: sessao.gmovelSupervisor,
    });
  };

  validateSubmit = async () => {
    const { code } = this.state;
    let erros = '';
    if (!code) {
      erros += 'Codigo não pode ser vazio';
    }

    this.setState({ error: erros });
    return erros;
  };

  cleanLocalData = async () => {
    const { code, gaaId, usuarioAtivo, empresaAtiva } = this.state;
    let erros = await this.validateSubmit();

    if (erros) {
      alerta(erros);
      return this.setState({ isOpenModal: true });
    }


    try {
      this.setState({ loading: true });
      const retorno = await api.post('v1/pwd/validate', {
        pwd: code,
      });

      const _data = retorno.data;
      if (!_data || _data.length <= 0) {
        if (!_data.sucess)
          this.setState({
            error: '1.Não foi possível comunicar com o servidor',
          });
      } else {
        if (_data.sucess) {
          const resetDay = await api.post(`v1/tradedashboard/route/reset/force/${empresaAtiva}/${usuarioAtivo}`, {
            gaaId: gaaId,
          });
          if(resetDay.data.sucess) {
            this.setState({ loading: true, message: 'Limpando dados dias posteriores...', percent: 0 });
            await delLocalObject('allScheduleData');
            await delLocalObject('perguntas');
            this.setState({ loading: true, message: 'Limpando dados pesquisas hoje...', percent: 25 });
            await deleteDB('ScheduleDataDB');
            await delLocalObject('scheduleData');
            this.setState({ loading: true, message: 'Limpando imagens...', percent: 50 });
            await deleteDB(EnviromentVars.imageDB);
            this.setState({ loading: true, message: 'Limpando dados gps...', percent: 75 });
            await deleteDB(EnviromentVars.gpsDB);
            await deleteDB(EnviromentVars.errosDB);
            this.props.history.push('/expired');
          } else {
            alerta('Erro ao limpar dados no servidor!', 2)
          }
        } else {
          this.setState({ isOpenModal: true });
          alerta('Não foi possivel realizar autenticação');
        }
      }
    } catch (err) {
      this.setState({
        error: '2.Não foi possível comunicar com o servidor.',
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleUploadLocalData = async () => {
    this.setState({ loading: true });
    let { empresaAtiva, usuarioAtivo } = this.state;
    await uploadLocalData(empresaAtiva, usuarioAtivo);
    this.setState({ loading: false });
  };

  handleDownloadDataCloud = async () => {
    this.setState({ loading: true });
    let { empresaAtiva, usuarioAtivo } = this.state;
    await getDataCloud(empresaAtiva, usuarioAtivo);
    this.setState({ loading: false });
    this.props.history.push('/home');
  };

  synLocalImages = async () => {
    this.setState({ loading: true });
    let imagesList = await getAllImages();
    let { empresaAtiva, usuarioAtivo, empresaCnpj } = this.state;
    await syncImages(empresaAtiva, usuarioAtivo, empresaCnpj, this.onUpdateWaitScreen, true);
    this.setState({ images: [] });
    const output = await this.veryfySyncImages(this.state.images, imagesList);
    this.setState({ loading: false, images: output });
  };

  veryfySyncImages = async (images, imagesList) => {
    let localData = await loadLocalData();
    if (localData?.CLIENTES) {
      for (const cliente of localData.CLIENTES) {
        if (haveData(cliente.pesquisas)) {
          for (const pesquisa of cliente.pesquisas) {
            for (const detalhamento of pesquisa.DETALHAMENTO) {
              if (detalhamento.AGRUPAMENTO !== undefined) {
                for (const agrupamento of detalhamento.AGRUPAMENTO) {
                  for (const item of agrupamento.ITEMS) {
                    for (const pergunta of item.PERGUNTAS) {
                      if (pergunta.GPP_TIPO_CAMPO === 7) {
                        for (const image of imagesList) {
                          if (image.uniqueid === pergunta.RESPOSTA) {
                            let img = {
                              GPC_RESPOSTA_IMAGEM_URL: image.imageData,
                              DESCRICAO: image.fileName,
                              SYNC: pergunta.URL !== null && pergunta.URL !== '',
                            };
                            images.push(img);
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    return images;
  };

  onUpdateWaitScreen = (newPercent, newMessage, addPercent = false) => {
    if (!addPercent) {
      this.setState({ percent: newPercent, message: newMessage });
    } else {
      let { percent } = this.state;
      percent = percent === undefined ? 1 : percent + 1;
      this.setState({ percent, message: newMessage });
    }
  };

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({
      [name]: value,
    });
  };

  handleLoadCustomDataInitial = (value) => {
    let { customSelectedInitial } = this.state;
    customSelectedInitial = value;

    this.setState({
      customSelectedInitial,
    });
    this.handleGetSyncs(true, customSelectedInitial);
  };

  handleGetSyncs = async (update, dateCustom) => {
    let { empresaAtiva, usuarioAtivo, isOpenViewSyncs, dataViewSync } = this.state;
    if (!update) {
      if (isOpenViewSyncs) {
        this.setState({
          isOpenViewSyncs: false,
        });
        return;
      } else if (dataViewSync !== -1) {
        this.setState({
          isOpenViewSyncs: true,
        });
        return;
      }
      this.setState({
        loading: true,
      });
    }
    this.setState({
      loading: true,
    });
    let date = null;
    if (dateCustom) {
      date = format(dateCustom, 'dd/MM/yyyy');
    }
    const res = await getAllSyncs(empresaAtiva, usuarioAtivo, date);

    this.setState({
      loading: false,
      isOpenViewSyncs: true,
      dataViewSync: res,
    });
  };

  render() {
    let {
      images,
      viewImages,
      loading,
      percent,
      message,
      gaaId,
      nomeUsuario,
      qtdeClientes,
      dataAgenda,
      code,
      isOpenModal,
      updateList,
      isOpenViewSyncs,
      dataViewSync,
      customSelectedInitial,
      empresaAtiva,
      usuarioAtivo,
      modalLastSync
    } = this.state;
    return (
      <div
        style={{
          height: '100vhl',
        }}
      >
        <Titulo
          style={{
            justifyContent: 'flex-start',
            paddingLeft: '15px',
            top: '0px',
          }}
        >
          <button
            style={{ cursor: 'pointer', color: 'white' }}
            onClick={() => this.props.history.push('/Home')}
            className="waves-effect waves-light saib-button is-cancel voltar"
          >
            <Icon className="modal-close">arrow_back</Icon>
          </button>
          <p style={{ position: 'unset', top: 'unset', width: '100%' }}>Admin</p>
        </Titulo>
        <WaitScreen loading={loading} percent={percent} message={message} />
        <Container className="startWorkDayContainer">
          <Linha
            style={{
              flexDirection: 'row',
              display: gaaId === undefined ? 'flex' : 'none',
              justifyContent: 'center',
              margin: '0',
              padding: '5px',
            }}
          >
            <h3 style={{ fontWeight: '600', fontSize: '1.8rem', textAlign: 'center' }}>Não existem dados locais</h3>
          </Linha>

          <Linha style={{ flexDirection: 'row', display: gaaId !== undefined ? 'flex' : 'none' }}>
            <DivDetalhe>
              <Labels fontWeight={700}>Cód. agend.</Labels>
              <Labels fontWeight={400}>{gaaId}</Labels>
            </DivDetalhe>
            <DivDetalhe>
              <Labels fontWeight={700}>Dat. agend.</Labels>
              <Labels fontWeight={400}>{dataAgenda}</Labels>
            </DivDetalhe>
            <DivDetalhe>
              <Labels fontWeight={700}>Nome pesquisador</Labels>
              <Labels fontWeight={400}>{nomeUsuario}</Labels>
            </DivDetalhe>
            <DivDetalhe>
              <Labels fontWeight={700}>Agendados</Labels>
              <Labels fontWeight={400}>{qtdeClientes}</Labels>
            </DivDetalhe>
          </Linha>
          <Linha style={{ flexDirection: 'row', display: gaaId !== undefined ? 'flex' : 'none' }}>
            <DivDetalhe>
              <Button
                className="waves-effect waves-light saib-button is-primary"
                onClick={() => this.setState({ isOpenModal: true })}
              >
                <Icon large>delete</Icon>
                Limpar dados locais
              </Button>
            </DivDetalhe>
            <Modal
              className="modal-item-activity"
              actions={[
                <Button
                  modal="close"
                  style={{ marginRight: '5px' }}
                  node="button"
                  waves="green"
                  className="waves-effect waves-light saib-button is-primary saib2"
                  onClick={() => this.cleanLocalData()}
                >
                  Confirmar
                </Button>,
                <Button
                  modal="close"
                  node="button"
                  href="#modal1"
                  waves="green"
                  className="waves-effect waves-light saib-button is-primary"
                  onClick={() => this.setState({ isOpenModal: false })}
                >
                  Cancelar
                </Button>,
              ]}
              bottomSheet={false}
              fixedFooter={false}
              header="Limpar dados locais"
              id="modal1"
              open={isOpenModal}
              options={{
                dismissible: true,
                endingTop: '10%',
                inDuration: 250,
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
              <div>
                <p style={{ marginTop: '50px' }}>
                  Insira abaixo o código para limpeza de dados locais, composto por 6 numeros, um código só pode ser
                  utilizado <strong>UMA</strong> vez. <br />
                  Para prosseguir realize a autenticação
                </p>
                <div>
                  <Linha>
                    <Labels fontWeight={200}>Codigo de autenticação</Labels>
                    <input
                      type="text"
                      name="code"
                      autoComplete="off"
                      className="campoTexto"
                      maxLength={6}
                      value={code}
                      onChange={this.handleInputChange}
                    />
                  </Linha>
                </div>
              </div>
            </Modal>
            <DivDetalhe>
              <Button className="saib-button is-primary" onClick={this.handleDownloadDataCloud}>
                <Icon large>arrow_downward</Icon>
              </Button>
            </DivDetalhe>
            <DivDetalhe>
              <Button className="saib-button is-primary" onClick={this.handleUploadLocalData}>
                <Icon large>arrow_upward</Icon>
              </Button>
            </DivDetalhe>
            <DivDetalhe>
              {!viewImages ? (
                <Button
                  style={{ gap: '4px' }}
                  className="saib-button is-primary"
                  onClick={() => this.setState({ viewImages: true })}
                >
                  <Icon>image</Icon> Visualizar imagens
                </Button>
              ) : (
                <Button
                  style={{ gap: '4px' }}
                  className="saib-button is-primary"
                  onClick={() => this.setState({ viewImages: false })}
                >
                  <Icon>image</Icon> Esconder imagens
                </Button>
              )}
            </DivDetalhe>
          </Linha>
          <Linha>
            <DivDetalhe>
              <Button
                style={{ gap: '4px' }}
                className="saib-button is-primary"
                onClick={() => this.handleGetSyncs(false, null)}
              >
                <Icon>storage</Icon>
                {!isOpenViewSyncs && 'Visualizar dados'}
                {isOpenViewSyncs && 'Minimizar dados'}
              </Button>
            </DivDetalhe>
            <DivDetalhe>
              <Button
                style={{ gap: '4px' }}
                className="saib-button is-primary"
                onClick={() => this.setState({
                  modalLastSync: true
                })}
              >
                <Icon>autorenew</Icon>
                Restaurar último sincronismo
              </Button>
            </DivDetalhe>
          </Linha>
          <div style={{ display: 'flex', width: '100%', marginLeft: '40px', marginTop: '-1rem' }}>
            <DataFilter>
              <div>
                <h5>Data dos dados sincronizados</h5>
                <DatePicker
                  selected={customSelectedInitial}
                  onChange={this.handleLoadCustomDataInitial}
                  selectsStart
                  startDate={customSelectedInitial}
                  locale={ptBR}
                  placeholderText="Data inicial"
                  dateFormat="dd/MM/yyyy"
                  customInput={<CustomCalendarInput />}
                />
              </div>
            </DataFilter>
          </div>

          {images !== undefined && viewImages && (
            <div key={updateList}>
              <PhotosList
                withNavigation
                withBoxShadow
                heightFixed
                photosList={images}
                userName={'Imagens'}
                dataSheduleSelected={''}
                forceLoading={false}
              />
              <Linha>
                <DivDetalhe>
                  <Button className="saib-button is-primary" onClick={this.synLocalImages}>
                    <Icon>send</Icon> Reenviar imagens
                  </Button>
                </DivDetalhe>
              </Linha>
            </div>
          )}
          <Linha style={{ flexDirection: 'row', display: 'flex', width: '100%' }}>
            {isOpenViewSyncs && <ViewSyncs data={dataViewSync} date={format(customSelectedInitial, 'dd/MM/yyyy')} />}
          </Linha>

          {modalLastSync && <LastSync empresaAtiva={empresaAtiva} usuarioAtivo={usuarioAtivo} dateCustom={format(customSelectedInitial, 'dd/MM/yyyy')}  />}
        </Container>
      </div>
    );
  }
}

export default withRouter(TradeAdmin);
