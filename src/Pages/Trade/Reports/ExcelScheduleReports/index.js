import React, { Component, forwardRef } from 'react';
import { Icon, CollapsibleItem, Collapsible } from 'react-materialize';
import DirectTituloJanela from '../../../../Components/Globals/DirectTituloJanela';
import SaibRadioGroup from '../../../../Components/Globals/SaibRadioGroup';
import WaitScreen from '../../../../Components/Globals/WaitScreen';
import Header from '../../../../Components/System/Header';
import { Container, Linha, DivDetalhe, Labels, ContentDate } from './styled';
import { alerta, dateFormat, formatDateTimeToBr } from '../../../../services/funcoes';
import api from '../../../../services/api';
import { getFromStorage } from '../../../../services/auth';
import { withRouter } from 'react-router-dom';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import { ptBR } from 'date-fns/locale';
import moment from 'moment';
import * as Yup from 'yup';

const customStyles = {
  dropdownIndicator: (provided) => ({
    ...provided,
    svg: {
      fill: 'your-color',
    },
  }),
  multiValue: (base, state) => ({
    ...base,
    backgroundColor: '#bf1f7c', // Cor de fundo desejada
    color: '#fff',
    borderRadius: '4px', // Raio de borda
    alignItems: 'center',
  }),
  multiValueLabel: (base, state) => ({
    ...base,
    color: '#fff', // Cor do texto para itens selecionados
  }),
};

class ExcelScheduleReports extends Component {
  state = {
    dateInitial: new Date(),
    dateFinal: new Date(),
    loading: false,
    searchs: [],
    professionalType: '',
    selectedUsers: [],
    baseUsersData: [],
    reportData: '',
    errors: {},
    customSelectedInitial: 0,
    customSelectedEnd: 0,
    renderReportButton: false,
  };

  handleValidationUnicField = (nameField, errorPage) => {
    this.schema
      .validate(this.state, { abortEarly: false })
      .then((res, data) =>
        this.setState({
          [errorPage]: {},
        })
      )
      .catch((err) => {
        const errors_ = this.getValidationErrors(err);
        for (var error in errors_) {
          if (error !== nameField) {
            delete errors_[error];
          }
          if (errors_[error] === undefined) {
            delete errors_[error];
          }
        }

        this.setState(
          (prevState) => ({
            [errorPage]: {
              ...prevState[errorPage],
              [nameField]: errors_[[nameField]], //[]é para acessar o nome da propriedade do valor, [[]] é para acessar a o valor da propriedade
            },
          }),
          () => {
            if (this.state[errorPage][nameField] === undefined) {
              const errorsAux = this.state[errorPage];
              delete errorsAux[nameField];
              this.setState({
                [errorPage]: errorsAux,
              });
            }
          }
        );
      });
  };

  verifyDateIsLessThanDateInitial = (date) => {
    const { dateInitial } = this.state;

    let date_ = moment(dateFormat(date, 'DD/MM/yyyy'), 'DD.MM.YYYY');

    let dateInit = moment(dateFormat(dateInitial, 'DD/MM/yyyy'), 'DD.MM.YYYY');

    return date_.isBefore(dateInit);
  };

  handleLoadCustomDataEnd = async (customSelectedEnd) => {
    customSelectedEnd = moment(customSelectedEnd).set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    })._d;
    this.setState({ loading: true });
    const dateFinalIsLessThanDateInitial = this.verifyDateIsLessThanDateInitial(customSelectedEnd);
    if (!dateFinalIsLessThanDateInitial) {
      this.setState({
        dateFinal: customSelectedEnd,
      });
    } else {
      alerta('Data menor que a data inicial, verifique', 0);
    }
    this.setState({ loading: false, clientesSelecionadosDel: [] });
  };

  handleLoadCustomDataInitial = async (customSelectedInitial) => {
    const { today } = this.state;
    if (customSelectedInitial < today) {
      alerta('Data menor que a data atual, verifique');
    } else {
      customSelectedInitial = moment(customSelectedInitial).set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      })._d;
      this.setState({ loading: true });
      this.setState({
        dateInitial: customSelectedInitial,
      });
      this.setState({ loading: false, clientesSelecionadosDel: [] });
    }
  };

  setDatesSelected = () => {
    let { dateInitial, dateFinal } = this.state;

    let startDate_ = moment(dateInitial, 'DD/MM/YYYY')._d;
    let endDate_ = moment(dateFinal, 'DD/MM/YYYY')._d;

    if (startDate_ && endDate_) {
      let dateInterval = [];
      dateInterval.push(moment(startDate_, 'DD/MM/YYYY')._d);

      while (startDate_ < endDate_) {
        startDate_.setDate(startDate_.getDate() + 1);
        dateInterval.push(moment(startDate_, 'DD/MM/YYYY')._d);
      }

      let dates = [];
      dateInterval.forEach((dateInterval_) => {
        let date = {};
        date.idClientsSelecteds = [];
        date.label = dateFormat(dateInterval_);
        dates.push(date);
      });

      if (dates.length === 0) {
        alerta('Data(s) invalidas para agendamento, verifique');
      }
      this.setState({
        allDatesSelected: dates,
        datesSelected: dates,
        // clientesSelecionados: [],
      });
    }
  };

  initCustomDatesDel = () => {
    const endOfWeek = moment();
    const startOfWeek = moment();
    let dateInitial = startOfWeek.toDate();
    let dateFinal = endOfWeek.toDate();
    dateInitial = moment(dateInitial).set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    })._d;
    dateFinal = moment(dateFinal).set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    })._d;

    this.setState(
      {
        dateInitial,
        dateFinal,
      },
      () => this.setDatesSelected()
    );
  };

  refSelectUser = React.createRef(null);

  handleChangeUsers = (selectedUsers) => {
    this.setState({ selectedUsers });
  };

  onChangeDateInitial = async (date) => {
    this.setState({
      dateInitial: date,
    });
  };

  onChangeDateFinal = async (date) => {
    this.setState({
      dateFinal: date,
    });
  };

  getReports = async () => {
    const { dateFinal, dateInitial, selectedUsers } = this.state;
    if (selectedUsers.length === 0) {
      return alerta('Selecione algum usuário antes de prosseguir');
    }
    try {
      this.setState({
        loading: true,
      });
      const reqBody = {
        dataPesquisaInicial: formatDateTimeToBr(dateInitial, 'DD/MM/YYYY'),
        dataPesquisaFinal: formatDateTimeToBr(dateFinal, 'DD/MM/YYYY'),
        usuariosAgenda: selectedUsers.map((user) => user.value),
      };
      const reportData = await api.post(
        `v1/tradereport/excelexport/schedule/${this.state.empresaAtiva}/${this.state.usuarioAtivo}`,
        reqBody
      );
      this.setState({ reportData: reportData.data.data.urlPath, renderReportButton: true });
      alerta('Relatório disponivel para download!', 1);
    } catch (error) {
      alerta("Erro ao gerar relatório");
    } finally {
      this.setState({
        loading: false,
      });
    }
  };

  async componentDidMount() {
    this.setState({
      loading: true,
    });
    await this.carregarVariaveisEstado();
    const allUsers = await api.get(`v1/users/${this.state.empresaAtiva}`);
    const filteredData = allUsers.data.data.filter((user) => user.USR_GMOVEL_TRADE === 'V');
    this.setState({ usersData: filteredData, baseUsersData: filteredData, loading: false });
  }

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
      empresaCnpj: sessao.empresaCnpj,
      nomeUsuario: sessao.nomeUsuario,
      gupFlagAgenda: sessao.gupFlagAgenda
    });
  };

  updateUsersList = async () => {
    const { professionalType, baseUsersData, usuarioAtivo, gupFlagAgenda } = this.state;
    if (professionalType === '0') {
      this.setState({ usersData: baseUsersData });
    }
    if (professionalType === '1') {
      const filteredData = baseUsersData.filter(
        (user) => user.USR_GMOVEL_SUPERVISOR === 'V' && user.USR_GMOVEL_TRADE === 'V'
      );
      this.setState({ usersData: filteredData });
    }
    if (professionalType === '2') {
      let filteredData = baseUsersData.filter(
        (user) => user.USR_GMOVEL_PROMOTOR === 'V' && user.USR_GMOVEL_TRADE === 'V'
      );
      filteredData = gupFlagAgenda === 1 ? filteredData.filter((prom) => prom.USR_ID === usuarioAtivo) : filteredData;
      this.setState({ usersData: filteredData });
    }
  };

  schema = Yup.object().shape({
    dateInitial: Yup.date()
      .max(Yup.ref('endDate'), ({ min }) => 'Data inicial não pode ser maior que a data final')
      .required(),

    dateFinal: Yup.date().required('Campo obrigatório'),
  });

  getValidationErrors = (err) => {
    const validationErrors = {};

    err.inner?.length > 0 &&
      err.inner.forEach((error) => {
        if (error.path) {
          validationErrors[error.path] = error.message;
        }
      });

    return validationErrors;
  };

  render() {
    const {
      loading,
      dateInitial,
      dateFinal,
      usersData,
      reportData,
      errors,
      customSelectedInitial,
      customSelectedEnd,
      renderReportButton,
    } = this.state;

    // const { setStateFilterTypeReport } = this.context;
    return (
      <div>
        <Header />
        <WaitScreen loading={loading} />
        <Container>
          <DirectTituloJanela
            urlVoltar={'/home'}
            // urlNovo={'/search'}
            titulo={
              loading ? (
                'Aguarde...'
              ) : (
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <Icon>description</Icon>Relatório base de atendimentos (Excel)
                </span>
              )
            }
          />
          <>
            <Linha className="filter">
              <Collapsible
                accordion
                style={{
                  width: '100%',
                  borderStyle: 'none',
                  boxShadow: 'none',
                }}
              >
                <CollapsibleItem expanded header="Clique para filtrar" icon={<Icon>filter_list</Icon>} node="div">
                  <>
                    <Linha className="topLine" style={{ width: '100%', justifyContent: 'space-around' }}>
                      <div style={{ width: '350px' }}>
                        <ContentDate style={{ justifyContent: 'space-around' }}>
                          <Labels className="labelPeriodDate">Periodo</Labels>
                          <div style={{ alignSelf: 'flex-start' }}>
                            <Linha>
                              <DatePicker
                                selected={dateInitial}
                                onChange={async (date) => {
                                  await this.handleLoadCustomDataInitial(date);
                                  this.setDatesSelected();
                                  this.handleValidationUnicField('startDate', 'errors');
                                }}
                                locale={ptBR}
                                placeholderText="Data inicial"
                                dateFormat="dd/MM/yyyy"
                                selectsStart
                                customInput={<CustomCalendarInput />}
                              />
                              <DatePicker
                                selected={dateFinal}
                                onChange={async (date) => {
                                  await this.handleLoadCustomDataEnd(date);
                                  this.setDatesSelected();
                                  this.handleValidationUnicField('endDate', 'errors');
                                  this.handleValidationUnicField('startDate', 'errors');
                                }}
                                selectsEnd
                                startDate={customSelectedEnd}
                                endDate={customSelectedEnd}
                                minDate={customSelectedInitial}
                                locale={ptBR}
                                placeholderText="Data final"
                                dateFormat="dd/MM/yyyy"
                                customInput={<CustomCalendarInput />}
                              />
                            </Linha>
                            {errors && errors?.endDate && <span style={{ color: '#FF0000' }}>{errors.endDate}</span>}
                          </div>
                          <Icon tiny>autorenew</Icon>
                          {errors && errors?.startDate && (
                            <label style={{ color: '#FF0000', paddingLeft: '10px' }}>{errors.startDate}</label>
                          )}
                        </ContentDate>
                      </div>
                      <DivDetalhe>
                        <SaibRadioGroup
                          valueItems={'"0","1","2"'}
                          classNameItems={'"todos","supervisor","promotor"'}
                          textItems={'"Todos","Supervisor","Promotor"'}
                          idItems={'"all","supervisor","promotor"'}
                          classNameRadio="filterProfessionalType"
                          flexDirectionRadio="row"
                          disabledRadio="false"
                          captionRadio="Tipo de profissional"
                          defaultCheckedId={'all'}
                          onChange={(value) => {
                            this.setState(
                              {
                                professionalType: value,
                              },
                              () => this.updateUsersList()
                            );
                          }}
                        />
                      </DivDetalhe>
                    </Linha>
                    <Linha className="topLine">
                      <DivDetalhe flex={3}>
                        <Labels>Usuários</Labels>
                        <Select
                          isMulti
                          name="colors"
                          options={usersData?.map((item) => ({
                            value: item.USR_ID,
                            label: item.USR_NOME,
                          }))}
                          className="basic-multi-select"
                          classNamePrefix="select"
                          closeMenuOnSelect={false}
                          onChange={this.handleChangeUsers}
                          placeholder="Selecione os usuários"
                          components={{
                            DropdownIndicator: (props) => <Icon>arrow_drop_down</Icon>,
                          }}
                          styles={customStyles}
                        />
                      </DivDetalhe>
                    </Linha>
                    <Linha className="topLine">
                      <div
                        style={{
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'flex-end',
                          textDecoration: 'none',
                        }}
                      >
                        {renderReportButton && (
                          <a
                            className="saib-button is-call-to-action"
                            href={reportData}
                            onClick={() => this.setState({ renderReportButton: false })}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                              <Icon>attach_file</Icon> Download
                            </div>
                          </a>
                        )}
                        <button
                          className="saib-button is-primary"
                          style={{ margin: '0px 20px' }}
                          onClick={async () => await this.getReports()}
                        >
                          <Icon>priority_high</Icon>
                          <span>Processar</span>
                        </button>
                      </div>
                    </Linha>
                  </>
                </CollapsibleItem>
              </Collapsible>
            </Linha>
          </>
        </Container>
      </div>
    );
  }
}

const CustomCalendarInput = forwardRef(({ value, onClick }, ref) => (
  <div
    style={{
      cursor: 'pointer',
      marginLeft: '10px',
      display: 'flex',
      alignItems: 'center',
    }}
    onClick={onClick}
  >
    <button
      style={{
        backgroundColor: 'transparent',
        border: '0px',
        fontWeight: '700',
      }}
    >
      {value}
    </button>
    <div
      style={{
        cursor: 'pointer',
        display: 'inline-block',
        marginLeft: '8px',
        width: '0',
        height: '0',
        borderTop: '6px solid transparent',
        borderBottom: '6px solid transparent',
        borderLeft: '6px solid rgb(189, 32, 123)',
      }}
    ></div>
  </div>
));

// class ExcelSearchsReports extends Component {
//   render() {
//     return (
//       <ExcelSearchsReportsProvider>
//         <ExcelSearchsReportsComponent {...this.props} />
//       </ExcelSearchsReportsProvider>
//     );
//   }
// }

export default withRouter(ExcelScheduleReports);
