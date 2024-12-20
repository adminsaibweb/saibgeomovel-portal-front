import React, { Component } from 'react';
import SchedulesContext from '../../../../providers/schedules';
import moment from 'moment';

import {
  Kanban,
  DivBaseKanbanTituloPai,
  KanbanContainer,
  DivBaseKanban,
  LinhaKanban,
  Linha,
  Labels,
} from '../../../../Pages/FieldWork/Schedules/style';
import { Button, Icon } from 'react-materialize';
import { Link } from 'react-router-dom';
import Question from '../../../Globals/Question';
import api from '../../../../services/api';
import { getFromStorage } from '../../../../services/auth';
export default class DayContainer extends Component {
  static contextType = SchedulesContext;

  state = {
    data: [],
    finalizado: [],
    executado: [],
    agendado: []
  };

  componentDidMount() {
    this.prepareData();
    this.carregarVariaveisEstado();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data) {
      this.prepareData();
      let { finalizado, executado, agendado } = this.state;
      finalizado = this.props.finalizado;
      executado = this.props.executado;
      agendado = this.props.agendado;
      this.setState({finalizado, executado, agendado});
    }
  }

  prepareData = () => {
    const { data } = this.props;
    const { dateSelected, setDayOfMonthSelectedData } = this.context;

    const date = moment(dateSelected).format('DD/MM/yyyy');

    if (data && Object.keys(data).length > 0)
      Object.keys(data).every(async (key) => {
        if (key === date) {
          this.setState({
            data: data[key],
          });
          await setDayOfMonthSelectedData(data[key].data);

          return false;
        } else {
          return true;
        }
      });
    else {
      this.setState({
        data: { data: [] },
      });
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


  delScheduleItem = async (gaaId) =>{
    try {
      this.setState({ loading: true });
      const { agendado, empresaAtiva, usuarioAtivo } = this.state;

      let retorno = await api.delete(`/v1/schedule/${empresaAtiva}/${usuarioAtivo}/${gaaId}`);
      let { sucess, data } = retorno.data;
      if (sucess) {
        this.setState({ items: data });
        //console.log(data);
        var agendadoFiltered = agendado.filter((item) => item.GAA_ID !== gaaId);
      }
      this.setState({ loading: false, agendado: agendadoFiltered});
    } catch (error) {
      this.setState({ loading: false });
    }

  }

  render() {
    const { finalizado, executado, agendado } = this.state;
    const { collpasibleCalendarLeftBarExpanded, typeCalendar, dateSelected } = this.context;

    return (
      <LinhaKanban>
        <Kanban cor={'#08703E'}>
          <DivBaseKanbanTituloPai cor={'#08703E'}>:: Agendado</DivBaseKanbanTituloPai>
          <KanbanContainer>
            {agendado !== undefined &&
              agendado.map((schedule, i) => (
                <DivBaseKanban key={i} className="divBaseKanban">
                  <Linha
                    className="linha"
                    style={{
                      padding: '5px 10px 0px 10px',
                      margin: '0px',
                      lineHeight: '0.9rem',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon>date_range</Icon> <p> Data: {schedule.GAA_DTA_AGENDA} </p>
                  </Linha>
                  <Linha
                    className="linha"
                    style={{
                      padding: '5px 10px 0px 10px',
                      margin: '0px',
                      lineHeight: '0.9rem',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon>supervised_user_circle</Icon>{' '}
                    <p>
                      {' '}
                      {schedule.TIPO === 0 ? 'Supervisor: ' : 'Promotor: '} {schedule.USR_NOME}{' '}
                    </p>
                  </Linha>
                  <Linha
                    className="linha"
                    style={{
                      padding: '5px 10px 0px 10px',
                      margin: '0px',
                      lineHeight: '0.9rem',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <p> Qtde agendamento(s): {schedule.QTDE_CLIENTES} </p>
                  </Linha>
                  <Linha
                    className="filter"
                    style={{
                      justifyContent: 'space-between',
                      padding: '0px 2px 10px 2px',
                    }}
                  >
                    <Link
                      className="saib-button is-primary"
                      to={{
                        pathname: '/Schedule',
                        state: {
                          schedules: schedule,
                          action: 'view',
                          typeCalendar,
                          dateSelected,
                          collpasibleCalendarLeftBarExpanded,
                        },
                      }}
                    >
                      <Icon>pageview</Icon>
                    </Link>
                    <Link
                      to={{
                        pathname: '/Schedule',
                        state: {
                          schedules: schedule,
                          action: 'editar',
                          dateSelected,
                          collpasibleCalendarLeftBarExpanded,
                        },
                      }}
                    >
                      <Button title="Alterar" className="saib-button is-primary">
                        <Icon>edit</Icon>Alterar
                      </Button>
                    </Link>
                    <Question
                      iconeBotaoPadrao={<Icon tiny>delete</Icon>}
                      classeBotaoPadrao="waves-effect waves-light saib-button is-primary"
                      textoBotaoPadrao="Apagar"
                      titulo="Apagar agendamento"
                      tituloBotaoSim="Sim"
                      classeBotaoSim="waves-effect waves-light saib-button is-primary modal-action modal-close"
                      tituloBotaoNao="Não"
                      classeBotaoNao="waves-effect waves-light saib-button is-primary modal-action modal-close"
                      larguraDiv="unset"
                      message={
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <Labels fontWeight={600}>
                            Confirma a exclusão do agendamento ?
                          </Labels>
                        </div>
                      }
                      onNo={() => {}}
                      onYes={() => {this.delScheduleItem(schedule.GAA_ID)}}
                    />
                  </Linha>
                </DivBaseKanban>
              ))}
          </KanbanContainer>
        </Kanban>

        <Kanban cor={'#3f51b5'}>
          <DivBaseKanbanTituloPai cor={'#3f51b5'}>:: Executando</DivBaseKanbanTituloPai>
          <KanbanContainer>
            {executado !== undefined &&
              executado.map((schedule, i) => (
                <DivBaseKanban key={i} className="divBaseKanban">
                  <Linha
                    className="linha"
                    style={{
                      padding: '5px 10px 0px 10px',
                      margin: '0px',
                      lineHeight: '0.9rem',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon>date_range</Icon> <p> Data: {schedule.GAA_DTA_AGENDA} </p>
                  </Linha>
                  <Linha
                    className="linha"
                    style={{
                      padding: '5px 10px 0px 10px',
                      margin: '0px',
                      lineHeight: '0.9rem',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon>supervised_user_circle</Icon>{' '}
                    <p>
                      {' '}
                      {schedule.TIPO === 0 ? 'Supervisor: ' : 'Promotor: '} {schedule.USR_NOME}{' '}
                    </p>
                  </Linha>
                  <Linha
                    className="linha"
                    style={{
                      padding: '5px 10px 0px 10px',
                      margin: '0px',
                      lineHeight: '0.9rem',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <p> Qtde agendamento(s): {schedule.QTDE_CLIENTES} </p>
                  </Linha>
                  <Linha
                    className="filter"
                    style={{
                      justifyContent: 'center',
                      paddingBottom: '10px',
                    }}
                  >
                    <Link
                      className="saib-button is-primary"
                      to={{
                        pathname: '/Schedule',
                        state: {
                          schedules: schedule,
                          action: 'view',
                          typeCalendar,
                          dateSelected,
                          collpasibleCalendarLeftBarExpanded,
                        },
                      }}
                    >
                      <Icon>pageview</Icon>Visualizar
                    </Link>
                  </Linha>
                </DivBaseKanban>
              ))}
          </KanbanContainer>
        </Kanban>

        <Kanban cor={'#8E44AD'}>
          <DivBaseKanbanTituloPai cor={'#8E44AD'}>:: Finalizado</DivBaseKanbanTituloPai>
          <KanbanContainer>
            {finalizado !== undefined &&
              finalizado.map((schedule, i) => (
                <DivBaseKanban key={i} className="divBaseKanban">
                  <Linha
                    className="linha"
                    style={{
                      padding: '5px 10px 0px 10px',
                      margin: '0px',
                      lineHeight: '0.9rem',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon>date_range</Icon> <p> Data: {schedule.GAA_DTA_AGENDA} </p>
                  </Linha>
                  <Linha
                    className="linha"
                    style={{
                      padding: '5px 10px 0px 10px',
                      margin: '0px',
                      lineHeight: '0.9rem',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon>supervised_user_circle</Icon>{' '}
                    <p>
                      {' '}
                      {schedule.TIPO === 0 ? 'Supervisor: ' : 'Promotor: '} {schedule.USR_NOME}{' '}
                    </p>
                  </Linha>
                  <Linha
                    className="linha"
                    style={{
                      padding: '5px 10px 0px 10px',
                      margin: '0px',
                      lineHeight: '0.9rem',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <p> Qtde agendamento(s): {schedule.QTDE_CLIENTES} </p>
                  </Linha>
                  <Linha
                    className="filter"
                    style={{
                      justifyContent: 'center',
                      paddingBottom: '10px',
                    }}
                  >
                    <Link
                      className="saib-button is-primary"
                      to={{
                        pathname: '/Schedule',
                        state: {
                          schedules: schedule,
                          action: 'view',
                          typeCalendar,
                          dateSelected,
                          collpasibleCalendarLeftBarExpanded,
                        },
                      }}
                    >
                      <Icon>pageview</Icon>Visualizar
                    </Link>
                  </Linha>
                </DivBaseKanban>
              ))}
          </KanbanContainer>
        </Kanban>
      </LinhaKanban>
    );
  }
}
