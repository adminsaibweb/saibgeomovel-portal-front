import React, { Component } from 'react';
import moment from 'moment';
import api from '../services/api';
import { getFromStorage } from '../services/auth';
import { alerta } from '../services/funcoes';
const SchedulesContext = React.createContext();

export class SchedulesProvider extends Component {
  state = {
    dayOfMonthSelectedData: [],
    dateSelected: moment()._d,
    filterSchedule: '',
    typeCalendar: '0',
    openCard: false,
    updateSchedule: false,
    collpasibleCalendarLeftBarExpanded: false,
  };

  async componentDidMount() {
    await this.carregarVariaveisEstado();
  }

  carregarVariaveisEstado = async (e) => {
    const sessao = getFromStorage();
    this.setState({
      empresaAtiva: sessao.empresaId,
      usuarioAtivo: sessao.codigoUsuario,
      empresaCfId: sessao.empresaCfId,
      empresaCnpj: sessao.empresaCnpj,
    });
  };

  setExpandedCollapsibleCalendarLeftBar = async () => {
    const { collpasibleCalendarLeftBarExpanded } = this.state;
    this.setState((prevState) => ({
      ...prevState,
      collpasibleCalendarLeftBarExpanded: collpasibleCalendarLeftBarExpanded ? false : true,
    }));
  };

  deleteSchedule = async (id) => {
    try {
      const res = await api.delete(`v1/schedule/${this.state.empresaAtiva}/${this.state.usuarioAtivo}/${id}`);
      const { sucess } = res.data;
      if (sucess) {
        alerta('Agenda deletada com sucesso', 1);
      } else {
        alerta('Erro ao deletar agenda');
      }
    } catch (error) {
      alerta('Erro ao deletar agenda', 2);
    } finally {
      await this.setUpdateSchedule();
    }
  };

  setUpdateSchedule = async () => {
    const { updateSchedule } = this.state;
    this.setState((prevState) => ({
      ...prevState,
      updateSchedule: updateSchedule ? false : true,
    }));
  };

  setOpenCard = async (open) => {
    this.setState((prevState) => ({
      ...prevState,
      openCard: open,
    }));
  };

  setTypeCalendar = async (data) => {
    this.setState((prevState) => ({
      ...prevState,
      typeCalendar: data,
    }));
  };

  setDayOfMonthSelectedData = async (data) => {
    this.setState((prevState) => ({
      ...prevState,
      dayOfMonthSelectedData: data,
    }));
  };

  setDateSelected = async (date) => {
    this.setState((prevState) => ({
      ...prevState,
      dateSelected: date,
    }));
  };

  setFilterSchedule = (data) => {
    this.setState((prevState) => ({
      ...prevState,
      filterSchedule: data,
    }));
  };

  render() {
    const {
      dayOfMonthSelectedData,
      dateSelected,
      filterSchedule,
      typeCalendar,
      openCard,
      updateSchedule,
      collpasibleCalendarLeftBarExpanded,
    } = this.state;
    return (
      <SchedulesContext.Provider
        value={{
          dayOfMonthSelectedData: dayOfMonthSelectedData,
          setDayOfMonthSelectedData: this.setDayOfMonthSelectedData,
          dateSelected: dateSelected,
          setDateSelected: this.setDateSelected,
          setFilterSchedule: this.setFilterSchedule,
          filterSchedule: filterSchedule,
          setTypeCalendar: this.setTypeCalendar,
          typeCalendar: typeCalendar,
          setOpenCard: this.setOpenCard,
          openCard: openCard,
          deleteSchedule: this.deleteSchedule,
          setUpdateSchedule: this.setUpdateSchedule,
          updateSchedule: updateSchedule,
          setExpandedCollapsibleCalendarLeftBar: this.setExpandedCollapsibleCalendarLeftBar,
          collpasibleCalendarLeftBarExpanded,
        }}
      >
        {this.props.children}
      </SchedulesContext.Provider>
    );
  }
}

export default SchedulesContext;
