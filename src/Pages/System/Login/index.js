import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import {
  Container,
  LateralEsquerda,
  LateralDireita,
  Form,
  SubmitButton,
  DivSelect,
  LoginForm,
  LogoRodape,
  LogoLogin,
} from './styles';
import Select from 'react-select';
import saibweb from '../../../assets/images/saibweb.png';
import logo from '../../../assets/images/saibGeoLogoLogin.png';
import { FaSpinner, FaKey } from 'react-icons/fa';
import api from '../../../services/api';
import { saveMenuToStorage, login } from '../../../services/auth';
import { alerta, diffInSeconds, getScheduleData, haveData, updateScheduleData } from '../../../services/funcoes';
import { version } from '../../../../package.json';
import { setGps } from '../../../services/databaseLocal';
import {
  checkAlert,
  handleButtonRefreshRelease,
  syncLocalData,
  syncLocationData,
} from '../../Trade/Home/tradeGlobalFunctions';
import { EnviromentVars } from '../../../config/env';
import TradeLocation from '../../../Components/FieldWork/TradeLocation';
import { format } from 'date-fns';

export const colourStyles = {
  control: (styles) => ({ ...styles, backgroundColor: 'white' }),
  option: (styles, { isDisabled, isFocused, isSelected }) => {
    const color = '#e8d9ee';
    const selected = '#bb8ecd';
    return {
      ...styles,
      backgroundColor: isDisabled ? undefined : isSelected ? selected : isFocused ? color : undefined,
      color: isDisabled ? '#000' : isSelected,
      cursor: isDisabled ? 'not-allowed' : 'default',
      zIndex: '999',
      ':active': {
        ...styles[':active'],
        backgroundColor: !isDisabled ? (isSelected ? selected : color) : undefined,
      },
    };
  },
  input: (styles) => ({ ...styles }),
  placeholder: (styles) => ({ ...styles }),
};

class Login extends Component {
  state = {
    error: '',
    email: '',
    senha: '',
    loading: false,
    mostrarEmpresas: 'false',
    empresaSelecionada: '',
    empresas: [],
    faseLogin: 1,
    nomeUsuario: '',
    sessao: undefined,
    isMobile: false,
    scheduleData: undefined,
    customer: undefined,
    lastUpdate: 0,
  };

  async componentDidMount() {
    this.useWindowSize();

    const scheduleData = await getScheduleData();
    let customer;

    await this.verifySearchs();

    if (scheduleData) {
      try {
        customer = scheduleData.CLIENTES.find((cli) => cli.status === 1);

        this.setState({
          customer,
          scheduleData,
        });
      } catch (error) {
        console.error('Failed to decode or parse scheduleData:', error);
      }
    }
  }

  verifySearchs = async () => {
    const scheduleData = await getScheduleData();

    let customer;
    if (scheduleData) {
      try {
        this.setState({ loading: true });
        customer = scheduleData.CLIENTES.find((cli) => cli.status === 1);

        const endWork = this.handleWorkScheduleVerify(scheduleData);
        if (scheduleData?.emAtendimento) {
          try {
            if (scheduleData?.GAA_DTA_AGENDA !== format(new Date(), 'dd/MM/yyyy')) {
              return this.props.history.push({
                pathname: '/home',
              });
            }

            if (endWork && customer) {
              return this.props.history.push({
                pathname: '/ServiceSearchs',
                state: {
                  userHours: scheduleData?.HORARIOS_TRABALHO || undefined,
                  cliente: customer,
                  forceCommit: false,
                  pesquisas: customer?.pesquisas || scheduleData?.PESQUISAS,
                },
              });
            }
          } catch (error) {
            console.error(error);
          }
        }

        if (scheduleData && !scheduleData?.sucessStarted) {
          return this.props.history.push({
            pathname: '/home',
          });
        }

        if (endWork && customer) {
          alerta('O horário de expediente chegou ao fim!');
          return this.props.history.push({
            pathname: '/ServiceSearchs',
            state: {
              userHours: scheduleData?.HORARIOS_TRABALHO || undefined,
              cliente: customer,
              forceCommit: false,
              pesquisas: customer?.pesquisas === undefined ? scheduleData?.PESQUISAS : customer.pesquisas,
            },
          });
        }
        if (scheduleData && scheduleData?.GAA_DTA_AGENDA !== format(new Date(), 'dd/MM/yyyy')) {
          return this.props.history.push({
            pathname: '/home',
          });
        }
        if (!customer) {
          return this.props.history.push({
            pathname: '/StartWorkDay',
            state: { scheduleData, action: 'editar' },
          });
        }
        return this.props.history.push({
          pathname: '/ServiceSearchs',
          state: {
            userHours: scheduleData?.HORARIOS_TRABALHO || undefined,
            cliente: customer,
            forceCommit: false,
            pesquisas: customer?.pesquisas === undefined ? scheduleData?.PESQUISAS : customer.pesquisas,
          },
        });
      } catch (error) {
        console.error(error);
      } finally {
        this.setState({ loading: false });
      }
    }
  };

  handleWorkScheduleVerify = (scheduleData) => {
    try {
      const inProgress = scheduleData.CLIENTES.find((element) => element.status === 1);
      if (scheduleData && scheduleData.HORARIOS_TRABALHO && Object.keys(scheduleData.HORARIOS_TRABALHO).length !== 0) {
        const final = new Date();
        if (scheduleData.HORARIOS_TRABALHO?.FIM_JORNADA !== null) {
          const hoursEnd = scheduleData.HORARIOS_TRABALHO?.FIM_JORNADA?.split(':', 3);
          final.setHours(hoursEnd[0], hoursEnd[1], hoursEnd[2]);
        }
        const resultFinal = diffInSeconds(new Date(), final);
        if (resultFinal <= 0 && inProgress) {
          return true;
        } else {
          return false;
        }
      }
    } catch (error) {
      return false;
    }
  };

  setIsMobile = async (isMobile) => {
    this.setState({ ...this.state, isMobile });
  };

  verifyIsMobie = () => {
    const [width, height] = this.state.size;

    if (width <= 768 && height <= 1024) {
      return true;
    } else {
      return false;
    }
  };

  async componentDidUpdate(prevProps, prevState) {
    if (this.state.size !== prevState.size) {
      const isMobile = this.verifyIsMobie();
      await this.setIsMobile(isMobile);
      this.setState({
        isMobile,
      });
    }
  }

  useWindowSize = () => {
    const { size } = this.state;
    const updateSize = () => {
      this.setState({
        size: [window.outerWidth, window.outerHeight],
      });
    };
    // window.addEventListener('resize', updateSize);
    updateSize();

    return size;
  };

  encontrarEmpresa = async (empresaId) => {
    const { empresas } = this.state;
    return empresas.find((empresa) => (empresa.EMP_ID = empresaId));
  };

  limparVariaveis = async (e) => {
    this.stopTimer();
    this.setState({
      email: '',
      senha: '',
      loading: false,
      mostrarEmpresas: 'false',
      empresaSelecionada: '',
      empresas: [],
      sessao: undefined,
    });
    this.setValueIHTmlElement('email', '');
    this.setValueIHTmlElement('senha', '');
    this.setValueIHTmlElement('empresa', '-1');
    this.setValueIHTmlElement('frotas', '-2');
  };

  setValueIHTmlElement(htmlElementId, valor) {
    const elemento = document.getElementById(htmlElementId);
    if (elemento !== undefined && elemento != null) {
      elemento.value = valor;
    }
  }

  validateSubmit = async () => {
    const { email, senha, empresaSelecionada, mostrarEmpresas } = this.state;
    let erros = '';
    if (!email) {
      erros += 'E-mail não pode ser vazio!';
    }

    if (!senha) {
      erros += 'Senha não pode ser vazia!';
    }

    if (!empresaSelecionada || empresaSelecionada === '-1' || !mostrarEmpresas) {
      erros += 'Selecione uma empresa antes de logar.';
    }

    this.setState({ error: erros });
    return erros !== '';
  };

  stopTimer = () => {
    const { interval } = this.state;
    if (interval !== undefined) {
      clearInterval(interval);
      this.setState({ interval: undefined });
    }
  };

  handleValidateUser = async () => {
    // e.preventDefault();

    this.stopTimer();
    const { email, senha, empresaSelecionada } = this.state;
    let erros = await this.validateSubmit();
    if (erros) {
      return false;
    }

    this.setState({ loading: true });

    try {
      const retorno = await api.post('/v1/accounts/authenticate', {
        usrEmail: email,
        usrSenha: senha,
        empId: empresaSelecionada,
      });

      const _data = retorno.data;
      this.setState({ loading: false });
      // não conseguiu comunicar com o servidor //
      if (!_data || _data.length <= 0) {
        if (!_data.sucess)
          this.setState({
            error: '1.Não foi possível comunicar com o servidor',
          });
      } else {
        // conseguiu comunicar com o servidor //
        if (_data.sucess) {
          const dataLogin = _data.data;
          const sessao = {
            codigoUsuario: dataLogin.usrId,
            email: dataLogin.usrEmail,
            nomeUsuario: dataLogin.usrNome,
            codigoEmpresa: dataLogin.empCodigo,
            empresaId: dataLogin.empId,
            empresaCnpj: dataLogin.empCnpj,
            empresaRazaoSocial: dataLogin.empRazaoSocial,
            empresaNomeFantasia: dataLogin.empFantasia,
            empresaSaibWeb: dataLogin.empDestinoSaibWeb,
            token: dataLogin.token,
            menus: dataLogin.menus,
            frotas: dataLogin.frotas,
            gmovel: dataLogin.gmovel,
            gmovelTrade: dataLogin.gmovelTrade,
            gmovelPromotor: dataLogin.gmovelPromotor,
            gmovelSupervisor: dataLogin.gmovelSupervisor,
            isAdmin: dataLogin.isAdmin,
            flagAdministrativo: dataLogin.flagAdministrativo,
            gupFlagAgenda: dataLogin.permissao.GUP_FLG_AGENDA,
            gmovelHodometro: dataLogin.gmovelHodometro,
            gmovelGerente: dataLogin.gmovelGerente,
          };

          this.setState({ sessao });
          return true;
        } else {
          let interval = setInterval(() => {
            this.limparVariaveis();
          }, 2000);
          this.setState({
            error: retorno.data.message,
            interval,
          });
          return false;
        }
      }
    } catch (err) {
      // //console.log(err);
      this.setState({
        error: '2.Não foi possível comunicar com o servidor.',
      });
    }
    this.setState({ loading: false });
    return false;
  };

  carregarMenusModulo = async (empresaId) => {
    const retorno = await api.get('/v1/menus/' + empresaId);
    // console.log(retorno);
    if (!retorno) {
      this.setState({ menus: [] });
    } else {
      if (retorno.data && retorno.data.sucess) {
        saveMenuToStorage(retorno.data.data);
      }
    }
  };

  handleUsuarioChange = (e) => {
    var email = e.target.value;
    this.setState({
      email: email !== '' ? email.toLowerCase() : '',
      mostrarEmpresas: 'false',
      empresaSelecionada: '',
      sessao: undefined,
    });
  };

  saudacaoLogin = () => {
    const faseLogin = this.state?.faseLogin;
    const nomeUsuario = this.state?.nomeUsuario;
    var stamp = new Date();
    var hours;
    var time;

    hours = stamp.getHours();
    var saudacao = '';
    if (hours >= 0 && hours <= 11) {
      time = 'Bom dia';
    }
    if (hours >= 12 && hours <= 17) {
      time = 'Boa tarde';
    }
    if (hours >= 18 && hours <= 23) {
      time = 'Boa noite';
    }

    if (faseLogin === 1) {
      saudacao = time + '!';
    }
    if (faseLogin === 2) {
      saudacao = (
        <>
          <strong>
            {time} {nomeUsuario ? nomeUsuario : ''}
          </strong>
          , tudo bem?{' '}
        </>
      );
    }
    return saudacao;
  };

  handleSenhaChange = (e) => {
    this.setState({
      error: '',
      senha: e.target.value,
      empresaSelecionada: '',
      sessao: undefined,
    });
  };

  carregarEmpresas = async (e) => {
    e.preventDefault();
    this.setState({ loading: true });
    const { email } = this.state;

    if (!email) {
      this.setState({ error: 'Preencha o e-mail para continuar' });
    } else {
      try {
        const retorno = await api.post('/v1/accounts/empresas', {
          usrEmail: email,
        });

        if (!retorno) {
          this.setState({ error: retorno.data.data.error });
          //this.props.history.push('/');
        } else {
          const _data = retorno.data.data;
          if (!_data || _data.length <= 0) {
            this.setState({
              error: 'E-mail não cadastrado/sem permissão para acesso.',
              mostrarEmpresas: 'false',
              ultimopesquisado: '',
              empresas: [],
            });
          } else {
            const empresas = _data.map((item) => {
              return {
                value: item.EMP_ID,
                label: item.EMP_NOME,
              };
            });

            this.setState({
              error: '',
              ultimopesquisado: '',
              empresas,
              mostrarEmpresas: 'true',
              nomeUsuario: retorno.data.data[0].USR_NOME,
              faseLogin: 2,
            });
          }
          ////console.log(retorno.data.data);
        }
      } catch (err) {
        this.setState({
          error: 'E-mail não cadastrado/sem permissão para acesso.',
        });
      }
    }
    this.setState({ loading: false });
  };

  handleSelectedCompany = async (event) => {
    let { empresaSelecionada } = this.state;
    empresaSelecionada = event ? event.value : undefined;

    if (empresaSelecionada !== -1) {
      let interval = setInterval(() => {
        this.handleValidateUser();
      }, 100);
      this.setState({ interval });
    }

    this.setState({ empresaSelecionada, error: '' });
  };

  handleStardWorkCustomer = async (cliente, boolSync) => {
    let { intervalWaitLocation } = this.state;
    this.setState({ loading: true });
    this.getActualPosition();
    intervalWaitLocation = setInterval(async () => {
      const { latitude, longitude } = this.state;
      if (latitude && longitude) {
        clearInterval(intervalWaitLocation);
        this.setState({ loading: false });
        await this.handleStartWork(cliente, boolSync);
      }
    }, 1000);
    this.setState({ intervalWaitLocation });
  };

  handleWorkSchedule = async (scheduleData) => {
    try {
      const inProgress = scheduleData.CLIENTES.find((element) => element.status === 1);
      if (scheduleData && scheduleData.HORARIOS_TRABALHO && Object.keys(scheduleData.HORARIOS_TRABALHO).length !== 0) {
        const final = new Date();
        if (scheduleData.HORARIOS_TRABALHO?.FIM_JORNADA !== null) {
          const hoursEnd = scheduleData.HORARIOS_TRABALHO?.FIM_JORNADA?.split(':', 3);
          final.setHours(hoursEnd[0], hoursEnd[1], hoursEnd[2]);
        }
        const resultFinal = diffInSeconds(new Date(), final);
        if (resultFinal <= 0 && inProgress) {
          return true;
        } else {
          return false;
        }
      }
    } catch (error) {
      return false;
    }
  };

  handleStartWork = async (cliente, boolSync) => {
    let { scheduleData, latitude, longitude, empresaAtiva, usuarioAtivo, intervalRaio, customer } = this.state;
    let scheduleDataBefore = undefined;

    if (scheduleData) {
      const endWork = await this.handleWorkSchedule(scheduleData);
      if (scheduleData?.GAA_DTA_AGENDA !== format(new Date(), 'dd/MM/yyyy')) {
        return this.props.history.push('/home');
      }
      if (endWork) {
        if (boolSync) {
          scheduleDataBefore = await getScheduleData();
        }
        for (const cli of scheduleData?.CLIENTES) {
          if (cli.CLI_ID === cliente.CLI_ID) {
            const skipValidationPromoterLocalization = scheduleData?.HORARIOS_TRABALHO?.RAIO_ATENDIMENTO <= 0;

            const res = skipValidationPromoterLocalization
              ? false
              : await checkAlert(cli, scheduleData, empresaAtiva, usuarioAtivo, latitude, longitude);

            if (!res) {
              let item = {
                descricao: null,
                galId: null,
                liberado: true,
                lido: null,
              };
              cli.alert = item;
              cli.galId = false;
              clearInterval(intervalRaio);
            } else {
              let alert = [];
              for (let element of res) {
                let item = {};
                item.descricao = element.GTI_DESCRICAO;
                item.galId = element.GAL_ID;
                item.liberado = element.GTI_FLG_IMPEDE_ATD === 1 ? false : true;
                item.lido = element.GAL_FLG_STATUS === 1 ? true : false;
                alert.push(item);
              }

              cli.alert = alert;
              cli.galId = alert.find((item) => item.liberado === false).galId;
              await updateScheduleData(scheduleData);
              this.setState({ scheduleData });

              let response = null;
              clearInterval(intervalRaio);

              intervalRaio = setInterval(async () => {
                response = await handleButtonRefreshRelease(
                  cli,
                  this.state.empresaAtiva,
                  this.state.usuarioAtivo,
                  scheduleData,
                  0
                );

                await this.handleStopBlock(response);
              }, EnviromentVars.verifyAlert);

              this.setState({ intervalRaio });

              return;
            }

            if (!haveData(cli.checkIn)) {
              cli.checkIn = [];
            }
            if (cli.status === 0 || cli.status === undefined || cli.status === 2) {
              let checkIn = {};
              checkIn.start = new Date();
              checkIn.status = 1;
              checkIn.latitudeCheckIn = latitude;
              checkIn.longitudeCheckIn = longitude;
              cli.checkIn.push(checkIn);
              cli.status = 1;
              cli.lastCheckIn = checkIn.start;
              cli.lastCheckout = undefined;
            }
            // 0 - não foi feito atendimento
            // 1 - em atendimento
            // 2 - finalizado
          }
        }
        scheduleData.emAtendimento = true;
        scheduleData.cliAtendimento = cliente.CLI_ID;
        scheduleData.status = 2;
        await updateScheduleData(scheduleData);
        this.setState({ scheduleData });

        if (boolSync) {
          this.setState({ loading: true, percent: 0, message: undefined });
          let { empresaAtiva, usuarioAtivo, empresaCnpj } = this.state;
          let retornoSync = await syncLocalData(
            false,
            empresaAtiva,
            usuarioAtivo,
            empresaCnpj,
            false,
            this.onUpdateWaitScreen
          );
          if (!retornoSync) {
            await updateScheduleData(scheduleDataBefore);
            this.setState({ scheduleData: scheduleDataBefore });
            alerta(
              'Não foi possível iniciar o atendimento.\nVerifique sua conexão com a internet e se seu GPS está ativo.',
              2
            );
            this.setState({ loading: false });
            return;
          }
          this.setState({ loading: false });
        }
        clearInterval(intervalRaio);
        return this.props.history.push({
          pathname: '/ServiceSearchs',
          state: {
            userHours: scheduleData?.HORARIOS_TRABALHO || undefined,
            cliente: customer,
            forceCommit: false,
            pesquisas: customer.pesquisas === undefined ? scheduleData?.PESQUISAS : customer.pesquisas,
          },
        });
      } else {
        if (scheduleData?.sucessStarted && !scheduleData?.emAtendimento) {
          return this.props.history.push('/StartWorkDay', { state: { scheduleData, action: 'editar' } });
        }
        if (!scheduleData?.CLIENTES.find((element) => element.status === 1) || !scheduleData?.sucessStarted) {
          return this.props.history.push('/home');
        }
        alerta('O horário de expediente chegou ao fim!');
        return this.props.history.push('/StartWorkDay', { state: { scheduleData, action: 'editar' } });
      }
    }
  };

  handleSubmitForm = async (e) => {
    e.preventDefault();
    let { sessao, empresaSelecionada, customer } = this.state;
    if (sessao === undefined || empresaSelecionada === -1) {
      this.setState({ error: 'Selecione uma empresa antes.' });
      return;
    }
    let scheduleData = await getScheduleData();
    if (login(sessao)) {
      localStorage.removeItem('reportVariables');
      if (scheduleData) {
        this.handleStardWorkCustomer(customer, false);
      } else {
        this.props.history.push('/home');
      }

      return true;
    } else {
      alerta('Verifique os cookies do seu navegador, sem ele não poderemos continuar.', 2);
    }
  };

  onPermissoes = () => {
    navigator.permissions.query({ name: 'camera' }).then(function (result) {
      if (result.state === 'granted') {
        //alert('Já possui permissão camera!!');
      } else if (result.state === 'prompt') {
        const specs = { video: { facingMode: 'environment' } };
        navigator.mediaDevices
          .getUserMedia(specs)
          .then(() => {
            // alert('Permissão camera já concedida!')
          })
          .catch((err) => {
            alert(`Camera ERROR(${err.code}): ${err.message} ${String.fromCharCode(13)}${String.fromCharCode(13)}
            Redefina as permissões nas configurações do sistema operacional e tente novamente.`);
          });
      } else if (result.state === 'denied') {
        alert(`Sem permissão para uso da Camera!${String.fromCharCode(13)}${String.fromCharCode(13)}
        Redefina as permissões nas configurações do sistema operacional e tente novamente.`);
      }
    });

    navigator.permissions.query({ name: 'geolocation' }).then(function (result) {
      if (result.state === 'granted') {
        //alert('Já possui permissão de localização!!');
      } else if (result.state === 'prompt') {
        const options = {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        };

        function success() {
          // alert('Permissão localização concedida!')
        }

        function error(err) {
          alert(`Localização ERROR(${err.code}): ${err.message} ${String.fromCharCode(13)}${String.fromCharCode(13)}
          Redefina as permissões nas configurações do sistema operacional e tente novamente.`);
        }

        navigator.geolocation.getCurrentPosition(success, error, options);
      } else if (result.state === 'denied') {
        alert(`Sem permissão para Localização!${String.fromCharCode(13)}${String.fromCharCode(13)}
        Redefina as permissões nas configurações do sistema operacional e tente novamente.`);
      }
    });

    navigator.permissions.query({ name: 'push', userVisibleOnly: 'true' }).then(function (result) {
      if (result.state === 'granted') {
        //alert('Já possui permissão de notificação!!');
      } else if (result.state === 'prompt') {
        Notification.requestPermission(function (result) {
          if (result === 'denied') {
            alert(`Sem permissão para Notificações!${String.fromCharCode(13)}${String.fromCharCode(13)}
            Redefina as permissões nas configurações do sistema operacional e tente novamente.`);
            return;
          } else if (result === 'default') {
            alert(`Sem permissão para Notificações!${String.fromCharCode(13)}${String.fromCharCode(13)}
            Redefina as permissões nas configurações do sistema operacional e tente novamente.`);
            return;
          }
          // alert('Permissão noticação já concedida!');
        });
      } else if (result.state === 'denied') {
        alert(`Sem permissão para Notificações!${String.fromCharCode(13)}${String.fromCharCode(13)}
        Redefina as permissões nas configurações do sistema operacional e tente novamente.`);
      }
    });
  };

  onUpdateCoord = (gpsAvailable, gpsEnabled, coords) => {
    let { empresaAtiva, usuarioAtivo } = this.state;
    syncLocationData(empresaAtiva, usuarioAtivo, coords.latitude, coords.longitude);
    this.setState({ latitude: coords.latitude, longitude: coords.longitude });
    setGps(coords.latitude, coords.longitude);
  };

  getActualPosition = async () => {
    let { lastUpdate } = this.state;
    this.setState({ lastUpdate: lastUpdate + 1 });
  };

  render() {
    const { error, mostrarEmpresas, empresas, loading, isMobile, lastUpdate } = this.state;

    return (
      <Container>
        <TradeLocation onUpdateCoord={this.onUpdateCoord} lastUpdate={lastUpdate} />
        <LateralEsquerda>
          <img
            src={logo}
            alt="Logo SaibDirect"
            // height={105}
            width={'70%'}
          />
          {!isMobile && <h5> {this.saudacaoLogin()} </h5>}
        </LateralEsquerda>
        <LateralDireita>
          <LoginForm>
            <LogoLogin alt="Logo SaibWeb" logoApp={logo} logoSaib={saibweb}></LogoLogin>
            <Form onSubmit={this.handleSubmitForm}>
              <input
                id="email"
                type="email"
                placeholder="E-mail"
                onChange={this.handleUsuarioChange}
                autoComplete="off"
                onBlur={this.carregarEmpresas}
                style={{
                  textTransform: 'lowercase',
                }}
              />
              <input
                id="senha"
                senha="email"
                type="password"
                placeholder="Senha"
                onChange={this.handleSenhaChange}
                autoComplete="off"
              />

              {mostrarEmpresas === 'true' && (
                <DivSelect>
                  <Select
                    placeholder="Selecione a empresa"
                    onChange={this.handleSelectedCompany}
                    options={empresas}
                    styles={colourStyles}
                    theme={(theme) => ({
                      ...theme,
                      colors: {
                        ...theme.colors,
                        primary: '#8e44ad',
                      },
                    })}
                  />
                </DivSelect>
              )}

              <SubmitButton
                loading={loading.toString()}
                className="saib-button is-primary"
                style={{ height: '45px', marginTop: '10px', width: '100%' }}
              >
                {loading ? <FaSpinner color="#fff" size={14} /> : <FaKey color="#FFF" size={14} />}
                <span>Login</span>
              </SubmitButton>
              {this.state.error && <p error={error}>{this.state.error}</p>}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  width: '100%',
                  marginTop: '10px',
                }}
              >
                <LogoRodape alt="Logo SaibWeb" logoApp={logo} logoSaib={saibweb}></LogoRodape>
              </div>
              {/* <button onClick={() => this.onPermissoes()}>Verificar Permissões</button> */}
            </Form>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', width: '100%' }}>
              <span style={{ fontSize: '0.8rem', color: '#4d4d4d' }} onClick={() => this.onPermissoes()}>
                {version}
              </span>
            </div>
          </LoginForm>
        </LateralDireita>
      </Container>
    );
  }
}
export default withRouter(Login);
// export default connect()(Login);
